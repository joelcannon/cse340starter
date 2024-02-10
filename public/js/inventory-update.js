// Get the form and the submit button
const form = document.getElementById("inventoryForm");
const submitButton = document.getElementById("submit");

// Listen for input events on the form
form.addEventListener("input", () => {
  // Enable the submit button when a change is detected
  submitButton.disabled = false;
});
