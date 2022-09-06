const amqplib = require("amqplib");
const { v4: uuid4 } = require("uuid");
let amqplibConnection = null;

const getChannel = async () => {
  if (amqplibConnection === null) {
    amqplibConnection = await amqplib.connect("amqp://localhost");
  }
  return await amqplibConnection.createChannel();
};
const expensiveDBOperation = async (payload, fakeResponse) => {
  console.log(payload);
  console.log(fakeResponse);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(fakeResponse);
    }, 3000);
  });
};

const RPCObserver = async (RPC_QUEUE_NAME, fakeResponse) => {
  const channel = await getChannel();

  await channel.assertQueue(RPC_QUEUE_NAME, { durable: false });
  channel.prefetch(1);
  channel.consume(
    RPC_QUEUE_NAME,
    async (msg) => {
      if (msg.content) {
        const payload = JSON.parse(msg.content.toString());
        // DB OPERATION
        const response = await expensiveDBOperation(payload, fakeResponse);
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(response)),
          {
            correlationId: msg.properties.correlationId,
          }
        );
        channel.ack(msg);
      }
    },
    {
      noAck: false,
    }
  );
};
const requestData = async (RPC_QUEUE_NAME, requestPayload, uuid) => {
  const channel = await getChannel();
  const q = await channel.assertQueue("", { exclusive: true });

  channel.sendToQueue(
    RPC_QUEUE_NAME,
    Buffer.from(JSON.stringify(requestPayload)),
    {
      replyTo: q.queue,
      correlationId: uuid,
    }
  );

  return new Promise((resolve, reject) => {
    // timeout n
    const timer = setTimeout(() => {
      channel.close();
      resolve({ error: "API could not fullfil the request, request time out" });
    }, 8000);
    channel.consume(
      q.queue,
      (msg) => {
        if (msg.properties.correlationId === uuid) {
          resolve(JSON.parse(msg.content.toString()));
          clearTimeout(timer);
        } else {
          reject({ error: "Data not found" });
        }
      },
      {
        noAck: true,
      }
    );
  });
};

const RPCRequest = async (RPC_QUEUE_NAME, requestPayload) => {
  const uuid = uuid4();

  const response = await requestData(RPC_QUEUE_NAME, requestPayload, uuid);
  return response;
};

module.exports = {
  RPCObserver,
  RPCRequest,
  getChannel,
};
