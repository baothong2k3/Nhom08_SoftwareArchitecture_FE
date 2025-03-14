const books = [
    { title: "The Great Gatsby", author: "Scott Fitzgerald", price: 150000, discount: "20%", img: "/assets/sachMau.png" },
    { title: "To Kill a Mockingbird", author: "Harper Lee", price: 120000, discount: "15%", img: "/assets/sachMau.png" },
    { title: "1984", author: "George Orwell", price: 130000, discount: "10%", img: "/assets/sachMau.png" },
    { title: "Pride and Prejudice", author: "Jane Austen", price: 110000, discount: "15%", img: "/assets/sachMau.png" },
    { title: "Moby-Dick", author: "Herman Melville", price: 160000, discount: "10%", img: "/assets/sachMau.png" },
    { title: "War and Peace", author: "Leo Tolstoy", price: 190000, discount: "5%", img: "/assets/sachMau.png" },
    { title: "The Catcher in the Rye", author: "J.D. Salinger", price: 112000, discount: "12%", img: "/assets/sachMau.png" },
    { title: "The Hobbit", author: "J.R.R. Tolkien", price: 170000, discount: "18%", img: "/assets/sachMau.png" },
    { title: "Harry Potter", author: "J.K. Rowling", price: 200000, discount: "25%", img: "/assets/sachMau.png" },
    { title: "The Lord of the Rings", author: "J.R.R. Tolkien", price: 250000, discount: "30%", img: "/assets/sachMau.png" }
];

const itemsPerPage = 8;
let currentPage = 1;

// Hiển thị danh sách sách theo trang
function displayBooks() {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedBooks = books.slice(start, end);

    paginatedBooks.forEach((book, index) => {
        productList.innerHTML += `
            <div class="product">
                <img src="${book.img}" alt="${book.title}">
                <h3>${book.title}</h3>
                <p>Tác giả: ${book.author}</p>
                <p>Giá: ${book.price.toLocaleString()} VND</p>
                <p class="discount">Giảm giá: ${book.discount}</p>
                <button class="add-to-cart">Thêm vào giỏ hàng</button>
                <button class="view-details" onclick="viewDetails(${index + start})">Xem chi tiết</button>
            </div>
        `;
    });

    updatePagination();
}

// Xem chi tiết sách
function viewDetails(bookIndex) {
    const book = books[bookIndex]; // Lấy thông tin sách theo chỉ mục
    window.location.href = `/pages/productDetails.html?id=${book.id}`;
}

// Cập nhật phân trang
function updatePagination() {
    const pageNumbers = document.getElementById("page-numbers");
    pageNumbers.innerHTML = "";

    const totalPages = Math.ceil(books.length / itemsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.innerHTML += `<button onclick="goToPage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
}

// Thay đổi trang
function changePage(step) {
    const totalPages = Math.ceil(books.length / itemsPerPage);
    currentPage = Math.min(Math.max(1, currentPage + step), totalPages);
    displayBooks();
}

// Chuyển đến trang cụ thể
function goToPage(page) {
    currentPage = page;
    displayBooks();
}

// Tìm kiếm sách theo tiêu đề
function searchBooks() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const filteredBooks = books.filter(book => book.title.toLowerCase().includes(query));

    if (query === "") {
        displayBooks();
        return;
    }

    const productList = document.getElementById("product-list");
    productList.innerHTML = "";

    filteredBooks.forEach(book => {
        productList.innerHTML += `
            <div class="product">
                <img src="${book.img}" alt="${book.title}">
                <h3>${book.title}</h3>
                <p>Tác giả: ${book.author}</p>
                <p>Giá: ${book.price.toLocaleString()} VND</p>
                <p class="discount">Giảm giá: ${book.discount}</p>
                <button class="add-to-cart">Thêm vào giỏ hàng</button>
            </div>
        `;
    });

    document.getElementById("pagination").style.display = filteredBooks.length ? "block" : "none";
}

// Khởi động hiển thị trang đầu tiên
displayBooks();