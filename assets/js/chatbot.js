// Avatar URL
const AI_AVATAR = "https://cdn-icons-png.flaticon.com/512/4616/4616734.png";
const USER_AVATAR = "https://cdn-icons-png.flaticon.com/512/1077/1077114.png";

document.addEventListener("DOMContentLoaded", function () {
  // Add initial welcome message
  setTimeout(() => {
    // Đợi home.js chạy trước, sau đó mới chạy code chat
    appendAIMessage(
      "Chào Mừng Bạn Đến Với Cửa Hàng Sách Của Chúng Tôi, Tôi Sẽ Giúp Bạn Đưa Ra Sự Lựa Chọn Sản Phẩm Phù Hợp Nhất. Cho Tôi Biết Sở Thích Của Bạn Là Gì?"
    );

    document.getElementById("sendBtn").addEventListener("click", sendMessage);
    document
      .getElementById("userMessage")
      .addEventListener("keydown", function (e) {
        // Enter để gửi tin nhắn, nhưng Shift+Enter để xuống dòng
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault(); // Ngăn xuống dòng mặc định
          sendMessage();
        }
      });

    // Tự động điều chỉnh chiều cao của textarea khi gõ
    document
      .getElementById("userMessage")
      .addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height =
          this.scrollHeight < 150 ? this.scrollHeight + "px" : "150px";
      });

    // Xóa bất kỳ ảnh nào có thể được thêm vào từ home.js
    const mainImages = document.querySelectorAll(".main img");
    mainImages.forEach((img) => {
      img.style.display = "none";
    });
  }, 100);
});

async function sendMessage() {
  const messageInput = document.getElementById("userMessage");
  const sendBtn = document.getElementById("sendBtn");
  const message = messageInput.value.trim();

  if (message) {
    messageInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.classList.add("loading-btn");
    sendBtn.innerHTML =
      '<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>';

    // Hiển thị tin nhắn người dùng
    appendUserMessage(message);
    messageInput.value = "";
    messageInput.style.height = "56px";

    try {
      // Demo response without calling real API
      setTimeout(async () => {
        let response;
        if (message.toLowerCase().includes("sách")) {
          response =
            "Cửa hàng chúng tôi có nhiều thể loại sách: tiểu thuyết, kỹ năng sống, sách học tập, sách thiếu nhi. Bạn quan tâm đến thể loại nào?";
        } else if (message.toLowerCase().includes("tiểu thuyết")) {
          response =
            "Chúng tôi có các tiểu thuyết nổi tiếng như:\n1. Trăm Năm Cô Đơn\n2. Đắc Nhân Tâm\n3. Nhà Giả Kim\nBạn muốn biết thêm về cuốn nào?";
        } else {
          response =
            "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ giúp bạn tìm sách phù hợp nhất. Bạn có thể cho biết thêm về sở thích đọc sách của mình không?";
        }
        await appendAIMessage(response);

        // Restore button state
        sendBtn.disabled = false;
        sendBtn.classList.remove("loading-btn");
        sendBtn.innerHTML = "Gửi";
        messageInput.disabled = false;
        messageInput.focus();
      }, 1000);
    } catch (error) {
      console.error("Lỗi:", error);
      appendErrorMessage("Có lỗi xảy ra khi gửi tin nhắn");

      // Restore button state
      sendBtn.disabled = false;
      sendBtn.classList.remove("loading-btn");
      sendBtn.innerHTML = "Gửi";
      messageInput.disabled = false;
      messageInput.focus();
    }
  }
}

// Hàm xử lý định dạng tin nhắn để hiển thị đúng xuống dòng từ người dùng
function formatUserMessage(text) {
  return text.replace(/\n/g, "<br>");
}

function appendUserMessage(text) {
  const container = document.createElement("div");
  container.className = "message-container user-container message-animation";

  const messageBubble = document.createElement("div");
  messageBubble.className = "message-bubble user-message";
  messageBubble.innerHTML = formatUserMessage(text); // Dùng innerHTML để hiển thị xuống dòng

  const avatar = document.createElement("img");
  avatar.className = "avatar";
  avatar.src = USER_AVATAR;
  avatar.alt = "User";

  container.appendChild(messageBubble);
  container.appendChild(avatar);

  document.getElementById("messages").appendChild(container);
  scrollToBottom();
}

async function appendAIMessage(text) {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    container.className = "message-container ai-container message-animation";

    const avatar = document.createElement("img");
    avatar.className = "avatar";
    avatar.src = AI_AVATAR;
    avatar.alt = "AI";

    const messageBubble = document.createElement("div");
    messageBubble.className = "message-bubble ai-message";

    container.appendChild(avatar);
    container.appendChild(messageBubble);

    document.getElementById("messages").appendChild(container);

    // Xử lý text và chia thành từng phần để hiển thị mượt mà
    const parts = text.split("");
    let visibleText = "";
    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex < parts.length) {
        visibleText += parts[currentIndex];
        messageBubble.innerHTML = formatMessage(visibleText);

        scrollToBottom();

        currentIndex++;
        setTimeout(typeNextChar, 30);
      } else {
        resolve(); // Hoàn thành typing effect
      }
    };

    typeNextChar();
  });
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>")
    .replace(/\r/g, "<br>");
}

function appendErrorMessage(text) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message message-animation";
  errorDiv.textContent = text;
  document.getElementById("messages").appendChild(errorDiv);
  scrollToBottom();
}

function scrollToBottom() {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
