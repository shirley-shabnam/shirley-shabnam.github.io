/**
 * STATS VIEW
 * Show aggregate statistics and insights - good for understanding the big picture
 */
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// function getTopNonCompliantCities(data) {
//     const cityStats = {};
//     data.forEach(({ properties }) => {
//         const city = properties.city?.toUpperCase().trim() || "UNKNOWN";

//         const result = properties.inspection_results?.trim() || "";

//         const compliantValues = [
//             "Facility Reopened",
//             "Compliance Schedule - Completed",
//             "------",
//             "Compliant - No Health Risk"
//         ];

//         // const isNonCompliant = complianceFields.some(field => 
//         //     properties[field] === "Out of Compliance"
//         // );

//         const isNonCompliant = !compliantValues.includes(result);

//         if (!cityStats[city]) {
//             cityStats[city] = { total: 0, nonCompliant: 0 };
//         }

//         cityStats[city].total += 1;
//         if (isNonCompliant) {
//             cityStats[city].nonCompliant += 1;
//         }
//     });

//     return Object.entries(cityStats)
//         .map(([city, stats]) => ({
//             city,
//             totalRestos: stats.total,
//             nonCompliantCount: stats.nonCompliant,
//             percentage: ((stats.nonCompliant / stats.total) * 100).toFixed(2)
//         }))
//         // filter noise stuff
//         .filter(res => res.totalRestos > 1)
//         .sort((a, b) => b.percentage - a.percentage)
//         .slice(0, 3);
// }

function showStats(data) {
    // Requirements:
    // Replace the below "task" description with the following:
    // - One meaningful statistic calculation from the supplied dataset
    // ===- percent of restaurants not passing hand-washing, for example
    // - Present insights visually
    // - Show distributions, averages, counts, etc.
    // - Help users understand patterns in the data
    
    /* Javascript calculations here */  

    const compliantValues = [
        'Facility Reopened',
        'Compliance Schedule - Completed',
        '------',
        'Compliant - No Health Risk'
    ];

    const cityGroups = data.reduce((acc, item) => {
        const props = item.properties;
        const city = props.city ? props.city.toUpperCase().trim() : "UNKNOWN";
        
        if (!acc[city]) {
            acc[city] = { total: 0, nonCompliantCount: 0 };
        }

        const isCompliant = compliantValues.includes(props.inspection_results);

        acc[city].total += 1;
        if (!isCompliant) {
            acc[city].nonCompliantCount += 1;
        }

        return acc;
    }, {});

    const cityData = Object.entries(cityGroups).map(([city, v]) => ({
        city,
        compliant: v.total - v.nonCompliantCount,
        nonCompliant: v.nonCompliantCount,
        total: v.total,
        percentage: (v.nonCompliantCount / v.total) * 100
    }));

    // top 10 non-compliant car
    const top10Cities = [...cityData]
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 10);

    setTimeout(() => {
        renderStatsViews(cityData, top10Cities);
    }, 0);

    // buttons to change view
    return `
        <div class="stats-controls">
            <button id="btn-insights" class="view-button">Key Insights</button>
            <button id="btn-cards" class="view-button">Top 10 Cities</button>
            <button id="btn-chart" class="view-button">Stacked Chart</button>
        </div>

        <div class="chart-container">
            <div>
            <div class="legend"></div>
            <div id="stats-description"></div>
            <div id="stats-content"></div>
            </div>
        </div>
    `;

    // const cityStatsArray = Object.keys(cityGroups).map(cityName => {
    //     const stats = cityGroups[cityName];
    //     const percentage = (stats.nonCompliantCount / stats.total) * 100;
    //     return {
    //         name: cityName,
    //         percentage: parseFloat(percentage.toFixed(1)),
    //         totalCount: stats.total,
    //         nonCompliantCount: stats.nonCompliantCount
    //     };
    // });

    // const top3Cities = cityStatsArray
    //     .sort((a, b) => b.percentage - a.percentage)
    //     .slice(0, 10);

    // /* html return */
    // return top3Cities.map(city => `
    //     <div class="stat-card">
    //         <div class="stat-label"><strong>${city.name}</strong></div>
    //         <div class="stat-number">${city.percentage}%</div>
    //         <div class="stat-label">Non-Compliance Rate</div>
    //         <br>
    //         <div class="stat-label">
    //             ${city.nonCompliantCount} Non-Compliant | ${city.totalCount} Total Restaurants
    //         </div>
    //     </div>
    // `).join('');
}        
    // <p>Distribution of compliant restaurants by city</p>

