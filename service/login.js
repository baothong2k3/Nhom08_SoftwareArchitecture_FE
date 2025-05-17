async function handleLogin(event) {
  event.preventDefault();
  // Reset lỗi cũ
  document.getElementById("username-error").textContent = "";
  document.getElementById("password-error").textContent = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  let hasError = false;

  if (!username) {
    document.getElementById("username-error").textContent = "Vui lòng nhập số điện thoại hoặc email.";
    hasError = true;
  }
  if (!password) {
    document.getElementById("password-error").textContent = "Vui lòng nhập mật khẩu.";
    hasError = true;
  }

  if (hasError) return; // Dừng lại nếu có lỗi

  const payload = { username, password };

  try {
    const response = await fetch("http://localhost:8080/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      // Lưu token vào localStorage
      localStorage.setItem("token", data.token);
      // Lưu role vào localStorage (nếu cần)
      localStorage.setItem("role", data.role);
      // Redirect dựa trên role
      if (data.role === "ROLE_USER") {
        await getUserInfoById();
        window.location.href = "../pages/homeCustomer.html";
      } else {
        await getUserInfoById();
        window.location.href = "../pages/homeAdmin.html";
      }
    } else {
      if (data.errors) {
        for (let field in data.errors) {
          switch (field) {
            case "username":
              document.getElementById("username-error").textContent = data.errors[field];
              break;
            case "password":
              document.getElementById("password-error").textContent = data.errors[field];
              break;
            default:
              alert("Lỗi không xác định: " + data.errors[field]);
          }
        }
      } else {
        alert(data.message || "Có lỗi xảy ra khi đăng nhập!");
      }
    }
  } catch (error) {
    console.error("Lỗi kết nối đến BE:", error);
  }
}


async function getUserInfoById() {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch("http://localhost:8080/api/user/get", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    });
    const result = await response.json();
    if (response.ok) {
      const user = result.message;
      if (user.fullName) {
        localStorage.setItem("userName", user.fullName);
      } else {
        localStorage.setItem("userName", user.phoneNumber);
      }

    } else {
      console.error("Lỗi khi lấy user:", result.message || result);
    }
  } catch (error) {
    console.error("Lỗi kết nối đến server:", error);
  }
}