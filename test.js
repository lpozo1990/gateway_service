import chai from 'chai';
import request from 'supertest';
const { expect } = chai;
import { isValidIP, app } from './index.js';
import cors from 'cors';




describe('isValidIP', () => {
  it('should return true for a valid IPv4 address', () => {
    const result = isValidIP('192.168.1.1');
    expect(result).to.be.true;
  });

  it('should return false for an invalid IPv4 address', () => {
    const result = isValidIP('256.168.1.1');
    expect(result).to.be.false;
  });

});


describe('GET /gateways', () => {
  it('should return an array of gateways', (done) => {
    request(app)
      .get('/gateways')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('array');
        done();
      });
  });
});


describe('Gateway API Tests', () => {
  beforeEach(async () => {
    await request(app).post('/gateways').send({
      serialNumber: 'GW98765',
      name: 'Test Gateway',
      ipv4: '192.168.0.2',
      devices: [{ uid: 'D123', vendor: 'Device Vendor', status: 'Online' }],
    });
  });


  it('should create a new gateway', async () => {
    const res = await request(app).post('/gateways').send({
      serialNumber: 'GW12345',
      name: 'My Gateway',
      ipv4: '192.168.0.1',
    });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('serialNumber', 'GW12345');
  });

  it('should not create a gateway with invalid data', async () => {
    const res = await request(app).post('/gateways').send({
      serialNumber: 'GW12345',
      name: 'My Gateway',
      ipv4: 'invalid_ip_address',
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Invalid gateway data');
  });

  it('should get a specific gateway by serial number', async () => {
    // First, create a gateway to test the retrieval
    await request(app).post('/gateways').send({
      serialNumber: 'GW98765',
      name: 'Test Gateway',
      ipv4: '192.168.0.2',
    });

    // Now, retrieve the created gateway by serial number
    const res = await request(app).get('/gateways/GW98765');

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('serialNumber', 'GW98765');
    expect(res.body).to.have.property('name', 'Test Gateway');
    expect(res.body).to.have.property('ipv4', '192.168.0.2');
  });

  it('should return a 404 error when getting a non-existent gateway', async () => {
    const res = await request(app).get('/gateways/non_existent_serial_number');
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('error', 'Gateway not found');
  });

  it('should add a new device to the gateway', async () => {
    // First, create a gateway to test adding a device
    await request(app).post('/gateways').send({
      serialNumber: 'GW12345',
      name: 'Test Gateway',
      ipv4: '192.168.0.1',
    });

    // Now, add a device to the created gateway
    const res = await request(app).put('/gateways/GW12345/add-device').send({
      uid: 'D123',
      vendor: 'Device Vendor',
      status: 'Online',
    });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('devices').to.be.an('array').with.lengthOf(1);
    expect(res.body.devices[0]).to.have.property('uid', 'D123');
    expect(res.body.devices[0]).to.have.property('vendor', 'Device Vendor');
    expect(res.body.devices[0]).to.have.property('status', 'Online');
  });

  it('should not add an invalid device to the gateway', async () => {
    // First, create a gateway to test adding an invalid device
    await request(app).post('/gateways').send({
      serialNumber: 'GW12345',
      name: 'Test Gateway',
      ipv4: '192.168.0.1',
    });

    // Now, try to add an invalid device to the created gateway
    const res = await request(app).put('/gateways/GW12345/add-device').send({
      uid: 'D456',
      vendor: '',
      status: 'Offline',
    });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Invalid device data');
  });

  it('should return a 404 error when removing a device from a non-existent gateway', async () => {
    const res = await request(app).delete('/gateways/non_existent_serial_number/remove-device/D123');
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('error', 'Gateway not found');
  });

  it('should remove a device from the gateway', async () => {
    // Now, remove the device from the created gateway
    const res = await request(app).delete('/gateways/GW98765/remove-device/D123');

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('devices').to.be.an('array').with.lengthOf(0);
  });

  it('should return a 404 error when removing a non-existent device', async () => {
    const res = await request(app).delete('/gateways/GW98765/remove-device/non_existent_uid');
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('error', 'Device not found');
  });


});




