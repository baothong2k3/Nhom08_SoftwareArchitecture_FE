document.addEventListener("keydown", function (event) {
  if (
    event.ctrlKey &&
    (event.key === "=" || event.key === "-" || event.key === "0")
  ) {
    event.preventDefault();
  }
});

document.addEventListener(
  "wheel",
  function (event) {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  },
  { passive: false }
);

function handleLogin(event) {
  event.preventDefault(); // Ngăn chặn hành vi submit mặc định
  window.location.href = '../pages/homeAdmin.html';
}

function goBack() {
  window.history.back();
}


//GẮN GIAO DIỆN
document.addEventListener("DOMContentLoaded", () => {
  // Đợi đến khi header/menu được load xong
  fetch("../components/headerAdmin.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("top").innerHTML = data;
      const username = localStorage.getItem("userName");
      document.getElementById("username").textContent = username || "Guest";
    });

  fetch("../components/footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("footer").innerHTML = data;
    })
    .catch((error) => console.error("Error loading footer:", error));

  fetch("../components/menuAdmin.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("menu").innerHTML = data;
      // Gắn sự kiện logout sau khi menu được gắn vào DOM
      const logoutLink = document.getElementById("logout-link");
      if (logoutLink) {
        logoutLink.addEventListener("click", async function (e) {
          e.preventDefault(); // Ngăn link chuyển trang ngay lập tức

          const sessionId = sessionStorage.getItem("sessionId");

          try {
            if (sessionId) {
              await fetch("http://localhost:8080/api/qna/clear", {
                method: "POST",
                headers: {
                  "X-Session-Id": sessionId,
                },
              });
            }

            // Xóa session và local storage
            sessionStorage.removeItem("sessionId");
            localStorage.removeItem("token");
            localStorage.removeItem("role");

            // Điều hướng về trang đăng nhập
            window.location.href = "/index.html";
          } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            alert("Đăng xuất thất bại. Vui lòng thử lại!");
          }
        });
      } else {
        console.warn("Không tìm thấy phần tử 'logout-link'");
      }
    })
    .catch((error) => console.error("Error loading footer:", error));
});




//phan trang
// function changePage(step) {
//   const totalPages = Math.ceil(books.length / itemsPerPage);
//   currentPage = Math.min(Math.max(1, currentPage + step), totalPages);
//   displayBooks();
// }
