// Function to load header component
function loadHeader() {
  fetch("../components/headerCustomer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("header-container").innerHTML = data;
      // Gắn lại sự kiện logout sau khi header đã được render vào DOM
      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          window.location.href = "../pages/home.html";
        });
      }
    })
    .catch((error) => {
      console.error("Error loading header:", error);
    });
}

// Load header when DOM is ready
document.addEventListener("DOMContentLoaded", loadHeader);
