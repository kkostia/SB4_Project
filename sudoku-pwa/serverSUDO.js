const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

app.post("/api", async (req, res) => {
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
    console.log("[proxy] puzzle fetched for difficulty:", difficulty);
    res.json(data);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("Proxy running on http://localhost:3001"));