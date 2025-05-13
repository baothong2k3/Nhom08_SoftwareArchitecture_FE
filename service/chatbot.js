document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra nếu người dùng đã đăng nhập chưa
    const isLoggedIn = () => {
      return localStorage.getItem('userToken') !== null; // Kiểm tra nếu có token trong localStorage
    };
  
    const sendMessage = () => {
      const input = document.querySelector('.chat-input input');
      const message = input.value.trim();
  
      // Kiểm tra nếu người dùng chưa đăng nhập
      if (!isLoggedIn()) {
        Swal.fire({
          icon: 'warning',
          title: 'Chưa đăng nhập',
          html: 'Vui lòng đăng nhập để gửi tin nhắn. <br/><small><a href="../pages/login.html">Nhấn vào đây để đăng nhập.</a></small>',
          confirmButtonText: 'Đăng nhập',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '../pages/login.html'; // Chuyển hướng đến trang đăng nhập
          }
        });
      } else {
        // Nếu đã đăng nhập, gửi tin nhắn (ví dụ, thêm vào chat box)
        const chatMessages = document.querySelector('.chat-messages');
        chatMessages.innerHTML += `<div class="user-message">${message}</div>`;
        input.value = ''; // Xóa nội dung input sau khi gửi
      }
    };
  
    // Gắn sự kiện khi nhấn nút "Gửi"
    document.querySelector('.chat-input button').addEventListener('click', sendMessage);
  });
  