
import loadData from './load_data.js';
import loadQuotes from './load_quotes.js';

const prisonDisparity = await loadData();
const survivorQuotes  = await loadQuotes();

prisonDisparity.forEach(d => {
    d.rate2013 = 1 / d.start;
    d.rate2023 = 1 / d.end;
});

// from quotes.json 

const stepsArticle = d3.select("#scrolly-overlay .overlay-steps");

survivorQuotes.forEach((q, i) => {
    const step = stepsArticle.append("div")
        .attr("class", "step overlay-step")
        .attr("data-index", i);

    const card = step.append("div").attr("class", "quote-card");

    card.append("p").attr("class", "quote-statement")
        .text(`"${q.statement}"`);

    const meta = card.append("div").attr("class", "quote-meta");
    meta.append("p").attr("class", "quote-author").text(`— ${q.author}`);
    meta.append("p").attr("class", "quote-article")
        .html(`<strong>${q.article}</strong>, Universal Declaration of Human Rights`);
    meta.append("p").attr("class", "quote-right").text(`"${q.human_right}"`);
});

// ─── SVG setup ───────────────────────────────────────────────────────────────

const svg = d3.select("#chart-side");
const W = 1200;
const H = 800;

svg.attr("viewBox", `0 0 ${W} ${H}`)
   .attr("preserveAspectRatio", "xMidYMid meet")
   .attr("role", "img")
   .attr("aria-labelledby", "chart-side-title")
   .attr("aria-describedby", "chart-side-desc");

svg.append("title").attr("id", "chart-side-title")
   .text("Racial disparities in correctional supervision, 2013–2023");
svg.append("desc").attr("id", "chart-side-desc")
   .text("A series of five data visualizations: (1) bar chart of adults under correctional supervision by race in 2013 and 2023; (2) dot grid showing 1 in 13 Black adults and 1 in 49 White adults under supervision; (3) the 3.5× disparity ratio; (4) dumbbell chart showing decade-long change by race; (5) closing statement — The asylum never died.");

// dark backdrop
svg.append("rect")
   .attr("width", W).attr("height", H)
   .attr("fill", "#0d0707");

// layers
const layerBars     = svg.append("g").attr("class", "layer layer-bars");
const layerDots     = svg.append("g").attr("class", "layer layer-dots").style("opacity", 0);
const layerRatio    = svg.append("g").attr("class", "layer layer-ratio").style("opacity", 0);
const layerDumbbell = svg.append("g").attr("class", "layer layer-dumbbell").style("opacity", 0);
const layerFinal    = svg.append("g").attr("class", "layer layer-final").style("opacity", 0);

const ALL_LAYERS = [layerBars, layerDots, layerRatio, layerDumbbell, layerFinal];

const margin = { top: 100, right: 100, bottom: 120, left: 200 };
const innerW = W - margin.left - margin.right;
const innerH = H - margin.top - margin.bottom;

const x = d3.scaleBand()
    .domain(prisonDisparity.map(d => d.race))
    .range([0, innerW])
    .padding(0.45);

const y = d3.scaleLinear()
    .domain([0, 0.1])
    .range([innerH, 0]);

function show(active) {
    ALL_LAYERS.forEach(layer => {
        layer.interrupt()
            .transition().duration(700)
            .style("opacity", layer === active ? 1 : 0);
    });
    // stagger-in the dot circles when the layer becomes visible from hidden
    if (active === layerDots && +layerDots.style("opacity") < 0.1) {
        layerDots.selectAll("circle")
            .interrupt()
            .attr("opacity", 0)
            .transition()
            .delay(function(_d, i) { return i * 18; })
            .duration(350)
            .attr("opacity", 1);
    }
}

// ─── Layer 0: bar chart with axes ────────────────────────────────────────────

