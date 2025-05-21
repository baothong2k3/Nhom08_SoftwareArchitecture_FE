(() => {
  let currentPage = 0;
  const pageSize = 12;
  let totalPages = 0;
  let allBooks = []; // Dữ liệu lưu toàn bộ sách

  const fetchAllBooks = async () => {
    try {
      const res = await window.apiClient.get('books/paged', {
        params: { page: 0, size: 1000 },
      });
      return res.data;
    } catch (error) {
      console.error('Lỗi khi lấy sách:', error);
    }
  };

  const isLoggedIn = () => {
    return localStorage.getItem('token') !== null;
  };

  const displayBooks = (books) => {
    const productListElement = document.getElementById('product-list');
    productListElement.innerHTML = '';


    books.forEach((book) => {

      if (book.stockQuantity <= 0 || book.status === false) {
        return;
      }
      const bookElement = document.createElement('div');
      bookElement.classList.add('product-item');
      bookElement.innerHTML = `
    <div style="position: relative; display: inline-block;">
    <img src="${book.imageUrl.replace(/^http:/, 'https:')}" alt="${book.title}" class="product-image" />
    ${book.discountPercent != null && book.discountedPrice != null && book.discountedPrice !== book.price
          ? `<div style="
            position: absolute;
            top: 8px;
            right: 8px;
            background-color: red;
            color: white;
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
            z-index: 10;
            font-size: 0.9rem;
          ">
            -${book.discountPercent}%
          </div>`
          : ''
        }
   </div>
   <div class="product-details">
    <h3 class="product-title"><span class="label">Tên sách: </span>${book.title}</h3>
    <p class="product-author"><span class="label">Tác giả: </span> ${book.author}</p>
    <p class="product-category"><span class="label">Danh mục: </span> ${book.category}</p>
    ${book.discountPercent != null && book.discountedPrice != null && book.discountedPrice !== book.price
          ? `
          <p class="product-price">
            <span class="label">Giá: </span> 
            <span style="color: red; font-weight: bold;">
              ${book.discountedPrice.toLocaleString("vi-VN")} VND
            </span>
            <span style="text-decoration: line-through; color: gray; margin-left: 8px;">
              ${book.price.toLocaleString("vi-VN")} VND
            </span>
          </p>
        `
          : `<p class="product-price" style="color: red; font-weight: bold;">
            <span class="label">Giá: </span> ${book.price.toLocaleString("vi-VN")} VND
          </p>`
        }
    <button class="add-to-cart" data-id="${book.id}">Thêm vào giỏ hàng</button>
    <button class="view-details" data-id="${book.id}">Xem chi tiết</button>
   </div>
    `;
      productListElement.appendChild(bookElement);
    });

    // Gắn sự kiện "Thêm vào giỏ hàng"
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        if (!isLoggedIn()) {
          Swal.fire({
            icon: 'warning',
            title: 'Chưa đăng nhập',
            html: 'Vui lòng đăng nhập để thêm vào giỏ hàng.<br><a href="../pages/login.html">Đăng nhập ngay</a>',
            confirmButtonText: 'OK'
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

          totalCart();

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
            title: 'Không thể thêm vào giỏ hàng',
            text: 'Số lượng sản phẩm này trong giỏ hàng đã đạt mức tối đa cho phép.'
          });
        }
      });
    });

    // Gắn sự kiện "Xem chi tiết"
    const detailButtons = document.querySelectorAll('.view-details');
    detailButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const bookId = e.target.dataset.id;
        window.location.href = `../pages/productCustomerDetails.html?id=${bookId}`;
      });
    });
  };

  const displayPagination = (page, totalPages) => {
    const pageNumbersElement = document.getElementById('page-numbers');
    pageNumbersElement.innerHTML = `Trang ${page + 1} / ${totalPages}`;
  };

  const changePage = (direction) => {
    if (direction === -1 && currentPage === 0) return;
    if (direction === 1 && currentPage >= totalPages - 1) return;

    currentPage += direction;

    const start = currentPage * pageSize;
    const end = start + pageSize;
    const booksToDisplay = allBooks.slice(start, end);

    displayBooks(booksToDisplay);
    displayPagination(currentPage, totalPages);
    updateButtonStates(currentPage, totalPages);
  };

  const updateButtonStates = (page, totalPages) => {
    const prevButton = document.querySelector('.pagination button:first-child');
    const nextButton = document.querySelector('.pagination button:last-child');

    prevButton.disabled = page === 0;
    nextButton.disabled = page >= totalPages - 1;
  };

  const initializePage = async () => {
    const result = await fetchAllBooks();
    allBooks = result.content || [];
    totalPages = Math.ceil(allBooks.length / pageSize);

    const initialBooks = allBooks.slice(0, pageSize);
    displayBooks(initialBooks);
    displayPagination(currentPage, totalPages);
    updateButtonStates(currentPage, totalPages);
  };

  window.searchBooks = async function () {
    const keyword = document.getElementById('searchInput').value.trim();
    currentPage = 0; // Reset to first page

    document.getElementById('categoryFilter').value = "all";

    try {
      const res = await window.apiClient.get('books/paged', {
        params: {
          page: 0,
          size: 1000,
          keyword: keyword || '',
        }
      });

      const result = res.data;
      allBooks = result.content || [];
      totalPages = Math.ceil(allBooks.length / pageSize);
      currentPage = 0;

      const initialBooks = allBooks.slice(0, pageSize);
      displayBooks(initialBooks);
      displayPagination(currentPage, totalPages);
      updateButtonStates(currentPage, totalPages);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm sách:", err);
    }
  };

  document.getElementById("categoryFilter").addEventListener("change", async function () {
    const selectedCategory = this.value;

    if (selectedCategory === "all") {
      initializePage(); // hiển thị tất cả sách
      return;
    }

    try {
      const res = await window.apiClient.get('books/category', {
        params: {
          category: selectedCategory,
          page: 0,
          size: 1000,
        }
      });

      const result = res.data;
      allBooks = result.content || [];
      totalPages = Math.ceil(allBooks.length / pageSize);
      currentPage = 0;

      const initialBooks = allBooks.slice(0, pageSize);
      displayBooks(initialBooks);
      displayPagination(currentPage, totalPages);
      updateButtonStates(currentPage, totalPages);
    } catch (error) {
      console.error("Lỗi khi lọc theo danh mục:", error);
    }
  });



  window.onload = initializePage;

  document
    .querySelector('.pagination button:first-child')
    .addEventListener('click', () => changePage(-1));

  document
    .querySelector('.pagination button:last-child')
    .addEventListener('click', () => changePage(1));

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('view-details')) {
      const bookId = e.target.getAttribute('data-id');
      localStorage.setItem('selectedBookId', bookId);
      window.location.href = '../pages/productCustomerDetails.html';
    }
  });
})();


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
