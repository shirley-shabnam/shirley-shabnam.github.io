import loadData from './load_data.js';

const data = await loadData();

const svg = d3.select("#chart-interactive");
const W = 1000;
const H = 520;

svg.attr("viewBox", `0 0 ${W} ${H}`)
   .attr("preserveAspectRatio", "xMidYMid meet")
   .attr("role", "img")
   .attr("aria-labelledby", "chart-interactive-title")
   .attr("aria-describedby", "chart-interactive-desc");

svg.append("title").attr("id", "chart-interactive-title")
   .text("Year-over-year correctional supervision rate by race, 2013–2023");
svg.append("desc").attr("id", "chart-interactive-desc")
   .text("Interactive bar chart showing the share of Black Adults and White Adults under correctional supervision for each year from 2013 to 2023. Use the year slider below the chart to change the displayed year. Black adults consistently have a higher rate of correctional supervision than White adults throughout this period.");

svg.append("rect")
   .attr("width", W).attr("height", H).attr("fill", "#1a0d0d");

const margin = { top: 70, right: 80, bottom: 80, left: 200 };
const innerW = W - margin.left - margin.right;
const innerH = H - margin.top - margin.bottom;

const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleBand()
    .domain(data.map(d => d.race))
    .range([0, innerW])
    .padding(0.5);

const y = d3.scaleLinear()
    .domain([0, 0.085])
    .range([innerH, 0]);

// y axis
g.append("g")
    .attr("class", "axis-y")
    .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%")));

// y label
g.append("text")
    .attr("class", "axis-label")
    .attr("x", -innerH / 2).attr("y", -55)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Share under correctional supervision");

// title 
svg.append("text")
    .attr("class", "svg-title")
    .attr("x", W / 2).attr("y", 36)
    .attr("text-anchor", "middle")
    .text("Year-over-year share by race");

// bars
const bars = g.selectAll(".inter-bar")
    .data(data).enter().append("rect")
    .attr("class", "inter-bar")
    .attr("x", d => x(d.race))
    .attr("width", x.bandwidth())
    .attr("y", innerH).attr("height", 0)
    .attr("fill", d => d.color);

// value 
const valueLabels = g.selectAll(".inter-vlabel")
    .data(data).enter().append("text")
    .attr("class", "vlabel")
    .attr("x", d => x(d.race) + x.bandwidth() / 2)
    .attr("y", innerH).attr("text-anchor", "middle")
    .text("");

// race labels
g.selectAll(".inter-rlabel")
    .data(data).enter().append("text")
    .attr("class", "rlabel")
    .attr("x", d => x(d.race) + x.bandwidth() / 2)
    .attr("y", innerH + 35)
    .attr("text-anchor", "middle")
    .text(d => d.race);

// year display in the chart corner
const yearText = svg.append("text")
    .attr("class", "year-display")
    .attr("x", W - margin.right).attr("y", margin.top - 20)
    .attr("text-anchor", "end")
    .text("2013");

// slider u interface
const slider     = document.getElementById("year-slider");
slider.setAttribute("aria-label", "Select year from 2013 to 2023");
slider.setAttribute("aria-valuemin", "2013");
slider.setAttribute("aria-valuemax", "2023");
slider.setAttribute("aria-valuenow", "2013");
slider.setAttribute("aria-valuetext", "2013");
const yearValue  = document.getElementById("year-value");
const readBlack  = document.getElementById("readout-black");
const readWhite  = document.getElementById("readout-white");
const readRatio  = document.getElementById("readout-ratio");

function lerp(a, b, t) { return a + (b - a) * t; }

function render(t) {
    //mapping 2013 → 2023
    const year = Math.round(lerp(2013, 2023, t));
    yearText.text(year);
    yearValue.textContent = year;

    const black = data.find(d => d.race === "Black Adults");
    const white = data.find(d => d.race === "White Adults");

    const blackDenom = lerp(black.start, black.end, t);
    const whiteDenom = lerp(white.start, white.end, t);
    const blackRate  = 1 / blackDenom;
    const whiteRate  = 1 / whiteDenom;
    const ratio      = blackRate / whiteRate;

    // update bars
    bars.data(data)
        .transition().duration(150).ease(d3.easeLinear)
        .attr("y", d => {
            const denom = lerp(d.start, d.end, t);
            return y(1 / denom);
        })
        .attr("height", d => {
            const denom = lerp(d.start, d.end, t);
            return innerH - y(1 / denom);
        });

    // value labels
    valueLabels.data(data)
        .transition().duration(150).ease(d3.easeLinear)
        .attr("y", d => {
            const denom = lerp(d.start, d.end, t);
            return y(1 / denom) - 14;
        })
        .text(d => {
            const denom = lerp(d.start, d.end, t);
            return `1 in ${denom.toFixed(1)}`;
        });

    // read out
    readBlack.textContent = blackDenom.toFixed(1);
    readWhite.textContent = whiteDenom.toFixed(1);
    readRatio.textContent = ratio.toFixed(2) + "×";

    slider.setAttribute("aria-valuenow", String(year));
    slider.setAttribute("aria-valuetext",
        `${year}: Black adults 1 in ${blackDenom.toFixed(1)}, White adults 1 in ${whiteDenom.toFixed(1)}, disparity ${ratio.toFixed(2)}×`);
}

slider.addEventListener("input", e => {
    const t = +e.target.value / 100;
    render(t);
});

// init
render(0);