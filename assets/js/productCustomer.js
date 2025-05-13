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
  window.location.href = "../pages/homeAdmin.html";
}

function goBack() {
  window.history.back();
}

fetch("../components/footer.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("footer").innerHTML = data;
  })
  .catch((error) => console.error("Error loading footer:", error));

fetch("../components/menuCustomer.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("menu").innerHTML = data;
  })
  .catch((error) => console.error("Error loading footer:", error));

// Gio hang

// chuyen khoan
function toggleBankField() {
  const paymentMethod = document.getElementById("payment").value;
  const bankField = document.getElementById("bank-field");
  bankField.classList.toggle("hidden", paymentMethod !== "bank");
}

//Tong tien

function calculateTotal() {
  let quantity = parseInt(document.getElementById("quantity").value);
  let productPrice = parseInt(document.getElementById("product-price").value);
  let tax = parseInt(document.getElementById("tax").value);
  let shipping = parseInt(document.getElementById("shipping").value);

  let total = productPrice * quantity + tax + shipping;

  document.getElementById(
    "total-price"
  ).innerText = `Tổng tiền: ${total.toLocaleString()} VND`;
}

// Tính ngay khi trang tải xong
window.onload = calculateTotal;

//phan trang
function changePage(step) {
  const totalPages = Math.ceil(books.length / itemsPerPage);
  currentPage = Math.min(Math.max(1, currentPage + step), totalPages);
  displayBooks();
}
