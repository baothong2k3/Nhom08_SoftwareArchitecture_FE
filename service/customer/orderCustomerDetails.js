const orderId = localStorage.getItem("orderIdSelected");
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", getOrderDetails);

async function getOrderDetails() {
    const orderDetailsContainer = document.querySelector(".order-info");

    if (!orderId || !token) {
        orderDetailsContainer.innerHTML = '<p class="error-message">Thiếu thông tin đơn hàng hoặc token xác thực.</p>';
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/orders/${orderId}/details`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            orderDetailsContainer.innerHTML = '<p class="error-message">Không thể tải chi tiết đơn hàng.</p>';
            console.error("Lỗi phản hồi API:", response.status, response.statusText);
            return;
        }

        const orderDetails = await response.json();

        renderOrderDetails(orderDetails);

    } catch (error) {
        console.error("Lỗi khi gọi API chi tiết đơn hàng:", error);
        orderDetailsContainer.innerHTML = '<p class="error-message">Không thể kết nối đến máy chủ.</p>';
    }
}

function renderOrderDetails(details) {
    const container = document.querySelector(".order-info");
    if (!container) {
        console.error("Không tìm thấy container .order-info");
        return;
    }

    if (!details || details.length === 0) {
        container.innerHTML = '<p class="error-message">Không có sản phẩm nào trong đơn hàng.</p>';
        return;
    }

    let html = `
        <table class="order-details-table">
            <thead>
                <tr>
                    <th>Ảnh</th>
                    <th>Tên sách</th>
                    <th>Số lượng</th>
                    <th>Đơn giá (VNĐ)</th>
                    <th>Tổng giá (VNĐ)</th>
                </tr>
            </thead>
            <tbody>
    `;

    details.forEach(item => {
        const imageUrl = item.image || 'https://via.placeholder.com/60'; // Hình ảnh dự phòng nếu không có
        html += `
            <tr>
                <td><img src="${imageUrl}" alt="${item.bookTitle}" /></td>
                <td>${item.bookTitle}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toLocaleString('vi-VN')}</td>
                <td>${(item.quantity * item.price).toLocaleString('vi-VN')}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}