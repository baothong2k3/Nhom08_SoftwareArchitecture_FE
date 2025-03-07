document.addEventListener("keydown", function (event) {
  if (
    event.ctrlKey &&
    (event.key === "=" || event.key === "-" || event.key === "0")
  ) {
    event.preventDefault();
  }
});

document.addEventListener(
  "wheel",
  function (event) {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  },
  { passive: false }
);

fetch("../components/footer.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("footer").innerHTML = data;
  })
  .catch((error) => console.error("Error loading footer:", error));

fetch("../components/menuAdmin.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("menu").innerHTML = data;
  })
  .catch((error) => console.error("Error loading footer:", error));
