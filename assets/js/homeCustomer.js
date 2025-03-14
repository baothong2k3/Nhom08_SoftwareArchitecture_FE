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

  let cartItems = [
    { id: 1, name: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 150000, quantity: 1, image: "/assets/sachMau.png", selected: false },
    { id: 2, name: "To Kill a Mockingbird", author: "Harper Lee", price: 120000, quantity: 1, image: "/assets/sachMau.png", selected: false }
];

function updateCart() {
    const cartContainer = document.getElementById("cart-items");
    cartContainer.innerHTML = "";
    let total = 0;
    cartItems.forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("cart-item");
        itemElement.innerHTML = `
            <input type="checkbox" onchange="toggleSelect(${item.id})" ${item.selected ? "checked" : ""} />
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h3>${item.name}</h3>
                <p>Tác giả: ${item.author}</p>
                <p>Giá: ${item.price.toLocaleString("vi-VN")} VND</p>
            </div>
            <div class="quantity-control">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <button class="remove" onclick="removeItem(${item.id})">Xóa</button>
        `;
        cartContainer.appendChild(itemElement);
        if (item.selected) total += item.price * item.quantity;
    });
    document.getElementById("total-price").innerText = total.toLocaleString("vi-VN");
}

function updateQuantity(id, delta) {
    cartItems = cartItems.map(item => 
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    updateCart();
}

function removeItem(id) {
    cartItems = cartItems.filter(item => item.id !== id);
    updateCart();
}

function toggleSelect(id) {
    cartItems = cartItems.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
    );
    updateCart();
}

updateCart();

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
  
  let total = (productPrice * quantity) + tax + shipping;
  
  document.getElementById("total-price").innerText = `Tổng tiền: ${total.toLocaleString()} VND`;
}

// Tính ngay khi trang tải xong
window.onload = calculateTotal;

//phan trang
function changePage(step) {
  const totalPages = Math.ceil(books.length / itemsPerPage);
  currentPage = Math.min(Math.max(1, currentPage + step), totalPages);
  displayBooks();
}