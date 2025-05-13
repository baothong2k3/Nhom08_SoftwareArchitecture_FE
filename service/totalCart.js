document.addEventListener("DOMContentLoaded", () => {
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
});
