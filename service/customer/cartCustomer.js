let cartItems = [];

// Cập nhật giao diện giỏ hàng
function updateCart() {
  const cartContainer = document.getElementById("cart-items");
  cartContainer.innerHTML = "";
  let total = 0;


  cartItems.forEach(item => {
    const itemElement = document.createElement("div");
    itemElement.classList.add("cart-item");



    const isOutOfStock = item.stock < item.quantity || item.stock === 0 || item.status === false;
    if (isOutOfStock) {
      itemElement.classList.add("out-of-stock");
    }

    const hetHang = item.stock === 0 || item.status === false;
    const khongDu = item.stock < item.quantity && item.stock > 0;

    itemElement.innerHTML = `
    ${khongDu ? `
      <div class="overlay">
          Chỉ còn lại ${item.stock} sản phẩm trong kho. Bạn có muốn thêm tối đa có thể không?
          <br/>
          <a href="#" onclick="updateQuantity(${item.bookId}, 1)" style="color: blue; text-decoration: underline; margin-left: 5px;">
                 Có, hãy thêm
           </a>
       </div>
      ` : ""}
    ${hetHang ? '<div class="overlay">Sản phẩm hiện không còn tồn tại.</div>' : ""}
    <input type="checkbox" data-id="${item.id}" onchange="toggleSelect(${item.id})" ${item.selected ? "checked" : ""} />
    <img src="${item.image}" alt="${item.name}">
    <div>
      <h3>${item.name}</h3>
      <p>Tác giả: ${item.author}</p>
      ${item.discountPrice != null && item.discountPrice > 0
        ? `<p>Giá: <span style="color: red; font-weight: bold;">${item.discountPrice.toLocaleString("vi-VN")} VND</span></p>
           <p>Giá gốc: <span style="text-decoration: line-through; color: gray;">${item.price.toLocaleString("vi-VN")} VND</span></p>`
        : `<p style="color: red; font-weight: bold;">Giá: ${item.price.toLocaleString("vi-VN")} VND</p>`
      }
    </div>
    <div class="quantity-control">
      <button onclick="updateQuantity(${item.bookId}, -1)">-</button>
      <span>${item.quantity}</span>
      <button onclick="updateQuantity(${item.bookId}, 1)">+</button>
    </div>
    <button class="remove" onclick="removeItem(${item.bookId})">Xóa</button>
  `;

    cartContainer.appendChild(itemElement);

    if (item.selected && !isOutOfStock) {
      total += item.price * item.quantity;
    }
  });


  document.getElementById("total-price").innerText = total.toLocaleString("vi-VN");
}

// Tăng/giảm số lượng
function updateQuantity(id, delta) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vui lòng đăng nhập lại!");
    return;
  }
  const currentItem = cartItems.find(item => item.bookId === id);
  if (!currentItem) return;

  // Nếu là tăng số lượng
  if (delta === 1) {
    fetch(`http://localhost:8080/api/cart/increase?bookId=${id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Tăng số lượng thất bại");
        return res.json();
      })
      .then(data => {
        const updatedItem = data.find(item => item.bookId === id);
        if (updatedItem) {
          cartItems = cartItems.map(item =>
            item.id === updatedItem.cartId
              ? { ...item, quantity: updatedItem.quantity }
              : item
          );
          updateCart();
        }
      })
      .catch(err => {
        console.error(err);
        alert("Không thể tăng số lượng. Vui lòng thử lại.");
      });
  }

  // Nếu là giảm số lượng
  if (delta === -1) {
    if (currentItem.quantity === 1) {
      // 🧠 Thay confirm() bằng hộp thoại động
      showConfirmDialog("Số lượng hiện tại là 1. Nếu tiếp tục giảm, sản phẩm sẽ bị xóa khỏi giỏ hàng. Bạn có chắc chắn?")
        .then(confirmed => {
          if (!confirmed) return;

          // Cập nhật tạm giao diện
          cartItems = cartItems.filter(item => item.bookId !== id);
          updateCart();

          const quantityElement = document.getElementById("total-quantity");
          if (quantityElement) {
            quantityElement.innerText = cartItems.length;
          }

          // Gửi API giảm số lượng
          fetch(`http://localhost:8080/api/cart/decrease?bookId=${id}`, {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
            .then(res => {
              if (!res.ok) throw new Error("Giảm số lượng thất bại");
              return res.json();
            })
            .then(data => {
              const updatedItem = data.find(item => item.bookId === id);
              if (updatedItem) {
                cartItems = cartItems.map(item =>
                  item.id === updatedItem.cartId
                    ? { ...item, quantity: updatedItem.quantity }
                    : item
                );
                updateCart();
              }
            })
            .catch(err => {
              console.error(err);
              alert("Không thể giảm số lượng. Vui lòng thử lại.");
            });
        });

    } else {
      // Nếu quantity > 1: giảm bình thường
      fetch(`http://localhost:8080/api/cart/decrease?bookId=${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then(res => {
          if (!res.ok) throw new Error("Giảm số lượng thất bại");
          return res.json();
        })
        .then(data => {
          const updatedItem = data.find(item => item.bookId === id);
          if (updatedItem) {
            cartItems = cartItems.map(item =>
              item.id === updatedItem.cartId
                ? { ...item, quantity: updatedItem.quantity }
                : item
            );
            updateCart();
          }
        })
        .catch(err => {
          console.error(err);
          alert("Không thể giảm số lượng. Vui lòng thử lại.");
        });
    }
  }
}

// Xóa khỏi giỏ hàng
function removeItem(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vui lòng đăng nhập lại!");
    return;
  }

  cartItems = cartItems.filter(item => item.bookId !== id);
  updateCart();

  const quantityElement = document.getElementById("total-quantity");
  if (quantityElement) {
    quantityElement.innerText = cartItems.length;
  }

  fetch(`http://localhost:8080/api/cart/remove?bookId=${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Xóa sản phẩm thất bại");
      return res.json();
    })
    .then(data => {
      console.log("Sản phẩm đã được xóa:", data);
    })
    .catch(err => {
      console.error(err);
      alert("Không thể xóa sản phẩm. Vui lòng thử lại.");
      cartItems = [...cartItems];
      updateCart();
    });
}

