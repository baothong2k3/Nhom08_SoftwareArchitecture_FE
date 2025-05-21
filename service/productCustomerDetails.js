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

    console.log(book);

    // Render thông tin chi tiết sách
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
        <p><strong>Mô tả sản phẩm:</strong> ${book.description.replace(/\n/g, "<br/>")}</p>
        ${book.discountPercent != null && book.discountedPrice != null ? `
             <p class="product-discount"><strong>Giảm giá:</strong> ${book.discountPercent}%</p>
             <p class="product-discounted-price"><strong>Giá sau giảm:</strong> ${book.discountedPrice.toLocaleString()} VND</p>
          ` : ''}
        <div class="buttons">
          <button class="add-to-cart" data-id="${book.id}">Thêm vào giỏ hàng</button>
          <button class="buy-now" id="buyNowBtn">Mua ngay</button>
        </div>
        <div class="back">
          <a href="../pages/productCustomer.html">Quay Lại</a>
        </div>
      </div>
    `;

    // Xử lý nút "Mua ngay"
    document.getElementById("buyNowBtn").addEventListener("click", async () => {
      const { value: quantity } = await Swal.fire({
        title: "Nhập số lượng muốn mua",
        input: "number",
        inputLabel: `Tối đa ${book.stockQuantity} sản phẩm`,
        inputAttributes: {
          min: 1,
          max: book.stockQuantity,
          step: 1
        },
        inputValue: 1,
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
        preConfirm: (value) => {
          if (!value || isNaN(value) || value < 1 || value > book.stockQuantity) {
            Swal.showValidationMessage("Vui lòng nhập số hợp lệ (1 đến " + book.stockQuantity + ")");
          }
          return value;
        }
      });

      if (quantity) {
        if (book.discountedPrice != null && book.discountPercent != null) {
          const selectedBook = [{
            bookId: book.id,
            name: book.title,
            author: book.author,
            price: book.discountedPrice,
            image: book.imageUrl,
            quantity: parseInt(quantity)
          }];
          localStorage.removeItem("selectedItems");
          localStorage.setItem("selectedItems", JSON.stringify(selectedBook));
          window.location.href = "../pages/purchaseConfirm.html";
        } else {
          const selectedBook = [{
            bookId: book.id,
            name: book.title,
            author: book.author,
            price: book.price,
            image: book.imageUrl,
            quantity: parseInt(quantity)
          }];
          localStorage.removeItem("selectedItems");
          localStorage.setItem("selectedItems", JSON.stringify(selectedBook));
          window.location.href = "../pages/purchaseConfirm.html";
        }
      }
    });
    // Xử lý nút "Thêm vào giỏ hàng"
    const isLoggedIn = () => localStorage.getItem("token") !== null;

    document.querySelector(".add-to-cart").addEventListener("click", async () => {
      if (!isLoggedIn()) {
        Swal.fire({
          icon: "warning",
          title: "Chưa đăng nhập",
          html: 'Vui lòng đăng nhập để thêm vào giỏ hàng.<br><a href="../pages/login.html">Đăng nhập ngay</a>',
          confirmButtonText: "OK",
        });
        return;
      }

      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:8080/api/cart/add?bookId=${book.id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Lỗi khi thêm vào giỏ hàng");

        // Cập nhật số lượng sản phẩm tương ứng
        fetch("http://localhost:8080/api/cart/all", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
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

            // Cập nhật DOM nếu sản phẩm đã có (tùy logic hiển thị giỏ hàng)
            // (Tuỳ vào cách render giỏ hàng ở nơi khác, bạn có thể cập nhật thêm ở đây nếu cần)

            Swal.fire({
              icon: "success",
              title: "Đã thêm vào giỏ hàng",
              timer: 1500,
              showConfirmButton: false,
            });
          });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Không thể thêm vào giỏ hàng',
          text: 'Số lượng sản phẩm này trong giỏ hàng đã đạt mức tối đa cho phép.'
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
      Authorization: `Bearer ${token}`,
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
    .catch(err => console.error("Lỗi khi tải giỏ hàng:", err));
};
