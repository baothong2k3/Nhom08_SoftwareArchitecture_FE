const token = localStorage.getItem("token");
let initialFullName = "";
let initialEmail = "";

// Lấy thông tin user
async function getUserInfoById() {
    try {
        const response = await fetch("http://localhost:8080/api/user/get", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        const result = await response.json();
        if (response.ok) {
            const user = result.message;
            document.getElementById("receiverName").value = user.fullName || "";
            document.getElementById("phone").value = user.phoneNumber || "";
            document.getElementById("email").value = user.email || "";

            initialFullName = user.fullName || "";
            initialEmail = user.email || "";

            validateForm(); // kiểm tra sau khi load dữ liệu
        } else {
            console.error("Lỗi khi lấy user:", result.message || result);
        }
    } catch (error) {
        console.error("Lỗi kết nối đến server:", error);
    }
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Kiểm tra form hợp lệ để bật/tắt nút Lưu
function validateForm() {
    const fullName = document.getElementById("receiverName").value.trim();
    const email = document.getElementById("email").value.trim();
    const saveBtn = document.getElementById("saveBtn");

    const oldPassword = document.querySelector('input[placeholder="Nhập mật khẩu cũ"]').value;
    const newPassword = document.querySelector('input[placeholder="Nhập mật khẩu"]').value;
    const confirmPassword = document.querySelector('input[placeholder="Nhập lại mật khẩu"]').value;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    let valid = true;


    if (
        oldPassword?.trim() &&
        newPassword?.trim() &&
        oldPassword === newPassword
    ) {

        valid = false;
    }

    if (fullName !== initialFullName && (fullName.length < 5 || fullName.length > 50)) {

        valid = false;
    }

    if (email !== initialEmail && !isValidEmail(email)) {

        valid = false;
    }

    if (oldPassword || newPassword || confirmPassword) {
        if (!oldPassword || !newPassword || !confirmPassword) {

            valid = false;
        } else if (newPassword !== confirmPassword || !passwordRegex.test(newPassword)) {

            valid = false;
        }
    }

    // Vô hiệu hóa nút nếu không hợp lệ
    saveBtn.disabled = !valid;
    saveBtn.style.opacity = valid ? 1 : 0.5;
}

// Cập nhật thông tin
async function updateUser(event) {
    event.preventDefault();

    const fullName = document.getElementById("receiverName").value.trim();
    const email = document.getElementById("email").value.trim();
    const errEmail = document.getElementById("err_email");
    const errName = document.getElementById("err_name");

    const oldPassword = document.querySelector('input[placeholder="Nhập mật khẩu cũ"]').value;
    const newPassword = document.querySelector('input[placeholder="Nhập mật khẩu"]').value;
    const confirmPassword = document.querySelector('input[placeholder="Nhập lại mật khẩu"]').value;

    // Reset lỗi
    errEmail.textContent = "";
    errName.textContent = "";

    let hasError = false;

    if (fullName !== initialFullName && (fullName.length < 5 || fullName.length > 50)) {
        errName.textContent = "Tên phải từ 5 đến 50 ký tự";
        errName.style.color = "red";
        hasError = true;
    }

    if (email !== initialEmail && !isValidEmail(email)) {
        errEmail.textContent = "Email không đúng định dạng!";
        errEmail.style.color = "red";
        hasError = true;
    }

    const errPass = document.getElementById("err_pass");
    errPass.textContent = "";
    const errPass_r = document.getElementById("err_pass_r");
    errPass_r.textContent = "";

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if ((oldPassword || newPassword || confirmPassword)) {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: "Nếu bạn muốn đổi mật khẩu. Vui lòng nhập đầy đủ 3 trường mật khẩu!",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            errPass_r.textContent = "Mật khẩu nhập lại không khớp!";
            errPass_r.style.color = "red";
            return;
        }
        if (!passwordRegex.test(newPassword)) {
            errPass.textContent = "Mật khẩu phải có ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt (tối thiểu 8 ký tự)";
            errPass.style.color = "red";
            return;
        }
    }

    if (hasError) return;

    if (fullName !== "") {
        localStorage.setItem("userName", fullName);
    }

    // Cập nhật thông tin cá nhân
    const updateUserRequest = {
        fullName: fullName,
        email: email,
        dob: null,
    };

    try {
        const response = await fetch("http://localhost:8080/api/user/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updateUserRequest),
        });

        const result = await response.json();

        if (!response.ok) {
            alert("Cập nhật thất bại: " + result.message);
            return;
        }
    } catch (error) {
        console.error("Lỗi cập nhật thông tin:", error);
        alert("Có lỗi xảy ra khi cập nhật thông tin.");
        return;
    }

    // Nếu có thay đổi mật khẩu
    if (oldPassword && newPassword && confirmPassword) {
        const request = {
            oldPassword: oldPassword,
            newPassword: newPassword,
            confirmPassword: confirmPassword,
        };
        try {
            const response = await fetch("http://localhost:8080/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(request),
            });

            const result = await response.json();

            if (!response.ok) {
                Swal.fire({
                    icon: "error",
                    title: "Đổi mật khẩu thất bại. Mật khẩu cũ không đúng|",
                    text: result.message || "Vui lòng thử lại",
                });
                return;
            }

            if (result.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Đổi mật khẩu thành công",
                    text: result.message,
                });
            }
        } catch (error) {
            console.error("Lỗi đổi mật khẩu:", error);
            alert("Có lỗi xảy ra khi đổi mật khẩu.");
            return;
        }
    }

    Swal.fire({
        icon: 'success',
        title: 'Cập nhật thành công',
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        window.location.href = "accountAdmin.html";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    getUserInfoById();

    const form = document.querySelector("form");
    form.addEventListener("submit", updateUser);

    const fullNameInput = document.getElementById("receiverName");
    const emailInput = document.getElementById("email");
    const errName = document.getElementById("err_name");
    const errEmail = document.getElementById("err_email");


    fullNameInput.addEventListener("input", () => {
        const value = fullNameInput.value.trim();
        if (value !== initialFullName && (value.length < 5 || value.length > 50)) {
            errName.textContent = "Tên phải từ 5 đến 50 ký tự";
            errName.style.color = "red";
        } else {
            errName.textContent = "";
        }
        validateForm();
    });

    emailInput.addEventListener("input", () => {
        const value = emailInput.value.trim();
        if (value !== initialEmail && !isValidEmail(value)) {
            errEmail.textContent = "Email không đúng định dạng!";
            errEmail.style.color = "red";
        } else {
            errEmail.textContent = "";
        }
        validateForm();
    });

    ["Nhập mật khẩu cũ", "Nhập mật khẩu", "Nhập lại mật khẩu"].forEach(ph => {
        const input = document.querySelector(`input[placeholder="${ph}"]`);
        if (input) {
            input.addEventListener("input", validateForm);
        }
    });

    const oldPasswordInput = document.querySelector('input[placeholder="Nhập mật khẩu cũ"]');
    const newPasswordInput = document.querySelector('input[placeholder="Nhập mật khẩu"]');
    const confirmPasswordInput = document.querySelector('input[placeholder="Nhập lại mật khẩu"]');
    const errPassword = document.getElementById("err_pass");
    const errConfirmPassword = document.getElementById("err_pass_r");

    newPasswordInput.addEventListener("input", () => {
        const value = newPasswordInput.value.trim();
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$/;

        if (!passwordRegex.test(value)) {
            errPassword.textContent = "Mật khẩu phải có chữ thường, chữ hoa, số, ký tự đặc biệt và dài 8-32 ký tự.";
            errPassword.style.color = "red";
        } else if (oldPasswordInput.value.trim() === newPasswordInput.value.trim()) {
            errPassword.textContent = "Mật khẩu mới không được trùng với mật khẩu cũ!";
            errPassword.style.color = "red";
        } else {
            errPassword.textContent = "";
        }
        validateForm();
    });

    confirmPasswordInput.addEventListener("input", () => {
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (confirmPassword !== newPassword) {
            errConfirmPassword.textContent = "Mật khẩu không khớp!";
            errConfirmPassword.style.color = "red";
        } else {
            errConfirmPassword.textContent = "";
        }
        validateForm();
    });

    validateForm(); // gọi lần đầu
});

function goBack() {
    window.history.back();
}
