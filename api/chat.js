export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    const response = await fetch(
      "https://www.stack-ai.com/inference/v0/run/c950d119-41b7-4233-91b9-953fbb0e994d/69134a20fcf945f75751a93b",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.STACKAI_API_KEY}`,
        },
        body: JSON.stringify({
          "in-0": message,  // ⬅️ Stack AI 通常用这个格式
          "user_id": "user-1"
        })
      }
    );

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
