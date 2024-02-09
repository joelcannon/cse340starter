"use strict";

// Get a list of items in inventory based on the classification_id
const classificationList = document.querySelector("#classification_id");
classificationList.addEventListener("change", function () {
  fetch("/inv/get-inventory/" + classificationList.value)
    .then(function (response) {
      if (!response.ok) {
        throw Error("Network response was not OK");
      }
      return response.json();
    })
    .then(function (data) {
      if (data.error) {
        throw Error(data.error);
      }
      console.log(data);
      buildInventoryList(data);
    })
    .catch(function (error) {
      console.log("There was a problem: ", error.message);
    });
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

  // Iterate over all vehicles in the array and put each in a row
  data.forEach(function (element) {
    console.log(`${element.inv_id}, ${element.inv_model}`);
    dataTable += `
       <tr>
         <td>${element.inv_make} ${element.inv_model}</td>
         <td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>
         <td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td>
       </tr>
     `;
  });

  dataTable += "</tbody>";

  // Display the contents in the Inventory Management view
  document.getElementById("inventoryDisplay").innerHTML = dataTable;
}
