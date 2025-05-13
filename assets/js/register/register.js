const phoneInput = document.getElementById("phone");
const otpInput = document.getElementById("otp");
const sendBtn = document.getElementById("send-btn");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");

const phoneError = document.getElementById("phone-error");
const otpError = document.getElementById("otp-error");
const countdownSpan = document.getElementById("countdown");

let countdownTimer = null;
let countdown = 30;

// Regex kiểm tra SĐT Việt Nam
const vnPhoneRegex = /^(03|05|07|08|09)\d{8}$/;

// Ban đầu disable các input
disableInputs([otpInput, passwordInput, confirmPasswordInput]);
sendBtn.disabled = true;

//Nhập số điện thoại
phoneInput.addEventListener("input", async () => {
  const phone = phoneInput.value.trim();

  if (vnPhoneRegex.test(phone)) {
    phoneError.textContent = "";
    otpInput.disabled = false;

    await sendOTP(phone);
  } else {
    phoneError.textContent = "Vui lòng nhập số điện thoại hợp lệ!";
    disableInputs([otpInput, passwordInput, confirmPasswordInput]);
    sendBtn.disabled = true;
  }
});

// Gửi lại mã khi bấm nút
sendBtn.addEventListener("click", async () => {
  const phone = phoneInput.value.trim();
  if (vnPhoneRegex.test(phone)) {
    await sendOTP(phone);
  }
});

// Khi nhập OTP xong, kiểm tra sau 6 số
otpInput.addEventListener("input", async () => {
  const otp = otpInput.value.trim();
  const phone = phoneInput.value.trim();

  // Kiểm tra không đủ 6 chữ số
  if (!/^\d{6}$/.test(otp)) {
    otpError.textContent = "OTP phải gồm đúng 6 chữ số!";
    return;
  }

  otpError.textContent = ""; // Xóa lỗi nếu đúng định dạng

  // Nếu là số đặc biệt thì mặc định OTP đúng là 123456
  if (phone === "0934185833" || phone === "+84934185833") {
    await verifyOTP(phone, otp);
  } else {
    if (otp === "123456") {
      if (countdown <= 0) {
        otpError.textContent = "Mã OTP đã hết hạn. Vui lòng bấm 'Gửi mã'.";
        otpError.style.color = "red";
        return;
      }
      phoneError.textContent = "";
      otpError.textContent = "";
      passwordInput.disabled = false;
      confirmPasswordInput.disabled = false;
      clearInterval(countdownTimer);
      countdownSpan.textContent = "";
      otpInput.disabled = true;
      phoneInput.style.border = "3px solid green";
      otpInput.style.border = "3px solid green";
    } else {
      otpError.textContent = "Mã OTP không đúng. Vui lòng thử lại.";
    }
  }
});

// Send OTP
async function sendOTP(phone) {
  try {
    const response = await fetch("http://localhost:8080/api/auth/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber: phone }),
    });

    const result = await response.json();

    if (result.status === 400 && result.errors.phoneNumber) {
      phoneError.textContent = result.errors.phoneNumber;
      phoneError.style.color = "red";
      return;
    }

    if (result.status === 500) {
      phoneError.textContent = result.error;
      phoneError.style.color = "red";
      return;
    }

    if (response.ok && result.status === 200) {
      phoneError.textContent = "Đã gửi mã OTP đến số điện thoại của bạn.";
      phoneError.style.color = "green";
      startCountdown();
      return;
    }


  } catch (error) {
    phoneError.textContent = "Lỗi : " + error.message;
    phoneError.style.color = "red";
  }
}

// Verify OTP
async function verifyOTP(phone, otp) {
  try {
    const response = await fetch("http://localhost:8080/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: phone,
        otpCode: otp,
      }),
    });
    const result = await response.json();

    if (
      response.ok &&
      result.status === 200 &&
      result.message === "OTP hợp lệ!"
    ) {
      phoneError.textContent = "";
      otpError.textContent = "";
      passwordInput.disabled = false;
      confirmPasswordInput.disabled = false;
      clearInterval(countdownTimer);
      countdownSpan.textContent = "";
      otpInput.disabled = true;
      phoneInput.style.border = "3px solid green";
      otpInput.style.border = "3px solid green";
      return;
    } else {
      otpError.textContent = result.message;
      otpError.style.color = "red";
      return;
    }
  } catch (err) {
    otpError.textContent = "Lỗi kết nối: " + err.message;
    return false;
  }
}

// Bắt đầu đếm ngược 30s
function startCountdown() {
  sendBtn.disabled = true;
  phoneInput.disabled = true;
  countdown = 30;
  countdownSpan.textContent = "(" + countdown + "s)";

  if (countdownTimer) clearInterval(countdownTimer);

  countdownTimer = setInterval(() => {
    countdown--;
    countdownSpan.textContent = "(" + countdown + "s)";
    if (countdown <= 0) {
      clearInterval(countdownTimer);
      countdownSpan.textContent = "";
      phoneInput.disabled = false;
      sendBtn.disabled = false;
    }
  }, 1000);
}

// Hàm tiện ích
function disableInputs(inputs) {
  inputs.forEach((input) => (input.disabled = true));
}
