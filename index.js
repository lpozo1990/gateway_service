import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

export const app = express();
const PORT = 3000; 


app.use(cors()); 
app.use(bodyParser.json());

// In-memory database to store gateways and devices
const gatewayDatabase = {
  gateways: [],
};

export function isValidIP(ip) {
  // Regular expression pattern for IPv4 address validation
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;

  // Check if the IP address matches the pattern
  if (ipv4Pattern.test(ip)) {
    // Split the IP address into its parts (octets)
    const octets = ip.split('.');

    // Check each octet for valid range (0-255)
    for (const octet of octets) {
      const octetValue = parseInt(octet, 10);
      if (isNaN(octetValue) || octetValue < 0 || octetValue > 255) {
        return false;
      }
    }

    return true;
  }

  return false;
}


function isValidPeripheralDevice(device) {
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
