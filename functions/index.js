const { onRequest } = require("firebase-functions/v2/https");
const fetch = require("node-fetch");

exports.api = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { difficulty } = req.body;

  try {
    const response = await fetch(
      `https://www.youdosudoku.com/api/?difficulty=${difficulty}&solution=true&array=true`,
      {
        method: "GET",
        headers: {
          "x-api-key": "IxB8ACbEJpPvJZEVr-tU-N7zwqAHyJ3IYkT5ctkxjxA",
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
