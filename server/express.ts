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

  // Create an access token for the user
  const at = new AccessToken(KEY, SECRET, {
    identity: username,
    ttl: "1h", // Token valid for 1 hour
  });

  // See all options at: https://docs.livekit.io/frontends/reference/tokens-grants/#video-grant
  const vidGrant: VideoGrant = {
    roomJoin: true,
    room: "example-room", // For demonstration purposes; this may vary based on your application
    canPublish: true,
    canSubscribe: true,
    canPublishData: true
  };
  at.addGrant(vidGrant);

  // Generate a JWT token to be used by the client to connect to LiveKit
  const jwt = await at.toJwt();
  res.json({ token: jwt });
})

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
