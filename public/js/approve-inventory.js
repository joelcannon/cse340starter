function removeRow(classification_id) {
  const row = document.getElementById(`row-${classification_id}`);
  if (row) {
    row.remove();
  }
}

function rejectClassification(classification_id) {
  // Code to reject the classification goes here.
  fetch(`/inv/reject-classification/${classification_id}`, {
    method: "POST",
  })
    .then((response) => {
      // If the request was successful, remove the row from the table
      removeRow(classification_id);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function approveClassification(classification_id) {
  // Code to approve the classification goes here.
  fetch(`/inv/approve-classification/${classification_id}`, {
    method: "POST",
  })
    .then((response) => {
      // If the request was successful, remove the row from the table
      removeRow(classification_id);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
