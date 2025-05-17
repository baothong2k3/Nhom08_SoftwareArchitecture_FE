(() => {
    const token = localStorage.getItem("token");
    let currentPage = 0;
    const pageSize = 10;
    let totalElements = 0;

    // Hàm fetch đơn hàng theo trang
    const fetchPagedOrders = async (page = 0, size = 10) => {
        try {
            const res = await fetch(`http://localhost:8080/api/orders/paged?page=${page}&size=${size}`, {
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
            console.error("Lỗi khi lấy dữ liệu đơn hàng:", error);
        }
    };

    const getValidStatusOptions = (currentStatus) => {
        const optionsMap = {
            PLACED: ["CONFIRMED", "CANCELED"],
            CONFIRMED: ["SHIPPING", "CANCELED"],
            SHIPPING: ["DELIVERED"],
            DELIVERED: ["REJECTED"],
            CANCELED: []
        };

        const labels = {
            PLACED: "Đang xử lý",
            CONFIRMED: "Xác nhận đơn",
            SHIPPING: "Giao hàng",
            DELIVERED: "Đã giao hàng",
            REJECTED: "Bị từ chối",
            CANCELED: "Hủy đơn"
        };

        const currentOption = `<option value="${currentStatus}" selected>${labels[currentStatus] || currentStatus}</option>`;
        const nextOptions = (optionsMap[currentStatus] || []).map(status =>
            `<option value="${status}">${labels[status] || status}</option>`
        ).join("");

        return currentOption + nextOptions;
    };


    // Hàm hiển thị danh sách đơn hàng
    const displayOrders = (orders) => {
        const tableBody = document.getElementById("orderTableBody");
        tableBody.innerHTML = '';

        orders.forEach(order => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>DH${order.id.toString().padStart(3, "0")}</td>
                <td>${order.userName}</td>
                <td>${convertOrderStatus(order.status)}</td>
                <td>${convertPayment(order.paymentMethod)}</td>
                <td>
                    <select name="orderStatus" id="orderStatus-${order.id}" data-order-id="${order.id}" style="width: 180px;">
                        ${getValidStatusOptions(order.status)}
                   </select>
                </td>
                <td>
                   <button class="btn btn-blue" onclick="viewOrder(${order.id})">Xem chi tiết</button>
                </td>
                
            `;
            tableBody.appendChild(row);

            const selectElement = row.querySelector(`#orderStatus-${order.id}`);
            selectElement.addEventListener('change', async (event) => {
                const selectedStatus = event.target.value;
                const orderId = order.id;
                try {
                    const response = await fetch(`http://localhost:8080/api/orders/${orderId}/update-status?newStatus=${selectedStatus}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        throw new Error(`Lỗi khi cập nhật trạng thái: ${response.status}`);
                    }
                    const updatedOrder = await response.json();
                    row.children[2].textContent = convertOrderStatus(updatedOrder.status);
                    selectElement.innerHTML = getValidStatusOptions(updatedOrder.status);
                } catch (error) {
                    console.error("Lỗi cập nhật trạng thái:", error);
                    alert("Cập nhật trạng thái thất bại. Vui lòng thử lại.");
                }
            });
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

        const result = await fetchPagedOrders(currentPage, pageSize);
        if (!result || !result.content) {
            console.warn("Không có dữ liệu đơn hàng để hiển thị");
            return;
        }
        displayOrders(result.content);
        displayPagination(currentPage, totalPages);
    };

    // Tính tổng số trang
    const getTotalPages = () => {
        return Math.ceil(totalElements / pageSize);
    };

    // Khởi tạo lần đầu
    const initializePage = async () => {
        const result = await fetchPagedOrders(currentPage, pageSize);
        if (!result || !result.content) {
            console.warn("Không có dữ liệu đơn hàng để hiển thị");
            return;
        }
        displayOrders(result.content);
        const totalPages = getTotalPages();
        displayPagination(currentPage, totalPages);
    };

    // Hàm chuyển trang chi tiết
    window.viewOrder = (orderId) => {
        localStorage.setItem("orderIdSelected", orderId);
        window.location.href = "../pages/orderAdminDetails.html";
    };

    // Trạng thái đơn hàng
    const convertOrderStatus = (status) => {
        switch (status) {
            case "PLACED": return "Đang xử lý";
            case "SHIPPING": return "Đang giao hàng";
            case "CONFIRMED": return "Đã xác nhận đơn hàng";
            case "DELIVERED": return "Đã giao hàng";
            case "CANCELED": return "Đã hủy";
            case "REJECTED": return "Bị trả lại";
            default: return status;
        }
    };

    // Phương thức thanh toán
    const convertPayment = (method) => {
        return method === "COD" ? "Chưa thanh toán" : "Đã thanh toán";
    };

    // Khi trang load
    window.onload = initializePage;

    // Sự kiện nút phân trang
    document.querySelector('.pagination button:first-child')?.addEventListener('click', () => changePage(-1));
    document.querySelector('.pagination button:last-child')?.addEventListener('click', () => changePage(1));
})();
