(() => {
    const token = localStorage.getItem("token");
    let currentPage = 0;
    const pageSize = 10;
    let totalElements = 0;
    let currentStatus = "PLACED";
    let isPhoneSearch = false; // Track if in phone search mode
    let currentPhone = ""; // Store current phone number for pagination

    // Hàm fetch đơn hàng theo trang + trạng thái
    const fetchPagedOrders = async (page = 0, size = 10, status = null) => {
        try {
            const url = new URL("http://localhost:8080/api/orders/paged");
            url.searchParams.append("page", page);
            url.searchParams.append("size", size);
            if (status) {
                url.searchParams.append("status", status);
            }

            const res = await fetch(url.toString(), {
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
            return { content: [], totalElements: 0 };
        }
    };

    // Hiển thị danh sách đơn hàng
    const displayOrders = (orders) => {
        const tableBody = document.getElementById("orderTableBody");
        tableBody.innerHTML = '';

        if (!orders || orders.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td colspan="6" style="text-align: center; padding: 20px; font-size: 18px; color: gray;">
                Không có đơn hàng nào để hiển thị.
            </td>
            `;
            tableBody.appendChild(row);
            return;
        }

        orders.forEach(order => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>DH${order.id.toString().padStart(3, "0")}</td>
                <td>${order.userName}</td>
                <td>${convertOrderStatus(order.status)}</td>
                <td>${convertPayment(order.paymentMethod)}</td>
                <td>${new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                <td>${new Date(order.updatedAt).toLocaleDateString("vi-VN")}</td>
                <td>${order.phoneNumber}</td>
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
                try {
                    const response = await fetch(`http://localhost:8080/api/orders/${order.id}/update-status?newStatus=${selectedStatus}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) throw new Error("Lỗi khi cập nhật trạng thái");
                    const updatedOrder = await response.json();
                    row.children[2].textContent = convertOrderStatus(updatedOrder.status);
                    selectElement.innerHTML = getValidStatusOptions(updatedOrder.status);
                } catch (error) {
                    console.error("Cập nhật trạng thái lỗi:", error);
                    alert("Không thể cập nhật trạng thái");
                }
            });
        });
    };

    // Hiển thị phân trang
    const displayPagination = (page, totalPages) => {
        const pageNumbersElement = document.getElementById('page-numbers');
        const prevButton = document.querySelector('.pagination button:first-child');
        const nextButton = document.querySelector('.pagination button:last-child');

        pageNumbersElement.textContent = `Trang ${page + 1} / ${totalPages || 1}`;

        // Vô hiệu hóa nút nếu không thể chuyển trang
        prevButton.disabled = page <= 0;
        nextButton.disabled = page >= totalPages - 1 || totalPages === 0;
    };

    // Lấy tổng số trang
    const getTotalPages = () => Math.ceil(totalElements / pageSize);

    // Chuyển trang
    const changePage = async (direction) => {
        const totalPages = getTotalPages();
        currentPage += direction;

        if (currentPage < 0) currentPage = 0;
        if (currentPage >= totalPages) currentPage = totalPages - 1;

        let result;
        if (isPhoneSearch) {
            result = await fetchOrdersByPhone(currentPhone, currentPage);
        } else {
            result = await fetchPagedOrders(currentPage, pageSize, currentStatus);
        }

        if (result && result.content) {
            displayOrders(result.content);
            displayPagination(currentPage, getTotalPages());
        }
    };

    // Khởi tạo trang
    const initializePage = async () => {
        isPhoneSearch = false; // Reset phone search mode
        currentPhone = ""; // Clear phone number
        const result = await fetchPagedOrders(currentPage, pageSize, currentStatus);
        if (result && result.content) {
            displayOrders(result.content);
            displayPagination(currentPage, getTotalPages());
        } else {
            displayOrders([]);
            displayPagination(currentPage, 0);
        }
    };

    // Tìm đơn hàng theo số điện thoại
    const fetchOrdersByPhone = async (phone, page = 0) => {
        try {
            const url = new URL("http://localhost:8080/api/orders/search-by-phone");
            url.searchParams.append("phone", phone);
            url.searchParams.append("page", page); // Thêm tham số page
            url.searchParams.append("size", pageSize);

            const res = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Không tìm thấy đơn hàng");
            const data = await res.json();
            console.log(data); // Log toàn bộ response
            totalElements = data.totalElements || 0;
            currentPage = data.number || 0; // Cập nhật currentPage từ response
            return data;
        } catch (error) {
            console.warn("Không tìm thấy đơn hàng theo số điện thoại:", error);
            totalElements = 0;
            return { content: [], totalElements: 0, number: 0, totalPages: 0 };
        }
    };

    // Bắt sự kiện nhập số điện thoại
    document.getElementById("phoneSearchInput").addEventListener("input", async (e) => {
        const phone = e.target.value.trim();
        const phoneRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$/;

        if (phoneRegex.test(phone)) {
            isPhoneSearch = true; // Kích hoạt chế độ tìm kiếm số điện thoại
            currentPhone = phone; // Lưu số điện thoại
            currentPage = 0; // Reset về trang đầu
            const data = await fetchOrdersByPhone(phone);
            displayOrders(data.content);
            displayPagination(data.number, data.totalPages);
        } else if (phone === "") {
            // Nếu xóa nội dung -> quay lại danh sách gốc
            await initializePage();
        }
    });

    // Khi chọn trạng thái đơn hàng
    document.getElementById("categoryFilter").addEventListener("change", async (e) => {
        const selected = e.target.value;
        currentStatus = selected === "all" ? null : selected;
        currentPage = 0;
        isPhoneSearch = false; // Reset phone search mode
        currentPhone = ""; // Clear phone number
        await initializePage();
    });

    window.viewOrder = (orderId) => {
        localStorage.setItem("orderIdSelected", orderId);
        window.location.href = "../pages/orderAdminDetails.html";
    };

    const convertOrderStatus = (status) => {
        switch (status) {
            case "PLACED": return "Đang xử lý";
            case "CONFIRMED": return "Đã xác nhận đơn hàng";
            case "SHIPPING": return "Đang giao hàng";
            case "DELIVERED": return "Đã giao hàng";
            case "CANCELED": return "Đã hủy";
            case "REJECTED": return "Bị từ chối";
            default: return status;
        }
    };

    const convertPayment = (method) => method === "COD" ? "Chưa thanh toán" : "Đã thanh toán";

    const getValidStatusOptions = (currentStatus) => {
        const optionsMap = {
            PLACED: ["CONFIRMED", "CANCELED"],
            CONFIRMED: ["SHIPPING", "CANCELED"],
            SHIPPING: ["DELIVERED"],
            DELIVERED: ["REJECTED"],
            REJECTED: [],
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

    // Sự kiện phân trang
    document.querySelector('.pagination button:first-child')?.addEventListener('click', () => changePage(-1));
    document.querySelector('.pagination button:last-child')?.addEventListener('click', () => changePage(1));

    // Tải dữ liệu khi trang load
    window.onload = initializePage;
})();