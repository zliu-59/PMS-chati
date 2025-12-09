const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chipButtons = document.querySelectorAll(".chip");

let isSending = false;
let typingRow = null;


// 添加聊天气泡
function addMessage(text, role = "bot") {
  const row = document.createElement("div");
  row.className = `message-row ${role}`;

  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;

  row.appendChild(bubble);
  chatEl.appendChild(row);
  chatEl.scrollTop = chatEl.scrollHeight;
}

// 显示 “Chati is typing...”
function showTyping() {
  removeTyping();

  const row = document.createElement("div");
  row.className = "message-row bot";

  const wrap = document.createElement("div");
  wrap.className = "bubble bot";
  wrap.innerHTML = `
    Chati is typing
    <span class="typing-indicator">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </span>
  `;

  row.appendChild(wrap);
  chatEl.appendChild(row);
  chatEl.scrollTop = chatEl.scrollHeight;

  typingRow = row;
}

// 发送到后端 /api/chat
async function sendToServer(text) {
  if (!text.trim() || isSending) return;
  isSending = true;

  addMessage(text, "user");
  inputEl.value = "";
  showTyping();

  try {
    const res = await fetch("/api/chat", {   // ✅ 只写 /api/chat
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();

    let answer = "";

    if (data.outputs) {
      const firstKey = Object.keys(data.outputs)[0];
      answer = data.outputs[firstKey];
    } else {
      answer = data.output_text || data.answer || JSON.stringify(data);
    }

    answer = answer
  // 删掉所有行首的 # / ## / ### 标题符号
  ?.replace(/^#+\s*/gm, "")
  // 去掉 **粗体** 符号
  ?.replace(/\*\*(.*?)\*\*/g, "$1")
  // 去掉脚注标记 [^123.1.1]
  ?.replace(/\[\^[^\]]+\]/g, "")
  // 收尾空白
  ?.trim();



    removeTyping();
    addMessage(
      answer || "I’m here with you, but I didn’t get a response. 💗",
      "bot"
    );

  } catch (err) {
    console.error(err);
    removeTyping();
    addMessage("Something went wrong. Please try again. 💗", "bot");
  }

  isSending = false;
}


// 点击发送按钮
function handleSend() {
  const text = inputEl.value;
  if (!text.trim()) return;
  sendToServer(text);
}

// 事件绑定
sendBtn.addEventListener("click", handleSend);

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSend();
  }
});

// quick chips 也走同一套逻辑
chipButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const text = btn.getAttribute("data-text") || btn.textContent;
    sendToServer(text);
  });
});

