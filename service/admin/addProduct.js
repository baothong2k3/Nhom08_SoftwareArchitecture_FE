const imageInput = document.getElementById("imageProduct");
const previewImage = document.getElementById("preview-image");

imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result;
            previewImage.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        previewImage.style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const btnSubmit = form.querySelector(".btn-green");
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = 0.5;

    const fields = {
        productName: {
            element: document.getElementById("productName"),
            error: document.getElementById("error-productName"),
            validate: (val) => {
                if (!val.trim()) return "Tiêu đề sách không được để trống";
                if (val.length > 255) return "Tiêu đề sách không được vượt quá 255 ký tự";
                return "";
            }
        },
        author: {
            element: document.getElementById("author"),
            error: document.getElementById("error-author"),
            validate: (val) => {
                if (!val.trim()) return "Tác giả không được để trống";
                if (val.length > 255) return "Tác giả không được vượt quá 255 ký tự";
                return "";
            }
        },
        price: {
            element: document.getElementById("price"),
            error: document.getElementById("error-price"),
            validate: (val) => {
                if (val === "") return "Giá sách là bắt buộc";
                if (parseFloat(val) <= 15000) return "Giá phải lớn hơn 15.000 VND";
                return "";
            }
        },
        discount: {
            element: document.getElementById("discount"),
            error: document.getElementById("error-discount"),
            validate: (val) => {
                if (val === "") return "";
                if (val < 0 || val > 100) return "Phần trăm giảm giá phải từ 0 đến 100";
                return "";
            }
        },
        quantity: {
            element: document.getElementById("quantity"),
            error: document.getElementById("error-quantity"),
            validate: (val) => {
                if (val === "") return "Số lượng tồn kho là bắt buộc";
                if (parseInt(val) < 0) return "Số lượng tồn kho phải lớn hơn hoặc bằng 0";
                return "";
            }
        },
        category: {
            element: document.getElementById("category"),
            error: document.getElementById("error-category"),
            validate: (val) => {
                if (!val) return "Danh mục không được để trống";
                return "";
            }
        },
        description: {
            element: document.getElementById("description"),
            error: document.getElementById("error-description"),
            validate: (val) => {
                if (val.length > 2000) return "Mô tả không được vượt quá 2000 ký tự";
                return "";
            }
        },
        imageProduct: {
            element: document.getElementById("imageProduct"),
            error: document.getElementById("error-imageProduct"),
            validate: (val) => {
                if (!val) return "Ảnh sản phẩm là bắt buộc";
                return "";
            }
        }
    };

    Object.values(fields).forEach(({ element, validate, error }) => {
        element.addEventListener("input", validateForm);
        element.addEventListener("change", validateForm);
    });

    function validateForm() {
        let isValid = true;
        Object.entries(fields).forEach(([key, { element, validate, error }]) => {
            const val = element.type === "file" ? element.files[0] : element.value;
            const message = validate(val);
            error.textContent = message;
            if (message) isValid = false;
        });

        btnSubmit.disabled = !isValid;
        btnSubmit.style.opacity = isValid ? 1 : 0.5;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire({
                icon: "warning",
                title: "Bạn chưa đăng nhập",
                text: "Vui lòng đăng nhập để thêm sản phẩm"
            });
            return;
        }

        const formData = new FormData();
        formData.append("title", fields.productName.element.value);
        formData.append("author", fields.author.element.value);
        formData.append("discountPercent", fields.discount.element.value);
        formData.append("price", fields.price.element.value);
        formData.append("stockQuantity", fields.quantity.element.value);
        formData.append("category", fields.category.element.value);
        formData.append("description", fields.description.element.value);
        formData.append("status", true);
        formData.append("imageFile", fields.imageProduct.element.files[0]);

        fetch("http://localhost:8080/api/books/save", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw data;
                window.location.href = "productAdmin.html";

            })
            .catch((error) => {
                let messages = error.errors ? error.errors.join("<br>") : error.message;
                Swal.fire({
                    icon: "error",
                    title: "Thêm sản phẩm thất bại",
                    html: messages
                });
            });
    });

});
