document.addEventListener("DOMContentLoaded", () => {
    const selectedItems = JSON.parse(localStorage.getItem("selectedItems")) || [];

    const container = document.querySelector(".product-info");
    container.innerHTML = "";

    let total = 0;

    selectedItems.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("product-item");
        div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <strong>${item.name}</strong>
        <p>Số lượng: ${item.quantity}</p>
        <p>Giá: ${item.price.toLocaleString("vi-VN")} VND</p>
      </div>
    `;
        container.appendChild(div);
        total += item.price * item.quantity;
    });

    document.getElementById("total-price").innerText =
        "Tổng tiền: " + total.toLocaleString("vi-VN") + " VND";

    // --- Thêm chức năng drag-to-scroll ---
    const slider = container;
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener("mousedown", (e) => {
        isDown = true;
        slider.classList.add("dragging");
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener("mouseleave", () => {
        isDown = false;
        slider.classList.remove("dragging");
    });

    slider.addEventListener("mouseup", () => {
        isDown = false;
        slider.classList.remove("dragging");
    });

    slider.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5;
        slider.scrollLeft = scrollLeft - walk;
    });
});

function goBack() {
    localStorage.removeItem('selectedItems');
    window.history.back();
}

function toggleBankField() {
    const payment = document.getElementById("payment").value;
    const bankField = document.getElementById("bank-field");
    bankField.classList.toggle("hidden", payment !== "bank");
}
