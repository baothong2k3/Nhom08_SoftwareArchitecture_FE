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

// function handleLogin(event) {
//   event.preventDefault(); // Ngăn chặn hành vi submit mặc định
//   window.location.href = '../pages/homeAdmin.html';
// }

function goBack() {
    window.history.back();
}

fetch("../components/footer.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("footer").innerHTML = data;
  })
  .catch((error) => console.error("Error loading footer:", error));

fetch("../components/menu.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("menu").innerHTML = data;
  })
  .catch((error) => console.error("Error loading footer:", error));

  //phan trang
  function changePage(step) {
    const totalPages = Math.ceil(books.length / itemsPerPage);
    currentPage = Math.min(Math.max(1, currentPage + step), totalPages);
    displayBooks();
}

// //lay lai mat khau
// function handleLogin(event) {
//   event.preventDefault(); // Ngăn chặn form submit mặc định
//   window.location.href = "../pages/homeCustomer.html"; // Chuyển hướng về trang login
// }