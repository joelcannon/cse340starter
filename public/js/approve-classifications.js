document.addEventListener("DOMContentLoaded", () => {
  const newClassificationList = document.querySelector(
    "#new-classification_id"
  );
  if (newClassificationList) {
    newClassificationList.addEventListener("change", async function () {
      try {
        showPopup(newClassificationList.value);
      } catch (error) {
        console.log("There was a problem: ", error.message);
      }
    });
  }
});

// Show popup with Approve, Reject, and Cancel buttons
function showPopup(newClassificationId) {
  const popup = document.createElement("div");

  const approveButton = document.createElement("button");
  approveButton.textContent = "Approve";
  approveButton.addEventListener("click", () =>
    approveClassification(newClassificationId)
  );

  const rejectButton = document.createElement("button");
  rejectButton.textContent = "Reject";
  rejectButton.addEventListener("click", () =>
    rejectClassification(newClassificationId)
  );

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", closePopup);

  popup.appendChild(approveButton);
  popup.appendChild(rejectButton);
  popup.appendChild(cancelButton);

  document.body.appendChild(popup);
}

// Approve classification
function approveClassification(classificationId) {
  // Call your API to approve the classification
  console.log(`Approving classification ${classificationId}`);
  closePopup();
}

// Reject classification
function rejectClassification(classificationId) {
  // Call your API to delete the classification
  console.log(`Rejecting classification ${classificationId}`);
  closePopup();
}

// Close popup
function closePopup() {
  const popup = document.querySelector("div");
  document.body.removeChild(popup);
}
