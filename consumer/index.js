require('dotenv').config();
const amqplib = require('amqplib');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

(async () => {
  const conn = await amqplib.connect(`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}`, 'heartbeat=60');
  const ch = await conn.createChannel();
  await ch.assertQueue('room', {durable: true});
  ch.prefetch(1);
  ch.consume('room', async function (msg) {
    console.log(msg.content.toString());
    ch.ack(msg, false);
  }, {
    noAck: false
  });
})();