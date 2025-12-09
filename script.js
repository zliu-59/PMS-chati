const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chipButtons = document.querySelectorAll(".chip");

let isSending = false;
let typingRow = null;

// 删除模型前缀 “Output of Anthropic”
function cleanAnswer(text) {
  if (!text) return "";
  return text.replace(/^Output of Anthropic\s*/i, "");
}

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

// 移除 typing 行
function removeTyping() {
  if (typingRow && typingRow.parentNode) {
    typingRow.parentNode.removeChild(typingRow);
  }
  typingRow = null;
}

// 发送到后端 /api/chat
async function sendToServer(text) {
  if (!text.trim() || isSending) return;
  isSending = true;

  addMessage(text, "user");
  inputEl.value = "";
  showTyping();

  try {
    const res = await fetch("/api/chat", {
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

    // 基础清洗：去掉 markdown 标题 / 粗体 / 脚注
    answer = answer
      ?.replace(/^#+\s*/gm, "")          // # / ## / ###
      ?.replace(/\*\*(.*?)\*\*/g, "$1")  // **粗体**
      ?.replace(/\[\^[^\]]+\]/g, "")     // [^123.1.1]
      ?.trim();

    // 额外清洗：删除 “Output of Anthropic”
    answer = cleanAnswer(answer);

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


