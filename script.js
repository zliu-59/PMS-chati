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

  // 显示用户消息
  addMessage(text, "user");
  inputEl.value = "";
  inputEl.focus();

  // 显示 typing
  showTyping();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    console.log("API response:", data);

    let answer = "";

    // StackAI 的标准输出：data.outputs.{某个 key}
    if (data.outputs && typeof data.outputs === "object") {
      const firstKey = Object.keys(data.outputs)[0];
      answer = data.outputs[firstKey];
    } else {
      // 兼容其它字段名
      answer = data.output_text || data.output || data.answer || JSON.stringify(data);
    }

    // 简单清洗：去掉 markdown 标题 & 脚注
    if (typeof answer === "string") {
      answer = answer
        .replace(/^#.*\n/, "")          // 去掉第一行 # 标题
        .replace(/\[\^[^\]]+\]/g, "")   // 去掉脚注 [^xxx]
        .trim();
    }

    removeTyping();
    addMessage(
      answer || "I’m here with you, but I didn’t get a response this time. 💗",
      "bot"
    );
  } catch (err) {
    console.error("Client error:", err);
    removeTyping();
    addMessage(
      "Something went wrong while connecting to Chati. You can try again in a moment. 💗",
      "bot"
    );
  } finally {
    isSending = false;
  }
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


