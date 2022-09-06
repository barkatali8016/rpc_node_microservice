const express = require("express");
const { RPCObserver, RPCRequest } = require("./rpc");
const PORT = 9001;

const app = express();

app.use(express.json());
const fakeCuctomerResponse = {
  _id: "yt868tu788734hjhjb42787",
  name: "Barkat Ali",
  country: "India",
};
RPCObserver("CUSTOMER_RPC", fakeCuctomerResponse);
app.get("/wishlist", async (req, res) => {
  const requestPayload = {
    productId: "123456",
    customerId: "yt868tu788734hjhjb42787",
  };
  try {
    const responseDate = await RPCRequest("PRODUCT_RPC", requestPayload);
    return res.status(200).json(responseDate);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});
app.get("/", (req, res) => {
  res.json("CUSTOMER SERVICE IS WORKING ");
});

app.listen(PORT, () => {
  console.log("CUSTOMER SERVER IS RUNNING ON PORT " + PORT);
  console.clear();
});