//   return 
//                 <h2 class="view-title">Stats View</h2>
//                 <div class="todo-implementation">
//                     <h3>TODO: Implement Statistics View Here</h3>
//                     <p><strong>Total records:</strong> ${data.length} items to analyze</p>
//                     <p><strong>Your task:</strong> Calculate and display key insights from the data</p>
//                     <p><strong>Consider:</strong> Average ratings? Price distribution? Most common cuisines? Geographic spread?</p>
//                     <p><strong>Good for:</strong> Understanding trends, making data-driven decisions, seeing the big picture</p>
//                 </div>
//             `;

function renderStatsViews(cityData, top10Cities) {

    function setDescription(text) {
            d3.select("#stats-description")
            .html("")
            .text(text);
        }

    let currentView = "cards";

    function hideLegend() {
        d3.select(".legend").html("");
    }

    function renderCards() {
        hideLegend();
        setDescription("Top 10 cities with the highest non-compliance rate across all restaurant inspections.");

        const container = d3.select("#stats-content");
        container.html("");
        

        container.selectAll("div")
            .data(top10Cities)
            .enter()
            .append("div")
            .attr("class", "stat-card")
            .html(d => `
                <strong>${d.city}</strong><br/>
                ${d.percentage.toFixed(1)}% Non-Compliance<br/>
                ${d.nonCompliant} / ${d.total}
            `);
    }


    function renderChart() {
        setDescription("Stacked bar chart showing compliant and non-compliant inspections per city.");

        const container = d3.select("#stats-content");
        container.html("");

        let state = {
            nonCompliant: true
        };

        const margin = { top: 20, right: 20, bottom: 60, left: 50 };
        const width = 1000;
        const height = 400;

        const svg = container.append("svg")
            .attr("class", "stacked-chart")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);


        const x = d3.scaleBand()
            .domain(cityData.map(d => d.city))
            .range([margin.left, width - margin.right])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(cityData, d => d.total)])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const stack = d3.stack().keys(["compliant", "nonCompliant"]);
        const stacked = stack(cityData);

        const color = {
            compliant: "#6a994e",
            nonCompliant: "#DC0100"
        };

        // stacked
        const layers = svg.selectAll(".layer")
            .data(stacked)
            .enter()
            .append("g")
            .attr("class", d => `layer layer-${d.key}`)
            .attr("fill", d => color[d.key]);

        layers.selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", d => x(d.data.city))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth());

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-40)")
            .style("text-anchor", "end")
            .style("font-family", "Cormorant");

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", margin.left - 40)
            .attr("text-anchor", "middle")
            .text("Number of Restaurants");

        const legendData = [
            { key: "compliant", label: "Compliant", color: "#6a994e" },
            { key: "nonCompliant", label: "Non-Compliant", color: "#DC0100" }
        ];

        const legend = d3.select(".legend");
        legend.html("");

        const items = legend.selectAll("div")
            .data(legendData)
            .enter()
            .append("div")
            .attr("class", ".legend")
            .on("click", (event, d) => {

                state.nonCompliant = !state.nonCompliant;

                d3.select(event.currentTarget)
                    .style("opacity", state.nonCompliant ? 1 : 0.3);

                updateVisibility();
            });

        items.append("div")
            .style("width", "12px")
            .style("height", "12px")
            .style("background", d => d.color);

        items.append("div")
            .text(d => d.label);

        function updateVisibility() {

            svg.selectAll(".layer-compliant")
                .style("opacity", 1);

            svg.selectAll(".layer-nonCompliant")
                .style("opacity", state.nonCompliant ? 1 : 0);
        }
    }

    // scatterplot makes no sense
    // function renderScatter(cityData) {

    //     const container = d3.select("#stats-vis");
    //     container.html("");

    //     const width = 700;
    //     const height = 400;
    //     const margin = { top: 30, right: 30, bottom: 50, left: 60 };

    //     const svg = container.append("svg")
    //         .attr("width", width)
    //         .attr("height", height);

    //     const x = d3.scaleLinear()
    //         .domain([0, d3.max(cityData, d => d.total)])
    //         .nice()
    //         .range([margin.left, width - margin.right]);

    //     const y = d3.scaleLinear()
    //         .domain([0, d3.max(cityData, d => d.percentage)])
    //         .nice()
    //         .range([height - margin.bottom, margin.top]);

    //     const color = d3.scaleSequential()
    //         .domain([0, 100])
    //         .interpolator(d3.interpolateRdYlGn);

    //     svg.append("g")
    //         .attr("transform", `translate(0,${height - margin.bottom})`)
    //         .call(d3.axisBottom(x));

    //     svg.append("g")
    //         .attr("transform", `translate(${margin.left},0)`)
    //         .call(d3.axisLeft(y));

    //     svg.append("text")
    //         .attr("x", width / 2)
    //         .attr("y", height - 10)
    //         .attr("text-anchor", "middle")
    //         .text("Total Restaurants");

    //     svg.append("text")
    //         .attr("transform", "rotate(-90)")
    //         .attr("x", -height / 2)
    //         .attr("y", 20)
    //         .attr("text-anchor", "middle")
    //         .text("% Non-Compliant");

    //     svg.selectAll("circle")
    //         .data(cityData)
    //         .enter()
    //         .append("circle")
    //         .attr("cx", d => x(d.total))
    //         .attr("cy", d => y(d.percentage))
    //         .attr("r", 5)
    //         .attr("fill", d => color(d.percentage));

    //     const tooltip = d3.select("body")
    //         .append("div")
    //         .attr("class", "tooltip")
    //         .style("opacity", 0);

    //     svg.selectAll("circle")
    //         .on("mouseover", (event, d) => {
    //             tooltip.style("opacity", 1)
    //                 .html(`
    //                     <strong>${d.city}</strong><br/>
    //                     ${d.total} restaurants<br/>
    //                     ${d.percentage.toFixed(1)}% non-compliant
    //                 `);
    //         })
    //         .on("mousemove", event => {
    //             tooltip
    //                 .style("left", (event.pageX + 10) + "px")
    //                 .style("top", (event.pageY + 10) + "px");
    //         })
    //         .on("mouseout", () => tooltip.style("opacity", 0));
    // }

    function renderInsights(cityData) {
        hideLegend();
        setDescription("Summary of key statistics across all restaurants and cities.");

        const container = d3.select("#stats-content");
        container.html("");

        const total = d3.sum(cityData, d => d.total);
        const nonCompliant = d3.sum(cityData, d => d.nonCompliant);
        const compliant = d3.sum(cityData, d => d.compliant);

        const percentNon = total ? (nonCompliant / total) * 100 : 0;
        const percentComp = total ? (compliant / total) * 100 : 0;

        const sorted = [...cityData].sort((a, b) => b.percentage - a.percentage);

        const worst = sorted[0];
        const best = sorted[sorted.length - 1];

        const insights = [
            { label: "Total Restaurants", value: total },
            { label: "Non-Compliance Rate", value: percentNon.toFixed(1) + "%" },
            { label: "Compliance Rate", value: percentComp.toFixed(1) + "%" },
            { label: "Worst City", value: `${worst.city} (${worst.percentage.toFixed(1)}%)` },
            { label: "Best City", value: `${best.city} (${best.percentage.toFixed(1)}%)` }
        ];

        container.selectAll("div")
            .data(insights)
            .enter()
            .append("div")
            .attr("class", "stat-card")
            .html(d => `
                <div class="stat-number">${d.value}</div>
                <div class="stat-label">${d.label}</div>
            `);
    }



    function render() {
        if (currentView === "cards") renderCards();
        else if (currentView === "chart") renderChart(cityData);
        else if (currentView === "insights") renderInsights(cityData);
    }

    d3.select("#btn-cards").on("click", () => {
        currentView = "cards";
        render();
    });

    d3.select("#btn-chart").on("click", () => {
        currentView = "chart";
        render();
    });

    // d3.select("#btn-scatter").on("click", () => {
    //     currentView = "scatter";
    //     render();
    // });

    d3.select("#btn-insights").on("click", () => {
        currentView = "insights";
        render();
    });

    render();
}

export default showStats;