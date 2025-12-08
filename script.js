const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chipButtons = document.querySelectorAll(".chip");

let isSending = false;
let typingRow = null;

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

// 显示 typing...
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

function removeTyping() {
  if (typingRow) typingRow.remove();
  typingRow = null;
}

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

    // 从 outputs（stack ai 格式）取消息
    if (data.outputs) {
      const firstKey = Object.keys(data.outputs)[0];
      answer = data.outputs[firstKey];
    } else {
      answer = data.output_text || data.answer || JSON.stringify(data);
    }

    // 清洗无用内容
    answer = answer
      ?.replace(/^#.*\n/, "")
      ?.replace(/\[\^[^\]]+\]/g, "")
      ?.trim();

    removeTyping();
    addMessage(answer || "I’m here with you, but I didn’t get a response. 💗", "bot");

  } catch (err) {
    console.error(err);
    removeTyping();
    addMessage("Something went wrong. Please try again. 💗", "bot");
  }

  isSending = false;
}

function handleSend() {
  const text = inputEl.value;
  if (!text.trim()) return;
  sendToServer(text);
}

sendBtn.addEventListener("click", handleSend);
inputEl.addEventList

