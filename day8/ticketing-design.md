# TicketHub System Architecture Design Document

## 1. Requirements

### Functional Requirements
- Users must be able to browse a list of live events and filter them by date or location.
- Users must be able to view a real-time map of available seats for a specific event.
- Users must be able to hold a selected seat for up to 10 minutes while completing checkout.
- Users must be able to securely pay for held tickets and receive a definitive digital order voucher.

### Non-Functional Requirements
- Correctness: The system must strictly enforce that no individual seat identifier can be double-booked or sold to two separate accounts.
- Fairness: Ticket access during high-demand sales must follow a first-come, first-served allocation queue without letting automated bots bypass system checks.
- High Availability and Speed: The system must maintain minimal read latency during sudden surge traffic events, ensuring seat maps render quickly even under massive loads.

## 2. Capacity Estimates and Traffic Projections

### Normal Operational Traffic
- Daily Visitors: 50,000 active users per day.
- Page Views: 500,000 views per day (50,000 users * 10 pages).
- Average Page Requests Per Second = 500,000 views / 86,400 seconds = 5.79 requests/sec.
- Daily Ticket Conversions: 5,000 tickets sold per day = 0.057 tickets sold/sec.

### Popular Concert High-Demand Traffic Surge
- Active Users: 200,000 concurrent users arriving simultaneously.
- Targeted Time Window: 10 minutes (600 seconds).
- Ticket Inventory Volume: 20,000 available seats.
- Peak Traffic Request Volume = 200,000 users * 10 pages = 2,000,000 views.
- Peak Page Requests Per Second = 2,000,000 views / 600 seconds = 3,333.33 requests/sec.
- Peak Booking Velocity = 20,000 tickets / 600 seconds = 33.33 successful orders/sec.

### Traffic Comparison Analysis
During a major concert release, page view traffic multiplies by more than 570 times standard baseline patterns (scaling from 5.79 up to 3,333.33 requests per second). The volume of successful transactions spikes from 0.057 tickets per second to a highly compressed load of 33.33 bookings per second, requiring high concurrency management layers at the database tier.

## 3. API Design

### 1. List Active Events
- Method: GET
- Path: /api/events
- Description: Retrieves a paginated catalog list of all upcoming concerts and events.
- Success Status Code: 200 OK

### 2. View Seat Map Availability
- Method: GET
- Path: /api/events/:id/seats
- Description: Fetches the live layout blueprint grid displaying available, held, and sold seats for a target event ID.
- Success Status Code: 200 OK

### 3. Hold Selected Seats
- Method: POST
- Path: /api/bookings/hold
- Description: Places a temporary 10-minute countdown lock on specific seat identifiers for a user session.
- Request Body Example:
  ```json
  {
    "eventId": 101,
    "seatIds": [44, 45]
  }
  ```
- Success Status Code: 201 Created

### 4. Process Secure Payment
- Method: POST
- Path: /api/bookings/pay
- Description: Validates financial transaction data against a held seat order to finalize the booking.
- Request Body Example:
  ```json
  {
    "holdToken": "tok_998877",
    "paymentMethodId": "pm_112233"
  }
  ```
- Success Status Code: 200 OK

### 5. Retrieve Digital Tickets
- Method: GET
- Path: /api/tickets/:orderId
- Description: Fetches confirmation details and generated digital entry passes for a successfully finalized order record.
- Success Status Code: 200 OK

## 4. Data Model

### users
- user_id (INTEGER, Primary Key, AUTOINCREMENT)
- name (TEXT, NOT NULL)
- email (TEXT, NOT NULL, UNIQUE)

### events
- event_id (INTEGER, Primary Key, AUTOINCREMENT)
- title (TEXT, NOT NULL)
- event_date (DATETIME, NOT NULL)
- venue_name (TEXT, NOT NULL)

### seats
- seat_id (INTEGER, Primary Key, AUTOINCREMENT)
- event_id (INTEGER, Foreign Key REFERENCES events(event_id))
- seat_row (TEXT, NOT NULL)
- seat_number (INTEGER, NOT NULL)
- booking_status (TEXT, NOT NULL) - 'AVAILABLE', 'HELD', 'SOLD'
- held_by_user_id (INTEGER, NULLABLE, Foreign Key REFERENCES users(user_id))
- hold_expires_at (DATETIME, NULLABLE)

