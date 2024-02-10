"use strict";

// Get a list of items in inventory based on the classification_id
const classificationList = document.querySelector("#classification_id");
classificationList.addEventListener("change", async function () {
  try {
    const response = await fetch(
      `/inv/get-inventory/${classificationList.value}`
    );
    if (!response.ok) {
      throw Error("Network response was not OK");
    }
    const data = await response.json();
    if (data.error) {
      throw Error(data.error);
    }
    console.log(data);
    buildInventoryList(data);
  } catch (error) {
    console.log("There was a problem: ", error.message);
  }
});

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {
  // Set up the table labels
  let dataTable = `
     <thead>
       <tr>
         <th>Vehicle Name</th>
         <td>&nbsp;</td>
         <td>&nbsp;</td>
       </tr>
     </thead>
     <tbody>
   `;

  // Check if data array is empty
  if (data.length === 0) {
    dataTable += `
      <tr>
        <td colspan="3">No data available</td>
      </tr>
    `;
  } else {
    // Iterate over all vehicles in the array and put each in a row
    data.forEach(({ inv_id, inv_model, inv_make }) => {
      console.log(`${inv_id}, ${inv_model}`);
      dataTable += `
        <tr>
          <td>${inv_make} ${inv_model}</td>
          <td><a href='/inv/edit/${inv_id}' title='Click to update'>Modify</a></td>
          <td><a href='/inv/delete/${inv_id}' title='Click to delete'>Delete</a></td>
        </tr>
      `;
    });
  }

  dataTable += "</tbody>";

  // Display the contents in the Inventory Management view
  document.getElementById("inventoryDisplay").innerHTML = dataTable;
}
