(() => {
    const token = localStorage.getItem("token");
    let currentPage = 0;
    const pageSize = 10;
    let totalElements = 0;

    // Hàm fetch đơn hàng theo trang
    const fetchPagedCustomers = async (page = 0, size = 10) => {
        try {
            const res = await fetch(`http://localhost:8080/api/user/paged?page=${page}&size=${size}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            totalElements = data.totalElements;
            return data;
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu khách hàng:", error);
        }
    };

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
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
             <td >KH${c.id}</td>
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
        pageNumbersElement.innerHTML = `Trang ${page + 1} / ${totalPages}`;
    };

    // Chuyển trang
    const changePage = async (direction) => {
        const totalPages = getTotalPages();
        currentPage += direction;

        if (currentPage < 0) currentPage = 0;
        if (currentPage >= totalPages) currentPage = totalPages - 1;

        const result = await fetchPagedCustomers(currentPage, pageSize);
        if (!result || !result.content) {
            console.warn("Không có dữ liệu đơn hàng để hiển thị");
            return;
        }
        displayCustomers(result.content);
        displayPagination(currentPage, totalPages);
    };

    // Tính tổng số trang
    const getTotalPages = () => {
        return Math.ceil(totalElements / pageSize);
    };

    // Khởi tạo lần đầu
    const initializePage = async () => {
        const result = await fetchPagedCustomers(currentPage, pageSize);
        if (!result || !result.content) {
            console.warn("Không có dữ liệu khách hàng để hiển thị");
            return;
        }
        displayCustomers(result.content);
        const totalPages = getTotalPages();
        displayPagination(currentPage, totalPages);
    };

    // Hàm chuyển trang chi tiết
    window.viewCustomer = (orderId) => {
        window.location.href = `/admin/order-detail.html?id=${orderId}`;
    };

    // Khi trang load
    window.onload = initializePage;

    // Sự kiện nút phân trang
    document.querySelector('.pagination button:first-child')?.addEventListener('click', () => changePage(-1));
    document.querySelector('.pagination button:last-child')?.addEventListener('click', () => changePage(1));
})();
