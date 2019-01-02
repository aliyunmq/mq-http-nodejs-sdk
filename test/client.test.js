'use strict';

const expect = require('expect.js');

const {
  MQClient
} = require('../');

const ENDPOINT = process.env.ENDPOINT || 'endpoint';
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID || 'accessKeyId';
const ACCESS_KEY_SECRET = process.env.ACCESS_KEY_SECRET || 'accessKeySecret';

console.log('%s %s %s', ENDPOINT, ACCESS_KEY_ID, ACCESS_KEY_SECRET);

describe('mq client test', function () {
  it('constructor', function () {
    expect(() => {
      new MQClient();
    }).to.throwException(/"endpoint" must be passed in/);

    expect(() => {
      new MQClient('endpoint');
    }).to.throwException(/must pass in "accessKeyId"/);

    expect(() => {
      new MQClient('endpoint', 'accessKeyId');
    }).to.throwException(/must pass in "accessKeySecret"/);
  });


  it('sign', function() {
    const client = new MQClient('endpoint', 'ACCESS_KEY_ID', 'ACCESS_KEY_SECRET');
    var sign = client.sign('PUT', {
      'content-md5': '574683b3684e3cff610afa155cc2506d',
      'date': 'Tue, 11 Apr 2017 10:09:19 GMT',
      'content-type': 'text/xml',
      'x-mq-version': '2015-06-06'
    }, '/');
    expect(sign).to.be('G7NRBqmP9XfhTJ/pV3AgYQtXaaU=');
  });

  describe('API should ok', function () {
    const groupId = 'GID-abc';
    const topicName = 'abc';
    const instanceId = '';

    const client = new MQClient(ENDPOINT, ACCESS_KEY_ID, ACCESS_KEY_SECRET);
    const producer = client.getProducer(instanceId, topicName);
    const consumer = client.getConsumer(instanceId, topicName, groupId);
    
    it('publishMessage should ok', async function() {
      const response = await producer.publishMessage('test message');
      expect(response).to.be.ok();
      expect(response.code).to.be(201);
      const message = response.body;
      expect(message).to.have.property('MessageId');
      expect(message).to.have.property('MessageBodyMD5');
    });

    it('publishMessage should ok', async function() {
      const response = await producer.publishMessage('test message');
      expect(response).to.be.ok();
      expect(response.code).to.be(201);
      const message = response.body;
      expect(message).to.have.property('MessageId');
      expect(message).to.have.property('MessageBodyMD5');
    });


    it('consumeMessage&ackMessage shoule ok', async function() {
      const recived = await consumer.consumeMessage(2, 3);
      expect(recived).to.be.ok();
      expect(recived.code).to.be(200);
      const receiptHandles = recived.body.map((item) => {
        expect(item).to.have.property('MessageId');
        expect(item).to.have.property('MessageBodyMD5');
        expect(item).to.have.property('MessageBody');
        expect(item).to.have.property('ReceiptHandle');
        expect(item).to.have.property('PublishTime');
        expect(item).to.have.property('FirstConsumeTime');
        expect(item).to.have.property('NextConsumeTime');
        expect(item).to.have.property('ConsumedTimes');
        return item.ReceiptHandle;
      });
      const res = await consumer.ackMessage(receiptHandles);
      expect(res).to.be.ok();
      expect(res.code).to.be(204);
    });
    
    it('ackMessage handle is illegal should ok', async function() {
      const handles = ['adfadfadfadf', 'xxxxx'];
      const res = await consumer.ackMessage(handles);
      expect(res).to.be.ok();
      expect(res.code).to.be(404);
      res.body.map((item) => {
        expect(item).to.have.property('ErrorCode');
        expect(item).to.have.property('ErrorMessage');
        expect(item).to.have.property('ReceiptHandle');
        expect(item.ErrorCode).to.be('ReceiptHandleError');
      });
    });

    it('publishMessage should ok', async function() {
      const response = await producer.publishMessage('test message');
      expect(response).to.be.ok();
      expect(response.code).to.be(201);
      const message = response.body;
      expect(message).to.have.property('MessageId');
      expect(message).to.have.property('MessageBodyMD5');
    });
  });
});
