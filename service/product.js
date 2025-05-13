(() => {
  let currentPage = 0;  // Trang hiện tại
  const pageSize = 12;   // Số sách mỗi trang
  let totalElements = 0; // Tổng số sách

  // Hàm fetch dữ liệu sách với phân trang
  const fetchPagedBooks = async (page = 0, size = 10) => {
    try {
      const res = await apiClient.get('books/paged', { params: { page, size } });
      totalElements = res.data.totalElements;  // Lưu tổng số sách
      return res.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi lấy dữ liệu sách:', error);
    }
  };

  // Hàm hiển thị danh sách sách
  const displayBooks = (books) => {
    const productListElement = document.getElementById('product-list');
    productListElement.innerHTML = '';  // Xóa nội dung cũ

    books.forEach(book => {
      const bookElement = document.createElement('div');
      bookElement.classList.add('product-item');
      bookElement.innerHTML = `
      <img src="${book.imageUrl}" alt="${book.title}" class="product-image" />
      <div class="product-details">
        <h3 class="product-title"><span class="label">Tên sách: </span>${book.title}</h3>
        <p class="product-author"><span class="label">Tác giả: </span> ${book.author}</p>
        <p class="product-price"><span class="label">Giá: </span> ${book.price} VND</p>
        <p class="product-category"><span class="label">Danh mục: </span> ${book.category}</p>
        <button class="add-to-cart" data-id="${book.id}">Thêm vào giỏ hàng</button>
        <button class="view-details" data-id="${book.id}">Xem chi tiết</button>
      </div>
    `;
      productListElement.appendChild(bookElement);
    });

    // Gắn lại sự kiện sau khi render sách
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
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
          return;
        }

        const bookId = e.target.getAttribute('data-id');
        const token = localStorage.getItem('token');

        try {
          const res = await fetch(`http://localhost:8080/api/cart/add?bookId=${bookId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!res.ok) {
            throw new Error('Lỗi khi thêm vào giỏ hàng');
          }

          Swal.fire({
            icon: 'success',
            title: 'Đã thêm vào giỏ hàng',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (err) {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.'
          });
        }
      });
    });

    const detailButtons = document.querySelectorAll('.view-details');
    detailButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const bookId = e.target.dataset.id;
        window.location.href = `../pages/productDetail.html?id=${bookId}`;
      });
    });
  };

  const isLoggedIn = () => {
    return localStorage.getItem('userToken') !== null;
  };


  // Hàm hiển thị phân trang
  const displayPagination = (page, totalPages) => {
    const paginationElement = document.getElementById('pagination');
    const pageNumbersElement = document.getElementById('page-numbers');

    pageNumbersElement.innerHTML = `Trang ${page + 1} / ${totalPages}`;
  };

  // Hàm thay đổi trang
  const changePage = async (direction) => {
    const totalPages = getTotalPages();  // Lấy tổng số trang
    currentPage += direction;

    if (currentPage < 0) currentPage = 0;
    if (currentPage >= totalPages) currentPage = totalPages - 1;

    const books = await fetchPagedBooks(currentPage, pageSize);
    displayBooks(books.content);  // Hiển thị sách
    displayPagination(currentPage, totalPages);  // Cập nhật phân trang
  };

  // Hàm lấy tổng số trang
  const getTotalPages = () => {
    return Math.ceil(totalElements / pageSize);
  };


  // Hàm khởi tạo trang đầu tiên
  const initializePage = async () => {
    const books = await fetchPagedBooks(currentPage, pageSize);
    displayBooks(books.content);  // Hiển thị sách
    const totalPages = getTotalPages();  // Lấy tổng số trang
    displayPagination(currentPage, totalPages);  // Hiển thị phân trang
  };

  // Khi trang web load
  window.onload = initializePage;

  // Gắn sự kiện cho các nút phân trang
  document.querySelector('.pagination button:first-child').addEventListener('click', () => changePage(-1));
  document.querySelector('.pagination button:last-child').addEventListener('click', () => changePage(1));

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('view-details')) {
      const bookId = e.target.getAttribute('data-id');
      localStorage.setItem('selectedBookId', bookId);
      window.location.href = '../pages/productDetail.html';
    }
  });
})();