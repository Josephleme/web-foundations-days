# Library Books Resource REST API Design

## Endpoints

### 1. List All Books
- Method: GET
- Path: /api/books
- Description: Retrieves a complete list of all book records available within the library inventory database.
- Success Status Code: 200 OK

### 2. Get One Book
- Method: GET
- Path: /api/books/:id
- Description: Retrieves detailed information for a single specific library book matching the unique path parameters ID.
- Success Status Code: 200 OK

### 3. Create a Book
- Method: POST
- Path: /api/books
- Description: Appends a new book entry record directly into the global collection database index.
- Request Body Example:
  ```json
  {
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "isbn": "978-0261102217",
    "publishedYear": 1937
  }
  ```
- Success Status Code: 201 Created

### 4. Update a Book
- Method: PUT
- Path: /api/books/:id
- Description: Modifies structural attributes of an active book entity database element lookup by its target resource identifier.
- Request Body Example:
  ```json
  {
    "title": "The Hobbit: Special Edition",
    "author": "J.R.R. Tolkien",
    "isbn": "978-0261102217",
    "publishedYear": 1937
  }
  ```
- Success Status Code: 200 OK

### 5. Delete a Book
- Method: DELETE
- Path: /api/books/:id
- Description: Erases a book record matching the explicit targeting ID query directly from system records.
- Success Status Code: 200 OK

### 6. List Books by Author
- Method: GET
- Path: /api/books
- Description: Filters the library catalog collections using a designated URL query matching string parameters.
- Query Parameter Syntax: /api/books?author=Tolkien
- Success Status Code: 200 OK

## Error Handling Specifications

- 400 Bad Request
   Trigger Event Example: Happens when attempting to invoke a POST or PUT schema tracking action without including mandatory validation components in the JSON payload (e.g., missing the "title" property entirely from the structural request body).
- 404 Not Found
   Trigger Event Example: Happens when a client queries an explicit lookup action targeted toward a book object entry identifier that is missing or has been deleted from records entirely (e.g., attempting a lookup targeting GET /api/books/999999).
