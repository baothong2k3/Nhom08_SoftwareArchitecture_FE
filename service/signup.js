document.getElementById("register-btn").addEventListener("click", async function () {
  // Reset tất cả thông báo lỗi
  document.getElementById("phone-error").textContent = "";
  document.getElementById("otp-error").textContent = "";
  document.getElementById("password-error").textContent = "";
  document.getElementById("confirm-password-error").textContent = "";

  const phone = document.getElementById("phone").value.trim();
  const otp = document.getElementById("otp").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    document.getElementById("confirm-password-error").textContent = "Mật khẩu nhập lại không khớp!";
    return;
  }

  const payload = {
    phoneNumber: phone,
    otp: otp,
    password: password
  };

  try {
    const response = await fetch("http://localhost:8080/api/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      alert("Đăng ký thành công!"); // Có thể thay alert bằng redirect trực tiếp nếu muốn
      window.location.href = "../pages/home.html";
    } else {
      // Xử lý lỗi từ backend
      if (data.errors) {
        // Lặp qua các lỗi trong object errors
        for (let field in data.errors) {
          switch (field) {
            case "phoneNumber":
              document.getElementById("phone-error").textContent = data.errors[field];
              break;
            case "otp":
              document.getElementById("otp-error").textContent = data.errors[field];
              break;
            case "password":
              document.getElementById("password-error").textContent = data.errors[field];
              break;
            default:
              alert("Có lỗi không xác định: " + data.errors[field]);
          }
        }
      } else if (typeof data === "string") {
        alert(data); // Trường hợp lỗi OTP hoặc lỗi khác dưới dạng string
      } else {
        alert(data.message || "Có lỗi xảy ra!");
      }
    }
  } catch (error) {
    console.error("Lỗi kết nối đến BE:", error);
    alert("Không thể kết nối đến máy chủ.");
  }
});


const passwordInput_1 = document.getElementById("password");
const confirmPasswordInput_1 = document.getElementById("confirm-password");
const registerBtn = document.getElementById("register-btn");

function validatePasswordStrength(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}

function validatePasswords() {
  const password = passwordInput_1.value;
  const confirmPassword = confirmPasswordInput_1.value;

  let isValid = true;

  // Reset lỗi
  document.getElementById("password-error").textContent = "";
  document.getElementById("confirm-password-error").textContent = "";

  // Kiểm tra độ mạnh mật khẩu
  if (!validatePasswordStrength(password)) {
    document.getElementById("password-error").textContent =
      "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";
    isValid = false;
  }

  // Kiểm tra mật khẩu khớp
  if (password !== confirmPassword) {
    document.getElementById("confirm-password-error").textContent =
      "Mật khẩu nhập lại không khớp!";
    isValid = false;
  }

  // Bật/tắt nút đăng ký
  registerBtn.disabled = !isValid;
}

passwordInput_1.addEventListener("input", validatePasswords);
confirmPasswordInput_1.addEventListener("input", validatePasswords);