(function drawBars() {
    const inner = layerBars.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    inner.append("text")
        .attr("class", "svg-title")
        .attr("x", innerW / 2).attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Adults under correctional supervision");

    inner.append("text")
        .attr("class", "svg-subtitle")
        .attr("x", innerW / 2).attr("y", -22)
        .attr("text-anchor", "middle")
        .text("U.S. Bureau of Justice Statistics, 2013 vs 2023");

    // 2013 bars (lighter)
    inner.selectAll(".bar2013")
        .data(prisonDisparity).enter().append("rect")
        .attr("class", "bar2013")
        .attr("x", d => x(d.race))
        .attr("y", d => y(d.rate2013))
        .attr("width", x.bandwidth() / 2 - 4)
        .attr("height", d => innerH - y(d.rate2013))
        .attr("fill", d => d.color)
        .attr("opacity", 0.45);

    // 2023 bars
    inner.selectAll(".bar2023")
        .data(prisonDisparity).enter().append("rect")
        .attr("class", "bar2023")
        .attr("x", d => x(d.race) + x.bandwidth() / 2 + 4)
        .attr("y", d => y(d.rate2023))
        .attr("width", x.bandwidth() / 2 - 4)
        .attr("height", d => innerH - y(d.rate2023))
        .attr("fill", d => d.color);

    // labels above
    inner.selectAll(".v2013")
        .data(prisonDisparity).enter().append("text")
        .attr("class", "vlabel")
        .attr("x", d => x(d.race) + x.bandwidth() / 4)
        .attr("y", d => y(d.rate2013) - 12)
        .attr("text-anchor", "middle")
        .text(d => `1 in ${d.start}`);

    inner.selectAll(".v2023")
        .data(prisonDisparity).enter().append("text")
        .attr("class", "vlabel")
        .attr("x", d => x(d.race) + x.bandwidth() * 0.75)
        .attr("y", d => y(d.rate2023) - 12)
        .attr("text-anchor", "middle")
        .text(d => `1 in ${d.end}`);

    // year micro-labels at bar feet
    inner.selectAll(".y2013")
        .data(prisonDisparity).enter().append("text")
        .attr("class", "ylabel-micro")
        .attr("x", d => x(d.race) + x.bandwidth() / 4)
        .attr("y", innerH + 18)
        .attr("text-anchor", "middle")
        .text("2013");

    inner.selectAll(".y2023")
        .data(prisonDisparity).enter().append("text")
        .attr("class", "ylabel-micro")
        .attr("x", d => x(d.race) + x.bandwidth() * 0.75)
        .attr("y", innerH + 18)
        .attr("text-anchor", "middle")
        .text("2023");

    // race labels
    inner.selectAll(".rlabel")
        .data(prisonDisparity).enter().append("text")
        .attr("class", "rlabel")
        .attr("x", d => x(d.race) + x.bandwidth() / 2)
        .attr("y", innerH + 50)
        .attr("text-anchor", "middle")
        .text(d => d.race);

    // y-axis
    inner.append("g")
        .attr("class", "axis-y")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%")));
})();

// ─── Layer 1: dot grid ───────────────────────────────────────────────────────

(function drawDots() {
    const inner = layerDots.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    inner.append("text")
        .attr("class", "svg-title")
        .attr("x", innerW / 2).attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Each circle is one person");

    inner.append("text")
        .attr("class", "svg-subtitle")
        .attr("x", innerW / 2).attr("y", -22)
        .attr("text-anchor", "middle")
        .text("Filled = under correctional supervision");

    const groups = [
        { label: "Black adults", denom: 13, color: "#c1272d", y: 60 },
        { label: "White adults", denom: 49, color: "#e8c547", y: 320 }
    ];

    groups.forEach(group => {
        inner.append("text")
            .attr("class", "rlabel")
            .attr("x", 0).attr("y", group.y - 15)
            .attr("text-anchor", "start")
            .text(`${group.label} — 1 in ${group.denom}`);

        const total = group.denom;
        const cols = Math.min(total, 13);
        const cellSize = 28;

        d3.range(total).forEach((_d, i) => {
            inner.append("circle")
                .attr("cx", (i % cols) * cellSize + cellSize / 2)
                .attr("cy", group.y + Math.floor(i / cols) * cellSize + cellSize / 2)
                .attr("r", cellSize / 2 - 4)
                .attr("fill", i === 0 ? group.color : "#3a1f1f")
                .attr("stroke", i === 0 ? group.color : "#5a3535")
                .attr("stroke-width", 1.5)
                .attr("opacity", 0);
        });
    });
})();

// ─── Layer 2: ratio big number ───────────────────────────────────────────────

(function drawRatio() {
    const inner = layerRatio.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    inner.append("text")
        .attr("class", "svg-title")
        .attr("x", innerW / 2).attr("y", -50)
        .attr("text-anchor", "middle")
        .text("The disparity, distilled");

    inner.append("text")
        .attr("class", "big-number")
        .attr("x", innerW / 2).attr("y", innerH / 2 - 20)
        .attr("text-anchor", "middle")
        .text("3.5×");

    inner.append("text")
        .attr("class", "annotation")
        .attr("x", innerW / 2).attr("y", innerH / 2 + 60)
        .attr("text-anchor", "middle")
        .text("Black adults are over 3.5 times more likely");

    inner.append("text")
        .attr("class", "annotation")
        .attr("x", innerW / 2).attr("y", innerH / 2 + 100)
        .attr("text-anchor", "middle")
        .text("to be incarcerated than White adults.");
})();

