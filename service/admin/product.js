
(() => {
    let currentPage = 0;
    const pageSize = 12;
    let totalElements = 0;


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
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';
        books.forEach(product => {
            const productRow = document.createElement('tr');

            // Tạo các cột cho sản phẩm
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
            status: product.status,
            imageUrl: product.imageUrl || ''
        });

        window.location.href = `updateProduct.html?${params.toString()}`;
    };


    // Hàm hiển thị phân trang
    const displayPagination = (page, totalPages) => {
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
        displayBooks(books.content);
        const totalPages = getTotalPages();
        displayPagination(currentPage, totalPages);  // Hiển thị phân trang
    };

    // Khi trang web load
    window.onload = initializePage;

    // Gắn sự kiện cho các nút phân trang
    document.querySelector('.pagination button:first-child').addEventListener('click', () => changePage(-1));
    document.querySelector('.pagination button:last-child').addEventListener('click', () => changePage(1));
})();


