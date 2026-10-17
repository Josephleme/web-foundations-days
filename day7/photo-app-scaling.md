# SnapShare Scaling Plan

## 1. Assumptions and Core Metrics
- Registered Users: 10,000,000
- Daily Active Users (DAU): 1,000,000 (10% of registered users)
- Daily Uploads: 1,000,000 photos per day (1 photo per active user)
- Daily Feed Views: 50,000,000 pages per day (50 views per active user)
- Average Photo File Size: 2 MB
- Thumbnail File Size: 50 KB

## 2. Traffic and Storage Calculations

### Uploads Per Second
- Average Uploads Per Second = 1,000,000 photos / 86,400 seconds = 11.57 uploads/sec
- Peak Uploads Per Second (5x multiplier) = 11.57 * 5 = 57.87 uploads/sec

### Feed Views Per Second
- Average Feed Views Per Second = 50,000,000 views / 86,400 seconds = 578.70 views/sec
- Peak Feed Views Per Second (5x multiplier) = 578.70 * 5 = 2,893.50 views/sec

### Photo Storage Per Year
- Storage Per Photo Entry = 2 MB original + 0.05 MB thumbnail = 2.05 MB per upload
- Daily Storage Required = 1,000,000 * 2.05 MB = 2,050,000 MB = 2.05 TB/day
- Annual Storage Required = 2.05 TB * 365 days = 748.25 TB/year

## 3. System Characteristics and Database Strategy
- System Workload: Read-heavy system.
- Impact on Design: The app handles 50 times more read requests (feed views) than write requests (uploads), meaning the infrastructure must prioritize aggressive caching strategies and read-replica distribution to offload traffic from the primary transactional database database.
- File Storage Location Strategy: Raw binary photo files must not be stored inside the database because unstructured BLOB data balloons backup sizes, degrades indexing performance, and scales poorly. Instead, photos must be stored in a dedicated Object Storage system, leaving the database to only track lightweight metadata records and file URL links.

## 4. System Architecture Diagram

```text
                  [ User Client ]
                         |
                         v
                  [     CDN     ]
                         |
                         v
                  [Load Balancer]
                         |
                         v
                  [ App Servers ]
                   /     |     \
                  /      |      \
                 v       v       v
         [ Cache ] [Database] [Queue] ---> [Worker]

             |         |                     |
             |         v                     v
             |     (Replica)           [Object Storage]
             \_______________________________/
```

## 5. Component Responsibilities
- CDN: Reduces global latency by caching and serving images from edge locations physically closer to the end users.
- Load Balancer: Distributes incoming user network traffic across multiple application servers to prevent any single instance from overloading.
- App Servers: Executes the programmatic business logic, validates API requests, and coordinates operations between storage and database layers.
- Cache: Stores frequently accessed timeline data and active user session profiles in memory to reduce direct read strains on the database.
- Database: Manages core structured user profiles, follow links, and metadata pointers for uploaded content with transactional integrity.
- Read Replica: Scales read capacity by handling feed generation queries independently from the primary database instance.
- Object Storage: Provides highly durable, cost-effective flat storage capacity optimized specifically for large unstructured image files.
- Queue: Buffers asynchronous event tasks safely to decouple photo upload completions from processing pipelines.
- Worker: Consumes data from the message queue to independently transform, compress, and save required image thumbnail sizes.

## 6. Photo Upload Execution Flow
- 1. The client sends a POST request containing the raw 2 MB image file along with user authentication data to the app server through the load balancer.
- 2. The app server writes the original 2 MB image directly to Object Storage and receives a unique file URL string back.
- 3. The app server writes a metadata entry into the primary database containing the student ID, creation timestamp, and the image URL pointer.
- 4. The app server pushes an event message containing the metadata context into the message queue and immediately returns a 201 success response to the client.
- 5. An isolated background worker pulls the task from the queue, fetches the 2 MB asset from object storage, scales it down to a 50 KB thumbnail file, and saves the new asset back into object storage.
- 6. The worker updates the corresponding database record row to append the newly generated thumbnail asset URL location.

## 7. Architecture Trade-offs
- Asynchronous Thumbnail Generation vs. Real-Time Processing: Using an asynchronous worker queue keeps upload response times incredibly fast for users, but it introduces eventual consistency where followers might see a placeholder card or broken asset link in their feed for a few seconds before the background thumbnail task completes.
- Cache Aggression vs. Memory Costs: Maintaining comprehensive feed caches in memory significantly reduces database load and yields lightning-fast page renders, but it requires substantial RAM investments and introduces cache invalidation challenges when users suddenly change follow parameters.