// ─── Layer 3: dumbbell (change over time) ────────────────────────────────────

(function drawDumbbell() {
    const inner = layerDumbbell.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    inner.append("text")
        .attr("class", "svg-title")
        .attr("x", innerW / 2).attr("y", -50)
        .attr("text-anchor", "middle")
        .text("A decade of barely-moved ground");

    const scale = d3.scaleLinear().domain([0, 70]).range([100, innerW - 100]);

    inner.append("g").call(
        d3.axisBottom(scale).ticks(7).tickFormat(d => d === 0 ? "" : `1 in ${d}`)
    ).attr("transform", `translate(0, ${innerH - 60})`).attr("class", "axis-bottom");

    prisonDisparity.forEach((d, i) => {
        const yPos = 80 + i * 180;

        inner.append("line")
            .attr("x1", scale(d.start)).attr("x2", scale(d.start))
            .attr("y1", yPos).attr("y2", yPos)
          .transition().duration(900)
            .attr("x2", scale(d.end))
            .attr("stroke", "#fff").attr("stroke-width", 3);

        inner.append("circle")
            .attr("cx", scale(d.start)).attr("cy", yPos)
            .attr("r", 14).attr("fill", d.color).attr("opacity", 0.5);

        inner.append("circle")
            .attr("cx", scale(d.start)).attr("cy", yPos)
            .attr("r", 14).attr("fill", d.color)
          .transition().duration(900)
            .attr("cx", scale(d.end));

        inner.append("text")
            .attr("class", "rlabel")
            .attr("x", 0).attr("y", yPos + 6)
            .attr("text-anchor", "start")
            .text(d.race);

        const x1 = scale(d.start);
        const x2 = scale(d.end);
        const labelsOverlap = Math.abs(x2 - x1) < 80;

        inner.append("text")
            .attr("class", "ylabel-micro")
            .attr("x", x1).attr("y", yPos - (labelsOverlap ? 44 : 22))
            .attr("text-anchor", "middle")
            .text(`1 in ${d.start} (2013)`);

        inner.append("text")
            .attr("class", "ylabel-micro")
            .attr("x", x2).attr("y", yPos - 22)
            .attr("text-anchor", "middle")
            .text(`1 in ${d.end} (2023)`);
    });
})();

// ─── Layer 4: closing message ────────────────────────────────────────────────

(function drawFinal() {
    const inner = layerFinal.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    inner.append("text")
        .attr("class", "big-number")
        .attr("x", innerW / 2).attr("y", innerH / 2 - 90)
        .attr("text-anchor", "middle")
        .text("The asylum");

    inner.append("text")
        .attr("class", "big-number")
        .attr("x", innerW / 2).attr("y", innerH / 2 + 75)
        .attr("text-anchor", "middle")
        .style("fill", "#c1272d")
        .text("never died.");

    inner.append("text")
        .attr("class", "annotation")
        .attr("x", innerW / 2).attr("y", innerH / 2 + 160)
        .attr("text-anchor", "middle")
        .text("It just changed its name.");
})();

// ─── Map quote index → viz layer ─────────────────────────────────────────────

const STATE_LAYERS = [layerBars, layerDots, layerRatio, layerDumbbell, layerFinal];

function update(i) {
    const idx = Math.max(0, Math.min(i, STATE_LAYERS.length - 1));
    show(STATE_LAYERS[idx]);
}

update(0);

// ─── enter-view + Stickyfill ─────────────────────────────────────────────────

if (window.Stickyfill) {
    Stickyfill.add(d3.select("#scrolly-overlay .sticky").node());
}

const stepNodes = d3.selectAll("#scrolly-overlay .step");

enterView({
    selector: "#scrolly-overlay .step",
    offset: 0.55,
    enter: el => {
        const i = +el.dataset.index;
        stepNodes.classed("is-active", function () {
            return +this.dataset.index === i;
        });
        update(i);
    },
    exit: el => {
        const i = Math.max(0, +el.dataset.index - 1);
        update(i);
    }
});