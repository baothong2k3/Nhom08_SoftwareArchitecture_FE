const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", getOrder);

async function getOrder() {
    const container = document.querySelector(".container");
    container.innerHTML = ""; // hoặc giữ nguyên nếu bạn muốn xóa nội dung cũ

    try {
        const response = await fetch("http://localhost:8080/api/orders/user", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        const orders = await response.json();

        if (!response.ok) {
            console.error("Lỗi khi lấy đơn hàng:", orders.message || orders);
            container.innerHTML += "<p>Không thể tải đơn hàng.</p>";
            return;
        }

        if (orders.length === 0) {
            container.innerHTML += "<p>Bạn chưa có đơn hàng nào.</p>";
            container.style.textAlign = "center";
            container.style.fontSize = "20px";
            container.style.fontWeight = "bold";
            container.style.color = "red";
            return;
        }

        orders.forEach(order => {
            const canCancel = order.status === "PLACED" || order.status === "CONFIRMED";
            const isPaid = order.status === "DELIVERED" || order.paymentMethod !== "COD";
            const orderHTML = `
        <div class="order-item">
          <div class="order-info">
            <p class="order-title">Đơn  #${formatDate(order.createdAt)}</p>
            <p class="order-status">Tình trạng đơn hàng: ${translateOrderStatus(order.status)}</p>
            <p class="order-status">Tình trạng thanh toán: <strong>${isPaid ? "Đã thanh toán" : "Chưa thanh toán"}</strong></p>
            <p class="order-status">Người nhận: ${order.userName}</p>
            <p class="order-status">SĐT: ${order.phoneNumber}</p>
            <p class="order-status">Địa chỉ: ${order.shippingAddress}</p>
            <p class="order-status">Tổng tiền: ${formatCurrency(order.totalPrice)}</p>
            <p class="order-status">Ngày đặt: ${formatDate(order.createdAt)}</p>
          </div>
          <div class="order-actions">
            <button class="btn-orderdetails" onclick="goToDetail(${order.id})">Xem chi tiết</button>
            <button class="cancel-btn ${canCancel ? "enabled" : "disabled"}" ${canCancel ? "" : "disabled"} data-orderid="${order.id}">Hủy đơn</button>
          </div>
        </div>
      `;
            container.innerHTML += orderHTML;
        });


        //HỦY ĐƠN HÀNG
        // Gắn sự kiện cho nút hủy đơn sau khi render xong
        document.querySelectorAll(".cancel-btn.enabled").forEach(btn => {
            btn.addEventListener("click", async function () {
                const orderId = this.dataset.orderid;;
                Swal.fire({
                    title: `Hủy đơn hàng #${orderId}?`,
                    text: "Bạn sẽ không thể khôi phục lại đơn hàng này!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Hủy đơn hàng",
                    cancelButtonText: "Không",
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            const response = await fetch(`http://localhost:8080/api/orders/${orderId}/cancel`, {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`,
                                }
                            });

                            const resultData = await response.json();
                            if (response.ok) {
                                Swal.fire("Đã hủy!", "Đơn hàng đã được hủy thành công.", "success");
                                getOrder(); // reload
                            } else {
                                Swal.fire("Thất bại", resultData.message || "Không thể hủy đơn hàng.", "error");
                            }
                        } catch (error) {
                            console.error("Lỗi khi gọi hủy đơn:", error);
                            Swal.fire("Lỗi", "Không thể kết nối đến máy chủ.", "error");
                        }
                    }
                });

            });
        });

    } catch (error) {
        console.error("Lỗi kết nối:", error);
        container.innerHTML += "<p>Không thể kết nối đến máy chủ.</p>";
    }
}


function translateOrderStatus(status) {
    switch (status) {
        case "PLACED": return "Đang xử lý";
        case "CONFIRMED": return "Đã xác nhận";
        case "SHIPPING": return "Đang vận chuyển";
        case "DELIVERED": return "Đã giao";
        case "CANCELED": return "Đã hủy";
        default: return status;
    }
}

function formatCurrency(amount) {
    return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString("vi-VN", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit"
    });
}

function goToDetail(orderId) {
    localStorage.setItem("orderIdSelected", orderId);
    window.location.href = "../pages/orderCustomerDetails.html";
}
