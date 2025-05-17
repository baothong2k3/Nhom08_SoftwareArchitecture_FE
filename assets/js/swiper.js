document.addEventListener("DOMContentLoaded", function () {
    var swiper = new Swiper(".swiper-container", {
        loop: true,
        slidesPerView: 1,
        centeredSlides: false,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    });
});