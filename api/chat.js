export default async function handler(req, res) {
  // 允许 CORS
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

    console.log("📤 Sending to Stack AI:", message);

    const response = await fetch(
      "https://api.stack-ai.com/inference/v0/run/c950d119-41b7-4233-91b9-953fbb0e994d/69134a20fcf945f75751a93b",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.STACKAI_API_KEY}`,
        },
        body: JSON.stringify({
          "in-0": message,  // ✅ 对应 Stack AI 的 "Question" 输入
          "user_id": "user-" + Date.now()
        })
      }
    );

    console.log("📥 Stack AI status:", response.status);

    // 获取响应文本
    const responseText = await response.text();
    console.log("📄 Raw response:", responseText.substring(0, 300));

    if (!response.ok) {
      console.error("❌ Stack AI error:", responseText);
      return res.status(response.status).json({ 
        error: "Stack AI API error", 
        status: response.status,
        details: responseText 
      });
    }

    // 解析 JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("✅ Parsed data:", JSON.stringify(data).substring(0, 200));
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      return res.status(500).json({ 
        error: "Invalid JSON from Stack AI",
        rawResponse: responseText.substring(0, 300)
      });
    }

    // 提取 out-0 字段的内容
    if (data.outputs && data.outputs["out-0"]) {
      return res.status(200).json({
        outputs: {
          "out-0": data.outputs["out-0"]
        }
      });
    }

    // 如果格式不对，返回原始数据
    return res.status(200).json(data);

  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: err.message
    });
  }
}
