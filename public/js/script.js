const togglePassword = document.querySelector("#togglePassword");
const password = document.querySelector("#password");

togglePassword.addEventListener("click", function () {
  // check the current type attribute
  const type =
    password.getAttribute("type") === "password" ? "text" : "password";

  // toggle the icon
  if (type === "text") {
    this.classList.remove("fa-eye");
    this.classList.add("fa-eye-slash");
  } else {
    this.classList.remove("fa-eye-slash");
    this.classList.add("fa-eye");
  }

  // toggle the type attribute
  password.setAttribute("type", type);
});
