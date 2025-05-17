function getParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
}

function goBack() {
    window.history.back();
}

window.onload = () => {
    const data = getParams();
    const inputs = document.querySelectorAll("form input, form textarea, form select");



    inputs.forEach((input) => {
        switch (input.placeholder) {
            case "Mã sản phẩm":
                input.value = data.id || "";
                break;
            case "Nhập tên sản phẩm":
                input.value = data.title || "";
                break;
            case "Nhập giá sản phẩm":
                input.value = data.price || "";
                break;
            case "Nhập phần trăm giảm giá":
                input.value = data.discount || "";
                break;
            case "Nhập giá sau giảm":
                input.value = data.priceAfterDiscount || "";
                break;
            case "Nhập số lượng tồn":
                input.value = data.stockQuantity || "";
                break;
            case "Nhập tên tác giả":
                input.value = data.author || "";
                break;
            case "Nhập mô tả sản phẩm":
                input.value = data.description || "";
                break;
            default:
                break;
        }
    });

    const categorySelect = document.getElementById("category-select");
    if (categorySelect && data.category) {
        categorySelect.value = data.category;
    }

    const preview = document.getElementById("product-preview");
    if (data.imageUrl) {
        preview.src = data.imageUrl;
    }

    const statusValue = data.status === "true" ? "Đang bán" : "Ngừng bán";
    const radios = document.querySelectorAll('input[name="status"]');
    radios.forEach((radio) => {
        if (radio.value === statusValue) {
            radio.checked = true;
        }
    });

    // Tự động tính giá sau giảm
    const priceInput = document.querySelector('input[placeholder="Nhập giá sản phẩm"]');
    const discountInput = document.querySelector('input[placeholder="Nhập phần trăm giảm giá"]');
    const priceAfterInput = document.querySelector('input[placeholder="Nhập giá sau giảm"]');

    function calculateDiscountedPrice() {
        const price = parseFloat(priceInput.value);
        const discount = parseFloat(discountInput.value);
        if (!isNaN(price) && !isNaN(discount)) {
            const discountAmount = (price * discount) / 100;
            priceAfterInput.value = Math.round(price - discountAmount);
        } else {
            priceAfterInput.value = "";
        }
    }

    priceInput.addEventListener("input", calculateDiscountedPrice);
    discountInput.addEventListener("input", calculateDiscountedPrice);

    // Validate inputs liên tục
    const form = document.querySelector("form");
    const submitBtn = form.querySelector('button[type="submit"]');

    function validateForm() {
        let isValid = true;

        // Reset trạng thái
        form.querySelectorAll("input, textarea").forEach((el) => {
            el.style.border = "";
        });
        form.querySelectorAll(".error").forEach((err) => {
            err.textContent = "";
        });

        const title = form.querySelector('input[placeholder="Nhập tên sản phẩm"]');
        const author = form.querySelector('input[placeholder="Nhập tên tác giả"]');
        const price = form.querySelector('input[placeholder="Nhập giá sản phẩm"]');
        const discount = form.querySelector('input[placeholder="Nhập phần trăm giảm giá"]');
        const quantity = form.querySelector('input[placeholder="Nhập số lượng tồn"]');

        if (!title.value.trim()) {
            showError(title, "Tiêu đề sách không được để trống", "error-name");
        } else if (title.value.length > 255) {
            showError(title, "Tiêu đề sách không được vượt quá 255 ký tự", "error-name");
        }

        if (!author.value.trim()) {
            showError(author, "Tên tác giả không được để trống", "error-author");
        } else if (author.value.length > 255) {
            showError(author, "Tên tác giả không được vượt quá 255 ký tự", "error-author");
        }

        const priceValue = parseFloat(price.value);
        if (isNaN(priceValue)) {
            showError(price, "Giá sách là bắt buộc", "error-price");
        } else if (priceValue < 15000) {
            showError(price, "Giá phải lớn hơn 15.000 VND", "error-price");
        }

        const quantityValue = parseInt(quantity.value);
        if (isNaN(quantityValue) || quantityValue < 0) {
            showError(quantity, "Số lượng tồn kho phải lớn hơn hoặc bằng 0", "error-quantity");
        }

        const discountValue = parseFloat(discount.value);
        if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
            showError(discount, "Phần trăm giảm giá phải từ 0 đến 100", "error-discountPer");
        }

        // Kiểm tra nếu có lỗi nào hiển thị thì không cho submit
        form.querySelectorAll(".error").forEach((err) => {
            if (err.textContent !== "") {
                isValid = false;
            }
        });

        // Cập nhật trạng thái nút
        submitBtn.disabled = !isValid;
        submitBtn.style.opacity = isValid ? "1" : "0.6";
    }

    function showError(inputEl, message, errorId) {
        isValid = false;
        inputEl.style.border = "1px solid red";
        const err = document.getElementById(errorId);
        if (err) err.textContent = message;
    }

    // Gán sự kiện validate cho từng ô
    form.querySelectorAll("input, textarea").forEach((el) => {
        el.addEventListener("input", validateForm);
    });

    // Validate lần đầu
    validateForm();
};

