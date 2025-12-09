export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.STACKAI_API_KEY) {
      console.error("STACKAI_API_KEY not set");
      return res.status(500).json({ error: "API key not configured" });
    }

    console.log("Sending to Stack AI:", message);

    const response = await fetch(
      "https://api.stack-ai.com/inference/v0/run/c950d119-41b7-4233-91b9-953fbb0e994d/69134a20fcf945f75751a93b",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.STACKAI_API_KEY}`,
        },
        body: JSON.stringify({
          "in-0": message,
          "user_id": "user-" + Date.now()
        })
      }
    );

    const responseText = await response.text();
    console.log("Stack AI response:", responseText.substring(0, 200));

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: "Stack AI error", 
        details: responseText 
      });
    }

    const data = JSON.parse(responseText);
    return res.status(200).json(data);

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: err.message
    });
  }
}
