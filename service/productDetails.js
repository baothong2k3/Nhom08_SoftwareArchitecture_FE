document.addEventListener('DOMContentLoaded', async () => {
  const bookId = localStorage.getItem('selectedBookId');
  if (!bookId) {
    alert("Không tìm thấy sách.");
    window.location.href = '../pages/product.html';
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/api/books/${bookId}`);
    const book = await response.json();

    // Cập nhật DOM cho phần hình ảnh
    document.querySelector('.product-image img').src = book.imageUrl;
    document.querySelector('.product-image img').alt = book.title;

    // Cập nhật thông tin trong .product-info
    document.querySelector('.product-info').innerHTML = `
      <h1>${book.title}</h1>
      <p><strong>Tác giả:</strong> ${book.author}</p>
      <p><strong>Danh mục:</strong> ${book.category}</p>
      <p><strong>Giá:</strong> ${book.price.toLocaleString()} VND</p>
      <p><strong>Số lượng tồn kho:</strong> ${book.stockQuantity}</p>
      <p><strong>Mô tả sản phẩm:</strong> ${book.description.replace(/\n/g, '<br/>')}</p>
      <div class="buttons">
        <button class="add-to-cart">Thêm vào giỏ hàng</button>
        <button class="buy-now">Mua ngay</button>
      </div>
      <div class="back">
        <a href="../pages/product.html">Quay Lại</a>
      </div>
    `;
  } catch (error) {
    console.error('Lỗi khi tải chi tiết sách:', error);
  }

  // Gắn sự kiện "Thêm vào giỏ hàng"
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (!isLoggedIn()) {
        Swal.fire({
          icon: 'warning',
          title: 'Chưa đăng nhập',
          html: 'Vui lòng đăng nhập để thêm vào giỏ hàng. <br/><small><a href="../pages/login.html">Nhấn vào đây để đăng nhập.</a></small>',
          confirmButtonText: 'Đăng nhập',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '../pages/login.html'; // Chuyển hướng đến trang đăng nhập
          }
        });
      } else {
        // Logic thêm vào giỏ hàng
        alert('Đã thêm vào giỏ hàng!');
      }
    });
  });

  // ✅ Gắn sự kiện "Xem chi tiết"
  const buyNow = document.querySelectorAll('.buy-now');
  buyNow.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (!isLoggedIn()) {
        Swal.fire({
          icon: 'warning',
          title: 'Chưa đăng nhập',
          html: 'Vui lòng đăng nhập để mua ngay. <br/><small><a href="../pages/login.html">Nhấn vào đây để đăng nhập.</a></small>',
          confirmButtonText: 'Đăng nhập',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '../pages/login.html'; // Chuyển hướng đến trang đăng nhập
          }
        });
      } else {
        const bookId = e.target.dataset.id;
        window.location.href = `../pages/productDetails.html?id=${bookId}`;
      }
    });
  });

  const isLoggedIn = () => {
    // Kiểm tra trong localStorage (hoặc sessionStorage) xem người dùng đã đăng nhập hay chưa
    // Giả sử người dùng đăng nhập thì có một token hoặc id trong localStorage
    return localStorage.getItem('userToken') !== null; // Thay đổi với thông tin bạn lưu trong localStorage
  };
});
