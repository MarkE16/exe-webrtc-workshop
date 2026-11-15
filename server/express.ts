import { AccessToken } from "livekit-server-sdk";
import type { VideoGrant } from "livekit-server-sdk";
import express from "express";

// The API key and secret for your LiveKit deployment
// Note that they're set here as constants for the workshop,
// but you should securely store them in environment variables in a real application.
const KEY = "";
const SECRET = "";

const app = express();
const PORT = 3000;

app.use((_req, res, next) => {
  // handle cors for local development
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/token", async (req, res) => {
  const username = req.query.username as string;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }


})

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
