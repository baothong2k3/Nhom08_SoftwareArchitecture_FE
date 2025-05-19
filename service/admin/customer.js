(() => {
    const token = localStorage.getItem("token");
    let currentPage = 0;
    const pageSize = 10;
    let totalElements = 0;

    // Inject CSS for consistent table and button styling
    const style = document.createElement('style');
    style.textContent = `
        #customerTableBody tr {
            height: 60px;
            max-height: 60px;
            overflow: hidden;
        }
        #customerTableBody td {
            padding: 8px;
            vertical-align: middle;
            word-break: break-word;
            max-width: 200px;
        }
        .pagination button {
            padding: 8px 16px;
            margin: 0 5px;
            cursor: pointer;
            background-color: #0984e3;
            color: white;
            border: none;
            border-radius: 4px;
            transition: opacity 0.3s;
        }
        .pagination button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        #searchInput {
            padding: 8px;
            width: 200px;
            border: 1px solid #b2bec3;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);

    // Hàm fetch đơn hàng theo trang
    const fetchPagedCustomers = async (page = 0, size = pageSize, phoneNumber = '') => {
        try {
            const url = new URL('http://localhost:8080/api/user/paged');
            url.searchParams.append('page', page);
            url.searchParams.append('size', size);
            if (phoneNumber) {
                url.searchParams.append('phoneNumber', phoneNumber);
            }
            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token || ''}`
                }
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            totalElements = data.totalElements || 0;
            return data;
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu khách hàng:", error);
            return { content: [], totalElements: 0, totalPages: 0 };
        }
    };

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    // Hàm hiển thị danh sách khách hàng
    const displayCustomers = (list) => {
        const tableBody = document.getElementById("customerTableBody");
        tableBody.innerHTML = '';

        list.forEach(c => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>KH${c.id}</td>
                <td style="text-align: left;">${c.fullName}</td>
                <td style="text-align: left;">${c.phoneNumber}</td>
                <td style="text-align: left;">${c.email && c.email.trim() ? c.email : ''}</td>
                <td style="text-align: left;">${formatDate(c.createdAt)}</td>
                <td style="text-align: left;">${c.addresses.map(addr => '•  ' + addr).join('<br>')}</td>
            `;
            tableBody.appendChild(row);
            console.log(c);
        });
    };

    // Hiển thị phân trang
    const displayPagination = (page, totalPages) => {
        const pageNumbersElement = document.getElementById('page-numbers');
        const prevButton = document.querySelector('.pagination button:first-child');
        const nextButton = document.querySelector('.pagination button:last-child');

        pageNumbersElement.innerHTML = `Trang ${page + 1} / ${totalPages || 1}`;

        // Enable/disable buttons
        prevButton.disabled = page <= 0;
        nextButton.disabled = page >= totalPages - 1 || totalPages === 0;
    };

    // Chuyển trang
    const changePage = async (direction) => {
        const totalPages = getTotalPages();
        currentPage += direction;

        if (currentPage < 0) currentPage = 0;
        if (currentPage >= totalPages) currentPage = totalPages - 1;

        const keyword = document.getElementById('searchInput').value.trim();
        const result = await fetchPagedCustomers(currentPage, pageSize, keyword);
        displayCustomers(result.content || []);
        displayPagination(currentPage, result.totalPages || 0);
    };

    // Tính tổng số trang
    const getTotalPages = () => {
        return Math.ceil(totalElements / pageSize) || 1;
    };

    // Khởi tạo lần đầu
    const initializePage = async () => {
        const result = await fetchPagedCustomers(currentPage, pageSize);
        displayCustomers(result.content || []);
        displayPagination(currentPage, result.totalPages || 0);
    };

    // Hàm tìm kiếm khách hàng
    window.searchCustomers = async function () {
        const keyword = document.getElementById('searchInput').value.trim();
        currentPage = 0; // Reset to first page

        // Validate phone number format
        const phoneRegex = /^0\d{9,10}$/;
        const isValidPhone = keyword === '' || phoneRegex.test(keyword);

        if (!isValidPhone) {
            // Invalid phone number: show all customers
            const result = await fetchPagedCustomers(currentPage, pageSize);
            displayCustomers(result.content || []);
            displayPagination(currentPage, result.totalPages || 0);
            return;
        }

        // Valid phone number or empty: search or show all
        const result = await fetchPagedCustomers(currentPage, pageSize, keyword);
        displayCustomers(result.content || []);
        displayPagination(currentPage, result.totalPages || 0);
    };

    // Khi trang load
    window.onload = initializePage;

    // Sự kiện nút phân trang
    document.querySelector('.pagination button:first-child')?.addEventListener('click', () => changePage(-1));
    document.querySelector('.pagination button:last-child')?.addEventListener('click', () => changePage(1));
})();