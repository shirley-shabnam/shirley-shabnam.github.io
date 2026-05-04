import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as topojson from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";
/**
 * EXTERNAL LIBRARY VIEW
 * Pick an external library and pipe your data to it.
 */
function showVisualization(data) {
  // Requirements:
  // - Show data using an external library, such as leaflet.js or chartsjs or similar.
  // - Make a filter on this page so your external library only shows useful data.

    /*
        javascript goes here! you can return it below
    */ 
   setTimeout(() => drawMap(data), 0);
   return  `<p>Check the compliance status of restaurants in Prince George's county. Click on legend text to filter by compliance.</p>
            <div class="legend"></div>
            <div class="vis-container"></div>`;
    
}
    // d3.json("data.json").then(marylandGeo => {
    //     svg.append("g")
    //         .selectAll("path")
    //         .data(cleanData)
    //         .enter()
    //         .append("path")
    //         .attr("d", path)
    //         .attr("fill", "#eee")
    //         .attr("stroke", "#333");

    //     console.log("total:", (data).length);
    //     // plot points
    //     svg.append("g")
    //         .selectAll("circle")
    //         .data(cleanData)
    //         .enter()
    //         .append("circle")
    //         .attr("cx", d => projection(d.geometry.coordinates)[0])
    //         .attr("cy", d => projection(d.geometry.coordinates)[1])
    //         .attr("r", 4)
    //         .attr("fill", d => isCompliant(d) ? "green" : "red")
    //         .attr("opacity", 0.7)
    //         .on("mouseover", function(event, d) {
    //             tooltip.style("opacity", 1)
    //                 .html(`
    //                     <strong>${d.properties.name}</strong><br/>
    //                     City: ${d.properties.city}<br/>
    //                     Result: ${d.properties.inspection_results}<br/>
    //                     Date: ${d.properties.inspection_date}
    //                 `);
    //         })
    //         .on("mousemove", function(event) {
    //             tooltip
    //                 .style("left", (event.pageX + 10) + "px")
    //                 .style("top", (event.pageY + 10) + "px");
    //         })
    //         .on("mouseout", function() {
    //             tooltip.style("opacity", 0);
    //         });
    // });

    let circles;

    function drawMap(data) {
        const state = {
            compliant: true,
            nonCompliant: true
        };
        //const container = d3.select(".vis-container").node().parentNode;

        const svg = d3.select(".vis-container")
            .html("")
            .append("svg")
            // .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%")
            .style("height", "100%")
            .style("min-height", "500px")
            .style("border", "1px solid red");

        const width = svg.node().getBoundingClientRect().width;
        const height = svg.node().getBoundingClientRect().height;

        svg.attr("viewBox", `0 0 ${width} ${height}`);


        const g = svg.append("g");

        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        

        const compliantValues = new Set([
            'Facility Reopened',
            'Compliance Schedule - Completed',
            '------',
            'Compliant - No Health Risk'
        ]);

        function isCompliant(d) {
            return compliantValues.has(d.properties.inspection_results);
        }

        const validData = data.filter(d =>
            d.geometry && d.geometry.coordinates
        );

        

        console.log("Plotting:", validData.length);

        d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json")
            .then(us => {

                const counties = topojson.feature(us, us.objects.counties);

                const PGC = {
                    type: "FeatureCollection",
                    features: counties.features.filter(d =>
                        d.id === "24033"
                    )
                };

                const projection = d3.geoMercator()
                    .scale(1)
                    .translate([0, 0]);
                const path = d3.geoPath().projection(projection);

                projection.fitSize([width, height], PGC);
                // console.log("circles:", circles.size());

                // Draw map
                g.append("g")
                    .selectAll("path")
                    .data(PGC.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("fill", "#f2cc8f")
                    .attr("stroke", "#751c23");

                // plot points
                circles = g.append("g")
                    .selectAll("circle")
                    .data(validData)
                    .enter()
                    .append("circle")
                    .attr("cx", d => projection(d.geometry.coordinates)[0])
                    .attr("cy", d => projection(d.geometry.coordinates)[1])
                    .attr("r", 4)
                    .attr("fill", d => isCompliant(d) ? "#6a994e" : "#DC0100")
                    .attr("opacity", 0.8)
                    .on("mouseover", (event, d) => {
                        tooltip.style("opacity", 1)
                            .attr("class", "tooltip")
                            .html(`
                                <strong>${d.properties.name}</strong><br/>
                                <strong>City: </strong>${d.properties.city}<br/>
                                <strong>Result: <strong><i>${d.properties.inspection_results}</i>
                            `);
                    })
                    .on("mousemove", event => {
                        tooltip
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY + 10) + "px");
                    })
                    .on("mouseout", () => tooltip.style("opacity", 0))
                    // .catch(err => console.error("Map load failed:", err));

                function updateVisibility() {
                    circles
                        .attr("opacity", d => {
                            const ok = isCompliant(d);

                            if (ok && state.compliant) return 0.8;
                            if (!ok && state.nonCompliant) return 0.8;

                            return 0;
                        })
                        .attr("pointer-events", d => {
                            const ok = isCompliant(d);

                            if (ok && state.compliant) return "all";
                            if (!ok && state.nonCompliant) return "all";

                            return "none";
                        });
                }

                const zoom = d3.zoom()
                    .scaleExtent([1, 8])
                    .on("zoom", (event) => {
                        console.log("zoomin:", event.transform);
                        g.attr("transform", event.transform);
                        circles.attr("r", 4 / event.transform.k);
                    });

                svg.call(zoom);

                    // const legendWidth = width * 0.2;
                    // const legendHeight = height * 0.12;

                    // legend.insert("rect", ":first-child")
                    //     .attr("width", legendWidth)
                    //     .attr("height", legendHeight)
                    //     .attr("fill", "white")
                    //     .attr("opacity", 0.8)

                    
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
                        // .style("display", "flex")
                        // .style("align-items", "center")
                        // .style("gap", "6px")
                        // .style("cursor", "pointer")
                        // .style("user-select", "none")
                        .on("click", (event, d) => {

                            // toggl
                            state[d.key] = !state[d.key];

                            // select deselect
                            d3.select(event.currentTarget)
                                .style("opacity", state[d.key] ? 1 : 0.3);

                            updateVisibility();
                        });

                    items.append("div")
                        .style("width", "16px")
                        .style("height", "16px")
                        .style("background", d => d.color);

                    items.append("div")
                        .text(d => d.label)
            });
    }
  
        /*html*/ 
//   return `
//                 <h2 class="view-title">Library View</h2>
//                 <div class="todo-implementation">
//                     <h3>TODO: Implement Library View</h3>
//                     <p><strong>Data available:</strong> ${data.length} items loaded</p>
//                     <p><strong>Your task:</strong> Display the data using an external library</p>
//                     <p><strong>Consider:</strong> What types of data do you have? Lat-long? Percentages from the stats page? Etc.</p>
//                     <p><strong>Good for:</strong> User interpretability</p>
//                 </div>
//             `;
// }

export default showVisualization;