// Tích chọn sản phẩm
function toggleSelect(id) {
  const item = cartItems.find(item => item.id === id);
  if (item) {
    item.selected = !item.selected;

    const checkbox = document.querySelector(`input[type="checkbox"][data-id="${id}"]`);
    if (checkbox) {
      checkbox.checked = item.selected;
    }

    let total = 0;
    cartItems.forEach(item => {
      if (item.selected) {
        if (item.discountPrice != null && item.discountPrice > 0) {
          total += item.discountPrice * item.quantity;
        } else {
          total += item.price * item.quantity;
        }

      }
    });
    document.getElementById("total-price").innerText = total.toLocaleString("vi-VN");

    updateCheckoutButtonState();
  }
}

// Khi trang tải xong
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Vui lòng đăng nhập để xem giỏ hàng!");
    window.location.href = "../pages/home.html";
    return;
  }

  fetch("http://localhost:8080/api/cart/all", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Không lấy được giỏ hàng");
      return res.json();
    })
    .then(data => {
      cartItems = data.map(item => ({
        id: item.cartId,
        name: item.bookTitle,
        author: item.bookAuthor,
        price: item.price,
        discountPercent: item.discountPercent,
        discountPrice: item.discountedPrice,
        quantity: item.quantity,
        stock: item.stockQuantity,
        bookId: item.bookId,
        image: item.bookImageUrl,
        status: item.bookStatus,
        selected: false
      }));
      updateCart();
    })
    .catch(err => {
      console.error("Lỗi khi tải giỏ hàng:", err);
      alert("Không thể tải giỏ hàng. Vui lòng thử lại sau.");
    });
});


function saveSelectedItemsToLocalStorage() {
  const selectedItems = cartItems.filter(item => item.selected);
  localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
  window.location.href = "../pages/purchaseConfirm.html";
}


//  Hàm tạo dialog xác nhận bằng JS thuần (không cần HTML sẵn)
function showConfirmDialog(message) {
  return new Promise((resolve) => {
    // Tạo lớp phủ nền
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9999";
    overlay.style.animation = "fadeIn 0.2s ease";

    // Tạo hộp thoại
    const dialog = document.createElement("div");
    dialog.style.backgroundColor = "#fff";
    dialog.style.padding = "24px";
    dialog.style.borderRadius = "12px";
    dialog.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.2)";
    dialog.style.maxWidth = "420px";
    dialog.style.width = "90%";
    dialog.style.textAlign = "center";
    dialog.style.fontFamily = "'Segoe UI', sans-serif";

    // Nội dung hộp thoại
    dialog.innerHTML = `
      <div style="font-size: 18px; font-weight: 500; margin-bottom: 20px;">${message}</div>
      <div style="display: flex; justify-content: center; gap: 12px;">
        <button id="confirm-yes" style="
          background-color: #ef4444;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        ">Xác nhận</button>
        <button id="confirm-no" style="
          background-color: #f3f4f6;
          color: #374151;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        ">Hủy</button>
      </div>
    `;

    // Hiệu ứng hover nút
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      #confirm-yes:hover {
        background-color: #dc2626;
      }
      #confirm-no:hover {
        background-color: #e5e7eb;
      }
    `;
    document.head.appendChild(style);

    // Gắn vào DOM
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Xử lý sự kiện
    document.getElementById("confirm-yes").addEventListener("click", () => {
      document.body.removeChild(overlay);
      resolve(true);
    });

    document.getElementById("confirm-no").addEventListener("click", () => {
      document.body.removeChild(overlay);
      resolve(false);
    });
  });
}


function updateCheckoutButtonState() {
  const checkoutBtn = document.getElementById("checkout-btn");
  const hasSelected = cartItems.some(item => item.selected);
  if (checkoutBtn) {
    checkoutBtn.disabled = !hasSelected;
    checkoutBtn.style.backgroundColor = hasSelected ? "#16a34a" : "#ccc";
    checkoutBtn.style.color = hasSelected ? "#fff" : "#666";
    checkoutBtn.style.cursor = hasSelected ? "pointer" : "not-allowed";
  }
}

