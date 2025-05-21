const token = localStorage.getItem("token");
let savedAddresses = [];
let totalPrice = 0;

//Call API lấy thông tin người dùng
async function getUserInfoById() {
    try {
        const response = await fetch("http://localhost:8080/api/user/get", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });
        const result = await response.json();

        if (response.ok) {
            const user = result.message;

            // Gắn dữ liệu vào các ô input
            document.getElementById("receiverName").value = user.fullName || "";
            document.getElementById("phone").value = user.phoneNumber || "";
            document.getElementById("email").value = user.email || "";

            savedAddresses = user.addresses || [];

            loadAddressOptions();
        } else {
            console.error("Lỗi khi lấy user:", result.message || result);
        }
    } catch (error) {
        console.error("Lỗi kết nối đến server:", error);
    }
}

//Tính phí vận chuyển
function costShipping(t) {
    let shippingCost = 0;
    if (t < 250000) {
        shippingCost = t * 0.18;
        return shippingCost;
    } else if (t >= 250000 && t < 500000) {
        shippingCost = t * 0.15;
        return shippingCost;
    } else {
        shippingCost = 0;
        return shippingCost;
    }
}


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
                ${item.discountPrice != null && item.discountPrice > 0
                ? `<p>Giá: <span style="color: red; font-weight: bold;">${item.discountPrice.toLocaleString("vi-VN")} VND</span> <span style="text-decoration: line-through; color: gray;">${item.price.toLocaleString("vi-VN")} VND</span>  </p>`
                : `<p style="color: red;; font-weight: bold;">Giá: ${item.price.toLocaleString("vi-VN")} VND</p>`
            }
            </div>
        `;
        container.appendChild(div);
        const effectivePrice = (item.discountPrice != null && item.discountPrice > 0) ? item.discountPrice : item.price;
        total += effectivePrice * item.quantity;
    });

    const shippingCost = costShipping(total);
    document.getElementById("shippingAddress").value = shippingCost.toLocaleString("vi-VN") || "0";
    total += shippingCost;

    totalPrice = total;


    document.getElementById("total-price").innerText =
        "Tổng tiền: " + total.toLocaleString("vi-VN") + " VND";

    // --- Drag-to-scroll ---
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

    getUserInfoById();

});

function goBack() {
    localStorage.removeItem('selectedItems');
    window.history.back();
}

function toggleBankField() {
    const payment = document.getElementById("payment-method").value;
    const bankField = document.getElementById("bank-field");
    bankField.classList.toggle("hidden", payment !== "bank");
}

//NHẤN NÚT XÁC NHẬN ĐẶT HÀNG
document.getElementById("confirmPurchaseBtn").addEventListener("click", async function (e) {
    e.preventDefault(); // Ngăn submit form
    // Lấy dữ liệu
    const name = document.getElementById("receiverName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const addressSelect = document.getElementById("address_get");
    const paymentSelect = document.getElementById("payment-method");
    const selectedAddressText = addressSelect.options[addressSelect.selectedIndex].textContent;
    const paymentSelectText = paymentSelect.options[paymentSelect.selectedIndex].textContent;
    // Xóa lỗi cũ
    clearAllErrors();

    let hasError = false;

    // Kiểm tra tên
    if (!name) {
        showError("receiverName", "Vui lòng nhập tên người nhận.");
        hasError = true;
    }
    // Kiểm tra số điện thoại: rỗng hoặc sai định dạng
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!phone) {
        showError("phone", "Vui lòng nhập số điện thoại.");
        hasError = true;
    } else if (!phoneRegex.test(phone)) {
        showError("phone", "Số điện thoại không hợp lệ.");
        hasError = true;
    }
    // Kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== "" && !emailRegex.test(email)) {
        showError("email", "Email không đúng định dạng.");
        hasError = true;
    }
    // Kiểm tra địa chỉ
    if (
        selectedAddressText === "<< Không có địa chỉ nào được chọn >>" ||
        selectedAddressText === "➕ Thêm địa chỉ mới"
    ) {
        showError("address", "Vui lòng chọn địa chỉ giao hàng.");
        hasError = true;
    }
    // Nếu có lỗi thì không chuyển trang
    if (hasError) return;

    let pay = "";
    if (paymentSelectText === "Thanh toán khi nhận hàng") {
        pay = "COD";
    } else {
        pay = "CHUYEN_KHOAN";
    }

    //LAY DANH SACH SAN PHAM
    const selectedItems = JSON.parse(localStorage.getItem("selectedItems")) || [];


    const cartRequest = selectedItems.map(item => ({
        cartId: item.id,
        image: item.image,
        bookId: item.bookId,
        quantity: item.quantity,
        price: (item.discountPrice != null && item.discountPrice > 0) ? item.discountPrice : item.price,
        bookTitle: item.name
    }));


    // Chuẩn bị dữ liệu gửi lên backend
    const placeOrderRequestDTO = {
        orderRequest: {
            totalPrice: totalPrice,
            shippingAddress: selectedAddressText,
            paymentMethod: pay,
            email: email,
            userName: name,
            phoneNumber: phone
        },
        cartRequest: cartRequest,
    };




    try {
        const response = await fetch("http://localhost:8080/api/orders/place", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(placeOrderRequestDTO)
        });

        const data = await response.json();



        if (response.ok && data.status === 200) {
            window.location.href = "../pages/successPurchase.html";
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi đặt hàng',
                text: 'Vui lòng thử lại sau',
                confirmButtonText: 'OK'
            });

        }
    } catch (error) {
        console.error("Lỗi gọi API đặt hàng:", error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi hệ thống',
            text: 'Vui lòng thử lại sau.',
            confirmButtonText: 'OK'
        });

    }
});

// Hiển thị lỗi
function showError(fieldId, message) {
    const errorElement = document.getElementById(`error-${fieldId}`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}
// Xóa tất cả lỗi
function clearAllErrors() {
    const errorFields = ["receiverName", "phone", "email"];
    errorFields.forEach(id => {
        const el = document.getElementById(`error-${id}`);
        if (el) el.textContent = "";
    });
}


// DIALOG
let selectedAddressId = null;

//Load địa chỉ từ API
function loadAddressOptions() {
    const select = document.getElementById("address_get");
    select.innerHTML = "";

    if (savedAddresses.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "<< Không có địa chỉ nào được chọn >>";
        select.appendChild(option);
    }

    savedAddresses.forEach(addr => {
        const option = document.createElement("option");
        option.value = addr.id;
        option.textContent = addr.address;
        select.appendChild(option);
    });

    // Thêm tùy chọn "Thêm địa chỉ mới"
    const newOption = document.createElement("option");
    newOption.value = "new";
    newOption.textContent = "+ Thêm Địa Chỉ Mới";
    newOption.style.color = "red";
    select.appendChild(newOption);

    // Chọn địa chỉ mới thêm nếu có
    if (selectedAddressId) {
        select.value = selectedAddressId;
    }
}

function handleAddressChange() {
    const select = document.getElementById("address_get");
    if (select.value === "new") {
        openAddressDialog();
    }
}

function openAddressDialog() {
    document.getElementById("addressDialog").classList.remove("hidden");
    new LocalPicker({
        province: "new_province",
        district: "new_district",
        ward: "new_ward"
    });
}

function closeAddressDialog() {
    const address_get = document.getElementById("address_get");
    address_get.selectedIndex = 0;
    document.getElementById("addressDialog").classList.add("hidden");
}

//Lưu địa chỉ mới 
async function saveNewAddress() {
    const province = document.getElementById("ls_province");
    const district = document.getElementById("ls_district");
    const ward = document.getElementById("ls_ward");
    const detail = document.getElementById("address").value;

    // Lấy text hiển thị của option được chọn
    const provinceText = province.options[province.selectedIndex].text;
    const districtText = district.options[district.selectedIndex].text;
    const wardText = ward.options[ward.selectedIndex].text;

    const fullAddress = `${detail}, ${wardText}, ${districtText}, ${provinceText}`;

    try {
        const response = await fetch("http://localhost:8080/api/user/add-address", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                address: fullAddress
            })
        });

        const result = await response.json();

        if (response.ok) {
            const newAddress = result.message;
            savedAddresses.push(newAddress);
            selectedAddressId = newAddress.id;

            closeAddressDialog();
            getUserInfoById();
        } else {
            alert("Thêm địa chỉ thất bại: " + result.message);
        }
    } catch (error) {
        console.error("Lỗi khi thêm địa chỉ:", error);
        alert("Có lỗi xảy ra khi gọi API");
    }

    province.selectedIndex = 0;
    district.selectedIndex = 0;
    ward.selectedIndex = 0;
    document.getElementById("address").value = "";
}

