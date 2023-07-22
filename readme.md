# Gateway Service API

This is a REST service for storing information about gateways and their associated devices.

## Requirements

- Node.js (https://nodejs.org) installed on your system.

## Installation

1. Clone this repository to your local machine:

git clone https://github.com/lpozo1990/gateway_service.git



2. Navigate to the project directory:

cd gateway-service



3. Install dependencies using npm:

npm install

## Usage

1. Start the server using Nodemon:

npm start

The server will run on http://localhost:3000.

2. Interact with the API using tools like Postman (https://www.postman.com/downloads/) or your preferred HTTP client.

## Endpoints

- **GET /gateways**: Get information about all stored gateways and their devices.
- **POST /gateways**: Store a new gateway in the database.
- **GET /gateways/:serialNumber**: Get details for a specific gateway.
- **PUT /gateways/:serialNumber/add-device**: Add a new device to a gateway.
- **DELETE /gateways/:serialNumber/remove-device/:uid**: Remove a device from a gateway.

## Models

### Gateway

- `serialNumber` (string) - The unique serial number of the gateway.
- `name` (string) - Human-readable name of the gateway.
- `ipv4` (string) - The IPv4 address of the gateway.
- `devices` (array) - An array of associated peripheral devices.

### Peripheral Device

- `uid` (number) - The unique identifier of the peripheral device.
- `vendor` (string) - The vendor of the peripheral device.
- `dateCreated` (string) - The date the peripheral device was created.
- `status` (string) - The status of the peripheral device (online/offline).

## License

This project is licensed under the [MIT License](LICENSE).