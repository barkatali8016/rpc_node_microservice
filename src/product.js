const express = require("express");
const { RPCObserver, RPCRequest } = require("./rpc");

const PORT = 9000;

const app = express();

app.use(express.json());
const fakeProductResponse = {
  _id: "yt868tu788734hjhjb42787",
  item: "iphone",
  price: 600,
};
RPCObserver("PRODUCT_RPC", fakeProductResponse);

app.get("/customer", async (req, res) => {
  const requestPayload = {
    customerId: "yt868tu788734hjhjb42787",
  };
  try {
    const responseDate = await RPCRequest("CUSTOMER_RPC", requestPayload);
    return res.status(200).json(responseDate);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});
app.get("/", (req, res) => {
  res.json("Product Service is working.");
});

app.listen(PORT, () => {
  console.log("PRODUCT SERVER IS RUNNING ON PORT " + PORT);
  console.clear();
});
