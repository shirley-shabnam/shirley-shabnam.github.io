/**
 * CATEGORY VIEW - STUDENTS IMPLEMENT
 * Group data by categories - good for understanding relationships and patterns
 */
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function showCategories(data) {
  // Requirements:
  // - Group data by a meaningful category (cuisine, neighborhood, price, etc.)
  // - Show items within each group
  // - Make relationships between groups clear
  // - Consider showing group statistics

  /* JavaScript Goes Here */ 
  const fields = {
    handwashing: "proper_hand_washing",
    illworkers: "ill_workers_restricted",
    foodsource: "food_from_approved_source"
  };

  const cities = Array.from(
    new Set(data.map(d => (d.properties.city || "UNKNOWN").toUpperCase().trim()))
  ).sort();

  let currentField = fields.handwashing;
  let currentCity = "ALL";

  setTimeout(init, 0);

  function init() {

    const dropdown = d3.select("#city-filter");

    dropdown.selectAll("option.city")
      .data(cities)
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => d);

    dropdown.on("change", (event) => {
      currentCity = event.target.value;
      render();
    });

    d3.select(".stats-controls").on("click", (event) => {
    const id = event.target.id;

    if (id === "btn-handwashing") currentField = fields.handwashing;
    if (id === "btn-illworkers") currentField = fields.illworkers;
    if (id === "btn-foodsource") currentField = fields.foodsource;

    render();
});

    render();
  }

  function render() {

    const container = d3.select("#stats-vis");
    container.html("");

    let filtered = data;

    if (currentCity !== "ALL") {
      filtered = filtered.filter(d =>
        (d.properties.city || "UNKNOWN").toUpperCase().trim() === currentCity
      );
    }

    const groups = d3.rollups(
      filtered,
      v => v.length,
      d => d.properties[currentField] || "Unknown"
    );

    const stats = groups
      .map(([key, value]) => ({
        category: key,
        count: value
      }))
      .sort((a, b) => b.count - a.count);

    container.selectAll("div")
      .data(stats)
      .enter()
      .append("div")
      .attr("class", "restaurant-card")
      .html(d => `
        <div class="stat-number">${d.count}</div>
        <div class="stat-label">${d.category}</div>
      `);
  }

  return `
    <div class="stats-controls">
      <select id="city-filter">
        <option value="ALL">All Cities</option>
      </select>

      <button id="btn-handwashing" class="view-button">Hand Washing</button>
      <button id="btn-illworkers" class="view-button">Ill Workers</button>
      <button id="btn-foodsource" class="view-button">Food Source</button>

    </div>

    <div id="stats-vis"></div>
  `;
}

  /* html */
  // return `
  //               <h2 class="view-title">📂 Category View</h2>
  //               <div class="todo-implementation">
  //                   <h3>TODO: Implement Category View</h3>
  //                   <p><strong>Your task:</strong> Group the data by categories to show relationships</p>
  //                   <p><strong>Good for:</strong> Understanding patterns, finding similar items, exploring by type</p>
  //                   <p><strong>Consider:</strong> Group by cuisine? Neighborhood? Price range? What tells the best story?</p>
  //                   <p><strong>Available categories:</strong> ${[
  //                     ...new Set(data.map((item) => item.cuisine)),
  //                   ].join(", ")}</p>
  //               </div>
  //           `;


    
// }


export default showCategories;