// Preview ảnh
document.getElementById("product-image").addEventListener("change", function (e) {
    const file = e.target.files[0];
    const preview = document.getElementById("product-preview");

    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            preview.src = event.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
    }
});

//NHẤN NÚT CẬP NHẬT
document.getElementById("updateForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const token = localStorage.getItem("token");

    const id = form.querySelector("#id").value;
    const productName = form.querySelector("#productName").value.trim();
    const price = form.querySelector("#price").value;
    const discountPercent = form.querySelector("#discountPercent").value;
    const quantity = form.querySelector("#quantity").value;
    const category = form.querySelector("#category-select").value;
    const author = form.querySelector("#author").value.trim();
    const description = form.querySelector("#description").value.trim();
    const imageFile = form.querySelector("#product-image").files[0];
    const status = form.querySelector('input[name="status"]:checked').value;

    let statusBool = true;

    if (status === "Đang bán") {
        statusBool = true;
    } else {
        statusBool = false;
    }

    const formData = new FormData();
    formData.append("title", productName);
    formData.append("author", author);
    formData.append("discountPercent", discountPercent);
    formData.append("price", price);
    formData.append("stockQuantity", quantity);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("status", statusBool);
    if (imageFile !== undefined) {
        formData.append("imageFile", imageFile);
    }
    // Gửi PATCH request
    try {
        const response = await fetch(`http://localhost:8080/api/books/${id}/update`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData,
        });

        const result = await response.json();


        if (response.ok) {
            Swal.fire({
                icon: "success",
                title: "Thành công",
                text: result.message || "Cập nhật thành công!",
                timer: 1000, // 2 giây
                showConfirmButton: false
            });

            const updated = result.data;
            if (updated) {
                console.log("Updated product:", updated.discountPercent);
                // Gắn lại dữ liệu mới vào form
                form.querySelector('input[placeholder="Nhập tên sản phẩm"]').value = updated.title || "";
                form.querySelector('input[placeholder="Nhập giá sản phẩm"]').value = updated.price || "";
                form.querySelector('input[placeholder="Nhập phần trăm giảm giá"]').value = updated.discountPercent || 0;
                form.querySelector('input[placeholder="Nhập giá sau giảm"]').value = updated.discountedPrice || "";
                form.querySelector('input[placeholder="Nhập số lượng tồn"]').value = updated.stockQuantity || "";
                form.querySelector('input[placeholder="Nhập tên tác giả"]').value = updated.author || "";
                form.querySelector('textarea[placeholder="Nhập mô tả sản phẩm"]').value = updated.description || "";

                // Ảnh preview (nếu có thay đổi)
                const preview = document.getElementById("product-preview");
                if (updated.imageUrl) {
                    preview.src = updated.imageUrl;
                }

                // Trạng thái
                const radios = document.querySelectorAll('input[name="status"]');
                radios.forEach((radio) => {
                    radio.checked = (radio.value === (updated.status ? "Đang bán" : "Ngừng bán"));
                });

                // Danh mục
                const categorySelect = document.getElementById("category-select");
                if (categorySelect) categorySelect.value = updated.category;
            }
        } else {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: result.message || "Cập nhật thất bại",
            });
        }
    } catch (error) {
        console.error("Update error", error);
        Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: "Không thể kết nối máy chủ",
        });
    }
});
