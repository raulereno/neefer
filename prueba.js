const fetch = require("node-fetch");

const url =
  "https://staging.crossmint.com/api/2022-06-09/collections/default-solana/nfts";
const options = {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-client-secret": "sk_test.i9f7CYrR.6eGjty29HydOTEAiZAVxHEgVzhMqW8ub",
    "x-project-id": "07bbbdba-7eda-4e75-bfcb-ce279c7e312a",
  },
};

fetch(url, options)
  .then((res) => res.json())
  .then((json) => console.log(json))
  .catch((err) => console.error("error:" + err));
