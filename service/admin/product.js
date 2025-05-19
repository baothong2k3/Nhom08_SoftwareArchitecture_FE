(() => {
    let currentPage = 0;
    const pageSize = 12;
    let totalElements = 0;

    // Hàm fetch dữ liệu sách theo keyword và category
    const fetchPagedBooks = async (page = 0, size = pageSize, keyword = '', category = 'all') => {
        try {
            let res;
            if (keyword) {
                res = await apiClient.get('books/paged', {
                    params: { page, size, keyword }
                });
            } else if (category === 'all') {
                res = await apiClient.get('books/paged', {
                    params: { page, size }
                });
            } else {
                res = await apiClient.get('books/category', {
                    params: { page, size, category }
                });
            }

            totalElements = res.data.totalElements;
            return res.data;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy dữ liệu sách:', error);
            return { content: [], totalElements: 0 };
        }
    };

    // Hàm hiển thị danh sách sách
    const displayBooks = (books) => {
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';
        books.forEach(product => {
            const productRow = document.createElement('tr');
            productRow.innerHTML = `
                <td>${product.id}</td>
                <td><img src="${product.imageUrl}" alt="${product.title}" /></td>
                <td>${product.title}</td>
                <td>${product.price.toLocaleString()} VND</td>
                <td>${product.stockQuantity}</td>
                <td>${product.category}</td>
                <td>${product.status ? 'Đang bán' : 'Ngừng bán'}</td>
                <td>
                    <button class="btn btn-blue" onclick='redirectToUpdatePage(${JSON.stringify(product)})'>Cập nhật</button>
                </td>
            `;
            productList.appendChild(productRow);
        });
    };

    window.redirectToUpdatePage = (product) => {
        const params = new URLSearchParams({
            id: product.id,
            title: product.title,
            price: product.price,
            discount: product.discountPercent || 0,
            priceAfterDiscount: product.discountedPrice || 0,
            stockQuantity: product.stockQuantity,
            category: product.category || '',
            status: product.status,
            publicId: product.publicId || '',
            author: product.author || '',
            description: product.description || '',
            imageUrl: product.imageUrl || ''
        });

        window.location.href = `updateProduct.html?${params.toString()}`;
    };

    // Hiển thị phân trang
    const displayPagination = (page, totalPages) => {
        const pageNumbersElement = document.getElementById('page-numbers');
        const prevButton = document.querySelector('.pagination button:first-child');
        const nextButton = document.querySelector('.pagination button:last-child');

        pageNumbersElement.innerHTML = `Trang ${page + 1} / ${totalPages || 1}`;
        prevButton.disabled = page <= 0;
        nextButton.disabled = page >= totalPages - 1 || totalPages === 0;
    };

    // Thay đổi trang
    const changePage = async (direction) => {
        const totalPages = getTotalPages();
        currentPage += direction;

        if (currentPage < 0) currentPage = 0;
        if (currentPage >= totalPages) currentPage = totalPages - 1;

        const keyword = document.getElementById('searchInput').value.trim();
        const category = document.getElementById('categoryFilter').value;
        const books = await fetchPagedBooks(currentPage, pageSize, keyword, category);
        displayBooks(books.content);
        displayPagination(currentPage, totalPages);
    };

    const getTotalPages = () => Math.ceil(totalElements / pageSize);

    // Tìm kiếm sách khi nhập hoặc chọn danh mục
    window.searchBooks = async function () {
        const keyword = document.getElementById('searchInput').value.trim();
        const category = document.getElementById('categoryFilter').value;
        currentPage = 0;

        if (keyword) {
            document.getElementById('categoryFilter').value = "all";
        }

        try {
            const res = await fetchPagedBooks(currentPage, pageSize, keyword, category);
            totalElements = res.totalElements;
            const totalPages = getTotalPages();

            displayBooks(res.content);
            displayPagination(currentPage, totalPages);
        } catch (err) {
            console.error("Lỗi khi tìm kiếm sách:", err);
            displayBooks([]);
            displayPagination(currentPage, 0);
        }
    };

    // Khởi tạo trang đầu tiên
    const initializePage = async () => {
        const keyword = document.getElementById('searchInput').value.trim();
        const category = document.getElementById('categoryFilter').value;
        const books = await fetchPagedBooks(currentPage, pageSize, keyword, category);
        displayBooks(books.content);
        const totalPages = getTotalPages();
        displayPagination(currentPage, totalPages);
    };

    // Sự kiện khi trang web load
    window.onload = initializePage;

    // Gắn sự kiện cho các nút phân trang
    document.querySelector('.pagination button:first-child').addEventListener('click', () => changePage(-1));
    document.querySelector('.pagination button:last-child').addEventListener('click', () => changePage(1));

    // Gắn sự kiện thay đổi danh mục
    document.getElementById('categoryFilter').addEventListener('change', searchBooks);
})();

