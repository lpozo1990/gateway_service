const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const app = express();
const PORT = 3000; 


app.use(cors()); 
app.use(bodyParser.json());

// In-memory database to store gateways and devices
const gatewayDatabase = {
  gateways: [],
};

function isValidIP(ip) {
  return true; // Placeholder validation for simplicity
}

function isValidPeripheralDevice(device) {
  // You can add more validation logic here if needed
  return typeof device.vendor === 'string' && device.vendor.trim().length > 0;
}

function isGatewayValid(gateway) {
  if (!isValidIP(gateway.ipv4)) {
    return false;
  }

  if (gateway.devices && gateway.devices.length > 10) {
    return false;
  }

  if (gateway.devices) {
    return gateway.devices.every(isValidPeripheralDevice);
  }

  return true;
}

// Routes
app.get('/gateways', (req, res) => {
  res.json(gatewayDatabase.gateways);
});

app.post('/gateways', (req, res) => {
  const gateway = req.body;
  if (!isGatewayValid(gateway)) {
    return res.status(400).json({ error: 'Invalid gateway data' });
  }

  gatewayDatabase.gateways.push(gateway);
  res.status(201).json(gateway);
});

app.get('/gateways/:serialNumber', (req, res) => {
  const { serialNumber } = req.params;
  const gateway = gatewayDatabase.gateways.find((g) => g.serialNumber === serialNumber);
  if (!gateway) {
    return res.status(404).json({ error: 'Gateway not found' });
  }

  res.json(gateway);
});

app.put('/gateways/:serialNumber/add-device', (req, res) => {
  const { serialNumber } = req.params;
  const device = req.body;

  if (!isValidPeripheralDevice(device)) {
    return res.status(400).json({ error: 'Invalid device data' });
  }

  const gateway = gatewayDatabase.gateways.find((g) => g.serialNumber === serialNumber);
  if (!gateway) {
    return res.status(404).json({ error: 'Gateway not found' });
  }

  if (!gateway.devices) {
    gateway.devices = [];
  }

  if (gateway.devices.length >= 10) {
    return res.status(400).json({ error: 'Gateway has reached the maximum number of devices' });
  }

  gateway.devices.push(device);
  res.status(201).json(gateway);
});

app.delete('/gateways/:serialNumber/remove-device/:uid', (req, res) => {
  const { serialNumber, uid } = req.params;
  const gateway = gatewayDatabase.gateways.find((g) => g.serialNumber === serialNumber);
  if (!gateway) {
    return res.status(404).json({ error: 'Gateway not found' });
  }

  if (!gateway.devices) {
    return res.status(404).json({ error: 'No devices associated with the gateway' });
  }

  const deviceIndex = gateway.devices.findIndex((device) => device.uid === uid);
  if (deviceIndex === -1) {
    return res.status(404).json({ error: 'Device not found' });
  }

  gateway.devices.splice(deviceIndex, 1);
  res.status(200).json(gateway);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
