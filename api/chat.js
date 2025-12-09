export default async function handler(req, res) {
  // 允许 CORS（如果需要）
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

    // 检查环境变量
    if (!process.env.STACKAI_API_KEY) {
      console.error("STACKAI_API_KEY is not set");
      return res.status(500).json({ error: "API key not configured" });
    }

    console.log("Sending to Stack AI:", message);

    const response = await fetch(
      "https://www.stack-ai.com/inference/v0/run/c950d119-41b7-4233-91b9-953fbb0e994d/69134a20fcf945f75751a93b",
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

    console.log("Stack AI response status:", response.status);

    // 先获取文本，再尝试解析 JSON
    const responseText = await response.text();
    console.log("Stack AI raw response:", responseText);

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: "Stack AI error", 
        status: response.status,
        details: responseText 
      });
    }

    // 尝试解析 JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return res.status(500).json({ 
        error: "Invalid JSON response from Stack AI",
        rawResponse: responseText.substring(0, 200) // 只返回前200字符
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}
