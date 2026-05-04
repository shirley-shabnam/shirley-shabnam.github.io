
import showCategories from './editable_js/template_category.js';
import showStats from './editable_js/template_stats.js';
import showTable from './editable_js/template_table.js';
import showVisualization from './editable_js/template_external.js';

import loadData from './editable_js/load_data.js';
import SortableTable from './editable_js/sortable_table.js';

// ============================================
// DISPLAY MANAGEMENT - PROVIDED
// ============================================

/**
 * Update the display with new content
 */
function updateDisplay(content) {
  document.getElementById("data-display").innerHTML = content;
}

/**
 * Update button states
 */
function updateButtonStates(activeView) {
  document.querySelectorAll(".view-button").forEach((button) => {
    button.classList.remove("active");
  });
  document.getElementById(`btn-${activeView}`).classList.add("active");
}

/**
 * Show loading state
 */
function showLoading() {
  updateDisplay('<div class="loading">Loading data from API...</div>');
}

/**
 * Show error state
 */
 /*html*/ 
function showError(message) {
  updateDisplay(`
                <div class="error">
                    <h3>Error Loading Data</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()">Try Again</button>
                </div>
            `);
}

// ============================================
// APPLICATION INITIALIZATION - PROVIDED
// ============================================

/**
 * Main application function - handles data loading and button setup
 * This pattern always works - no timing issues!
 */
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Starting application...");

  try {
    // Load data once
    showLoading();
    const data = await loadData();
    console.log(`Loaded ${data.length} items from API`);

    // Set up button event handlers - this pattern always works!
    document.getElementById("btn-external").onclick = () => {
      updateDisplay(showVisualization(data));
      updateButtonStates("external");

    };

    document.getElementById("btn-table").onclick = () => {
      updateDisplay(showTable(data));
      updateButtonStates("table");

      const tableElement = document.querySelector(".restaurant-table");
      if (tableElement) {
        new SortableTable(tableElement);
      }
    };

    document.getElementById("btn-categories").onclick = () => {
      updateDisplay(showCategories(data));
      updateButtonStates("categories");
    };

    document.getElementById("btn-stats").onclick = () => {
      // const topThree = getTopNonCompliantCities(data);
      // renderCityStats(topThree);

      updateDisplay(showStats(data));
      // renderStatsViews(cityData, top10Cities);
      updateButtonStates("stats");
    
    };

    // Show initial view
    updateDisplay(showVisualization(data));
    updateButtonStates("external");

    console.log("Application ready!");
  } catch (error) {
    console.error("Application failed to start:", error);
    showError(error.message);
  }
});