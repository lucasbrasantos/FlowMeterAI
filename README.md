# FlowMeterAI
- FlowMeterAI - is an AI-powered application that automates the reading of water and gas consumption meters through image analysis, providing real-time data processing and accurate measurements.

## Usage

### Prerequisites

Ensure you have the following installed:

- Docker

### Setup

1. **Clone the Repository**

   ```sh
   git clone https://github.com/lucasbrasantos/FlowMeterAI.git
   cd FlowMeterAI
   ```

2. **Build and Start the Containers**

   Build and start the Docker containers using Docker Compose:

   ```sh
   docker-compose up --build
   ```

   This command will build the Docker images for the Node.js application and PostgreSQL database, then start the containers.


### Stopping the Application

To stop the Docker containers, use the following command:

```sh
docker-compose down
```

This will stop and remove the containers, but the database data will persist.

### Additional Notes

- Ensure Docker and Docker Compose are up-to-date to avoid compatibility issues.
- Adjust environment variables and configuration in `docker-compose.yml` and `.env` files as needed for different environments.
   

## API Endpoints

### 1. **POST /upload**

Uploads an image of a water or gas meter, processes it to extract the reading, and stores the information.

- **Request Body**:
  - `customer_code`: Unique identifier for the customer (required).
  - `measure_datetime`: Date and time of the measurement (format: YYYY-MM-DDTHH:MM:SS, optional).
  - `measure_type`: Type of meter ("WATER" or "GAS", required).
  - `image`: The image file (sent as form-data with key `image`, required).

- **Response**:
  - **200 OK**: Returns the URI of the uploaded image and the extracted measurement.
  - **400 Bad Request**: If any required fields are missing or invalid.
  - **409 Conflict**: If a measurement for this customer and type already exists for the current month.
  - **500 Internal Server Error**: If the upload or processing fails.

### 2. **GET /:customer_code/list**

Retrieves a list of measurements for a specific customer.

- **URL Parameters**:
  - `customer_code`: The unique identifier for the customer (required).

- **Query Parameters**:
  - `measure_type` (optional): Type of measurement to filter by ("WATER" or "GAS").

- **Response**:
  - **200 OK**: Returns a list of measurements for the given customer code.
  - **400 Bad Request**: If the `measure_type` is invalid.
  - **404 Not Found**: If no measurements are found for the given customer code.
  - **500 Internal Server Error**: If there is an issue retrieving the measurements.

### 3. **PATCH /confirm**

Confirms or updates the measurement value for a given reading.

- **Request Body**:
  - `measure_uuid`: UUID of the measurement to be updated (required).
  - `confirmed_value`: The confirmed or corrected value of the measurement (required).

- **Response**:
  - **200 OK**: Indicates successful confirmation or update.
  - **400 Bad Request**: If the request body is invalid or the measurement does not exist.
  - **404 Not Found**: If the measurement UUID does not exist.
  - **409 Conflict**: If the measurement has already been confirmed.
  - **500 Internal Server Error**: If the update or confirmation fails.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

