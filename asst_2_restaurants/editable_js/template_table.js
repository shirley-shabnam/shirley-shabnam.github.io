import SortableTable from "./sortable_table.js"
import loadData from "./load_data.js";
/**
 * TABLE VIEW
 * Display data in sortable rows - good for scanning specific information
 */
function showTable(data) {
//   // Requirements:
//   // - Show data in a table format
//   // - Include all important fields
//   // - Make it easy to scan and compare
//   // - Consider adding sorting functionality
//   //   https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/


//     /*
//         javascript goes here! you can return it below
//     */ 
//   /*html*/ 
//   return `
//                 <h2 class="view-title">Table View</h2>
//                 <div class="todo-implementation">
//                     <h3>TODO: Implement Table View</h3>
//                     <p><strong>Data available:</strong> ${data.length} items loaded</p>
//                     <p><strong>Your task:</strong> Display the data as a sortable table</p>
//                     <p><strong>Consider:</strong> Which columns are most important? How can you make scanning easy?</p>
//                     <p><strong>Good for:</strong> Scanning specific data points, comparing values, finding specific information</p>
//                 </div>
//             `;
  let tableRows = "";

  data.forEach(feature => {
      const restoProperties = feature.properties;

      const inspectDate = new Date(restoProperties.inspection_date)
      const inspectYear = inspectDate.getUTCFullYear();

    tableRows += `
      <tr>
        <td>${restoProperties.name ?? "No Name Found"}</td>
        <td>${restoProperties.city ?? "Unknown City"}</td>
        <td>${inspectYear}</td>
        <td>${restoProperties.inspection_results ?? "No Inspection Results"}</td>
      </tr>
    `;

  });

//   setTimeout(() => {
//     var sortableTables = document.querySelectorAll('table.sortable')
//     for (var i = 0; i < sortableTables.length; i++) {
//         new SortableTable(sortableTables[i]);
//     }

// }, 0);


  return `
    <h2>For your convenience, a table of all Prince George's County resturants</h2>
    <div class="table-contain">
      <table class="restaurant-table sortable">
        <thead>
          <tr>
            <th aria-sort="none"><button>Name </button></th>
            <th aria-sort="none"><button>City </button></th>
            <th aria-sort="none" class="num"><button>Inspection Year </button></th>
            <th aria-sort="none"><button>Inspection Results </button></th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      </div>
  `;
}



export default showTable;