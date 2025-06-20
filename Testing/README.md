# Load Testing

This directory contains files for load testing the application, currently using Locust.

## `locustFile.py`
This file defines the user behavior for load testing the PustakBazzar API.

## Prerequisites
- Python 3.x
- Locust (`pip install locust`)

## Running Load Tests
1. Ensure the backend server is running.
2. Navigate to the `Testing` directory.
3. Run Locust:
   ```bash
   locust -f locustFile.py --host=http://localhost:8000
   ```
   (Replace `--host` with the appropriate backend URL if different).
4. Open your web browser and go to `http://localhost:8089` (or the port Locust indicates).
5. Configure the number of users and spawn rate, then start swarming.

## Test Scenarios
The `locustFile.py` currently includes tests for:
- Fetching all books.
- User registration and login.
- Adding books to cart.
- (Update with more scenarios as they are added to the locust file)
