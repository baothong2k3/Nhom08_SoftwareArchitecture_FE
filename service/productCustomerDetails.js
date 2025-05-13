document.addEventListener("DOMContentLoaded", async () => {
  const bookId = localStorage.getItem("selectedBookId");
  if (!bookId) {
    alert("Không tìm thấy sách.");
    window.location.href = "../pages/productCustomer.html";
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/api/books/${bookId}`);
    const book = await response.json();

    // Render toàn bộ nội dung vào .product-detail
    document.querySelector(".product-detail").innerHTML = `
    <div class="product-image">
     <img src="${book.imageUrl}" alt="${book.title}" />
    </div>
    <div class="product-info">
      <h1>${book.title}</h1>
      <p><strong>Tác giả:</strong> ${book.author}</p>
      <p><strong>Danh mục:</strong> ${book.category}</p>
      <p><strong>Giá:</strong> ${book.price.toLocaleString()} VND</p>
      <p><strong>Số lượng tồn kho:</strong> ${book.stockQuantity}</p>
      <p><strong>Mô tả sản phẩm:</strong> ${book.description.replace(
      /\n/g,
      "<br/>"
    )}</p>
    <div class="buttons">
      <button class="add-to-cart" data-id="${book.id}">Thêm vào giỏ hàng</button>
      <button class="buy-now">Mua ngay</button>
    </div>
    <div class="back">
      <a href="../pages/productCustomer.html">Quay Lại</a>
    </div>
  </div>
`;

    // 🔁 GẮN SỰ KIỆN CHO NÚT "THÊM VÀO GIỎ HÀNG"
    const isLoggedIn = () => {
      return localStorage.getItem("token") !== null;
    };

    const addToCartButton = document.querySelector(".add-to-cart");
    addToCartButton.addEventListener("click", async (e) => {
      if (!isLoggedIn()) {
        Swal.fire({
          icon: "warning",
          title: "Chưa đăng nhập",
          html: 'Vui lòng đăng nhập để thêm vào giỏ hàng.<br><a href="../pages/login.html">Đăng nhập ngay</a>',
          confirmButtonText: "OK",
        });
        return;
      }

      const bookId = e.target.getAttribute("data-id");
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(
          `http://localhost:8080/api/cart/add?bookId=${bookId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Lỗi khi thêm vào giỏ hàng");
        }

        totalCart();

        Swal.fire({
          icon: "success",
          title: "Đã thêm vào giỏ hàng",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể thêm vào giỏ hàng. Vui lòng thử lại.",
        });
      }
    });
  } catch (error) {
    console.error("Lỗi khi tải chi tiết sách:", error);
  }
});


const totalCart = () => {
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
      const totalProducts = data.length;
      const quantityElement = document.getElementById("total-quantity");
      if (quantityElement) {
        quantityElement.innerText = totalProducts;
      }
    })
    .catch(err => {
      console.error("Lỗi khi tải giỏ hàng:", err);
    });
}