### orders
- order_id (INTEGER, Primary Key, AUTOINCREMENT)
- user_id (INTEGER, Foreign Key REFERENCES users(user_id))
- event_id (INTEGER, Foreign Key REFERENCES events(event_id))
- total_amount (NUMERIC, NOT NULL)
- purchase_timestamp (DATETIME, NOT NULL)

### Entity Relationships
- Users to Orders: One-to-many relationship. A user can place multiple distinct ticket orders over time.
- Events to Seats: One-to-many relationship. A single concert venue configuration maps onto thousands of specific distinct seat items.
- Orders to Seats: One-to-many relationship. A finalized financial checkout record can encapsulate multiple seat items purchased together.

## 5. Prevention of Double-Booking

To guarantee that absolutely no two users can book or hold the exact same physical seat simultaneously under high-concurrency surge traffic, the architecture utilizes database-level atomic transactions combined with strict conditional constraints. 

When a user attempts to lock a seat, the system opens an isolated ACID transaction block and executes an update query using an explicit state verification clause:

```sql
BEGIN TRANSACTION;
UPDATE seats 
SET booking_status = 'HELD', 
    held_by_user_id = ?, 
    hold_expires_at = datetime('now', '+10 minutes')
WHERE seat_id = ? 
  AND (booking_status = 'AVAILABLE' OR (booking_status = 'HELD' AND hold_expires_at < datetime('now')));
COMMIT;
```

The application layer evaluates the number of rows modified by the database machine. If the row count returns zero, it proves that another user successfully altered the row state milliseconds prior. The transaction fails safely, preventing duplicate booking windows. Furthermore, the combination of `event_id`, `seat_row`, and `seat_number` is protected by a unique composite constraint index across the database table configuration.

## 6. System Architecture

```text
                     [ User Client ]
                            |
                            v
                     [     CDN     ]
                            |
                            v
                     [Traffic Queue]
                            |
                            v
                     [Load Balancer]
                            |
                            v
                     [ App Servers ]
                      /     |     \
                     /      |      \
                    v       v       v
            [ Cache ] [Primary DB] [Payment Gateway]
                            |
                            v
                     [Read Replica]
```

### Component Explanations
- CDN: Serves static web pages, text stylesheets, and event layout visuals at edge nodes to reduce repetitive page load strains on backend servers.
- Traffic Queue: Functions as a rate-limiting buffer token gateway during peak sale events to regulate incoming user traffic bursts before they reach the compute cluster.
- Load Balancer: Route active network request payloads evenly across the cluster matrix nodes to balance machine exhaustion limits cleanly.
- App Servers: Manages core transactional processing rules, computes countdown expirations, evaluates validation models, and issues instructions to data layers.
- Cache: Keeps live event lists and standard seat configuration blueprints in memory to offload repeated queries from structural disks.
- Primary DB: Manages the golden transactional system records, maintaining strict absolute ACID guarantees for seat reservation updates.
- Read Replica: Pulls real-time replicated snapshots from the primary writer instance to handle massive data read inquiries independently.
- Payment Gateway: Communicates with external merchant banks to securely validate customer funds during final invoicing loops.

## 7. Architecture Trade-offs

### Token Virtual Queueing System vs. Direct Server Landing
- Trade-off Choice: Deploying an algorithmic buffer checkpoint queue before the application infrastructure prevents system-wide server crashes during a massive ticket release. The downside is that it degrades the immediate user experience by forcing customers to wait in a virtual loading line for several minutes, sacrificing low-latency response ideals to prioritize overall platform stability.

### Pessimistic Row Locking vs. Optimistic Distributed Caching
- Trade-off Choice: Processing seat allocations through database row transactions ensures flawless consistency and prevents double-booking. However, this architectural choice creates a database bottleneck under heavy traffic, as concurrent requests must wait for lock releases, trading horizontal scaling speed for absolute computational data correctness.
