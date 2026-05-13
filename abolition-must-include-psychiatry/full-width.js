import loadGroupedData from './load_grouped_data.js';

const groupedRaceData = await loadGroupedData();

const svg = d3.select("#chart-full");
const W = 1000;
const H = 700;

svg.attr("viewBox", `0 0 ${W} ${H}`)
   .attr("preserveAspectRatio", "xMidYMid meet")
   .attr("role", "img")
   .attr("aria-labelledby", "chart-full-title")
   .attr("aria-describedby", "chart-full-desc");

svg.append("title").attr("id", "chart-full-title")
   .text("Psychiatric diagnosis breakdown by race");
svg.append("desc").attr("id", "chart-full-desc")
   .text("Stacked horizontal bar charts comparing the percentage distribution of psychiatric diagnoses for Black/African American and White patients, using SAMHSA Mental Health Client-Level Data. Diagnoses include Schizophrenia/Psychotic disorders, Anxiety disorders, Alcohol/Substance use disorders, Oppositional defiant disorders, and Other diagnoses. Black patients are disproportionately diagnosed with Schizophrenia/Psychotic disorders relative to White patients.");

// ── Layout ───────────────────────────────────────────────────────────────────
const MX   = 90;
const barH = 76;
const BAR_Y = { "Black/AA": 170, "White": 370 };
const RACES = ["Black/AA", "White"];
const POPULATION = { "Black/AA": 949670, "White": 275825 };

// ── Diagnosis segments ────────────────────────────────────────────────────────
const SEG = [
    { key: "Schizophrenia or other psychotic disorders", label: "Schizophrenia / Psychotic", color: "#c1272d" },
    { key: "Anxiety disorders",                          label: "Anxiety disorders",          color: "#e8a030" },
    { key: "Alcohol or substance use disorders",         label: "Alcohol / Substance",        color: "#7a9060" },
    { key: "Oppositional defiant disorders",             label: "Oppositional defiant",       color: "#F78154" },
    { key: "__other__",                                  label: "Other diagnoses",            color: "#ead4be" },
];

// ── Data processing ───────────────────────────────────────────────────────────
const totals  = { "Black/AA": 0, "White": 0 };
const byDiag  = {};
SEG.forEach(s => { byDiag[s.key] = { "Black/AA": 0, "White": 0 }; });

groupedRaceData.forEach(d => {
    const r = d.RACE;
    if (r !== "Black/AA" && r !== "White") return;
    totals[r] += d.count;
    const hit = SEG.find(s => s.key !== "__other__" && s.key === d.MH1);
    byDiag[hit ? hit.key : "__other__"][r] += d.count;
});

// pct[segKey][race] = 0–100
const pctData = {};
SEG.forEach(s => {
    pctData[s.key] = {};
    RACES.forEach(r => {
        pctData[s.key][r] = totals[r] > 0 ? (byDiag[s.key][r] / totals[r]) * 100 : 0;
    });
});

// ── Bar stacks ────────────────────────────────────────────────────────────────
const barW = W - MX * 2;

const stacks = {};
RACES.forEach(race => {
    let x = MX;
    stacks[race] = SEG.map(s => {
        const p  = pctData[s.key][race];
        const w  = (p / 100) * barW;
        const entry = { key: s.key, x, w, pct: p, color: s.color, label: s.label };
        x += w;
        return entry;
    });
});

// ── SVG layers ────────────────────────────────────────────────────────────────
const layerTitle    = svg.append("g");
const layerBars     = svg.append("g");
const layerAnnotate = svg.append("g");

// ── Draw static bars (once) ───────────────────────────────────────────────────
RACES.forEach(race => {
    const y = BAR_Y[race];

    // Race label below bar
    layerBars.append("text")
        .attr("x", MX).attr("y", y + barH + 26)
        .attr("class", "rlabel")
        .text(race === "Black/AA" ? "Black / African American" : "White");

    // Segments
    stacks[race].forEach(seg => {
        layerBars.append("rect")
            .attr("class", "bar-seg")
            .attr("data-key", seg.key)
            .attr("data-race", race)
            .attr("x", seg.x).attr("y", y)
            .attr("width", Math.max(seg.w, 0)).attr("height", barH)
            .attr("fill", seg.color)
            .attr("fill-opacity", 0.85);
    });
});

// ── Title helper ──────────────────────────────────────────────────────────────
function setTitle(main, sub) {
    layerTitle.selectAll("*").remove();
    layerTitle.append("text")
        .attr("x", W / 2).attr("y", 52)
        .attr("text-anchor", "middle")
        .attr("class", "svg-title")
        .text(main);
    if (sub) {
        layerTitle.append("text")
            .attr("x", W / 2).attr("y", 85)
            .attr("text-anchor", "middle")
            .attr("class", "svg-subtitle")
            .text(sub);
    }
}

// ── Spotlight a single diagnosis ─────────────────────────────────────────────
function spotlight(diagKey) {
    layerBars.selectAll("rect.bar-seg")
        .transition().duration(500)
        .attr("fill-opacity", function () {
            return d3.select(this).attr("data-key") === diagKey ? 1.0 : 0.18;
        });

    layerAnnotate.selectAll("*").remove();

    const pBlack = pctData[diagKey]["Black/AA"];
    const pWhite = pctData[diagKey]["White"];

    // Percentage label above each bar
    RACES.forEach(race => {
        const seg = stacks[race].find(s => s.key === diagKey);
        if (!seg || seg.w < 2) return;
        const cx = seg.x + seg.w / 2;
        layerAnnotate.append("text")
            .attr("x", cx).attr("y", BAR_Y[race] - 12)
            .attr("text-anchor", "middle")
            .attr("class", "vlabel")
            .attr("opacity", 0)
            .text(`${(race === "Black/AA" ? pBlack : pWhite).toFixed(1)}%`)
            .transition().duration(500)
            .attr("opacity", 1);
    });

    // Divider line
    layerAnnotate.append("line")
        .attr("x1", MX).attr("x2", W - MX)
        .attr("y1", 580).attr("y2", 580)
        .attr("stroke", SEG.find(s => s.key === diagKey)?.color || "#c1272d")
        .attr("stroke-width", 1).attr("opacity", 0.35);

    // Disparity annotation
    if (pBlack > 0 && pWhite > 0) {
        const ratio = (pBlack / pWhite).toFixed(1);
        layerAnnotate.append("text")
            .attr("x", W / 2).attr("y", 620)
            .attr("text-anchor", "middle")
            .attr("class", "annotation")
            .attr("opacity", 0)
            .text(`Black patients are ${ratio}× more likely to receive this diagnosis`)
            .transition().duration(600).delay(250)
            .attr("opacity", 1);
    }
}

// ── Show all segments (intro / reset) ────────────────────────────────────────
function showAll() {
    layerBars.selectAll("rect.bar-seg")
        .transition().duration(500)
        .attr("fill-opacity", 0.85);
    layerAnnotate.selectAll("*").remove();
}

/* ── Cells visualization (kept for reference) ────────────────────────────────
function showCells() {
    layerBars.selectAll("rect.bar-seg")
        .transition().duration(500)
        .attr("fill-opacity", 0.07);

    layerAnnotate.selectAll("*").remove();

    const cols = 10, rows = 4, filled = 25;
    const cell = 42;
    const gx   = (W - cols * (cell + 4)) / 2;
    const gy   = 160;

    d3.range(cols * rows).forEach(i => {
        layerAnnotate.append("rect")
            .attr("x", gx + (i % cols) * (cell + 4))
            .attr("y", gy + Math.floor(i / cols) * (cell + 4))
            .attr("width", cell).attr("height", cell)
            .attr("rx", 3)
            .attr("fill", i < filled ? "#c1272d" : "#2a1414")
            .attr("stroke", "#1a0d0d").attr("stroke-width", 2)
            .attr("opacity", 0)
            .transition().delay(i * 18).duration(350)
            .attr("opacity", 1);
    });

    layerAnnotate.append("text")
        .attr("x", W / 2).attr("y", 580)
        .attr("text-anchor", "middle")
        .attr("class", "annotation")
        .attr("opacity", 0)
        .text("25 of 40 cells — the carceral logic lives inside psychiatric care")
        .transition().duration(600).delay(500)
        .attr("opacity", 1);
}
──────────────────────────────────────────────────────────────────────────── */

// ── Step functions ────────────────────────────────────────────────────────────
function step0() {
    setTitle("Psychiatric diagnosis breakdown by race", "SAMHSA Mental Health Client-Level Data, 2023");
    showAll();

    // 2-row legend: 3 items row 1, 2 items row 2 centered
    const colStep = barW / 3;

    SEG.slice(0, 3).forEach((s, i) => {
        const lx = MX + i * colStep;
        layerAnnotate.append("rect")
            .attr("x", lx).attr("y", 548)
            .attr("width", 12).attr("height", 12)
            .attr("fill", s.color);
        layerAnnotate.append("text")
            .attr("x", lx + 17).attr("y", 559)
            .attr("class", "svg-subtitle")
            .text(s.label);
    });

    SEG.slice(3).forEach((s, i) => {
        const lx = MX + barW * (0.25 + i * 0.5);
        layerAnnotate.append("rect")
            .attr("x", lx).attr("y", 572)
            .attr("width", 12).attr("height", 12)
            .attr("fill", s.color);
        layerAnnotate.append("text")
            .attr("x", lx + 17).attr("y", 583)
            .attr("class", "svg-subtitle")
            .text(s.label);
    });
}

function step1() {
    setTitle("Schizophrenia & psychotic disorders", "As a share of all admissions within each racial group");
    spotlight("Schizophrenia or other psychotic disorders");
}

function step2() {
    setTitle("Anxiety disorders", "As a share of all admissions within each racial group");
    spotlight("Anxiety disorders");
}

function step3() {
    setTitle("Alcohol & substance use disorders", "As a share of all admissions within each racial group");
    spotlight("Alcohol or substance use disorders");
}

function step4() {
    setTitle("Oppositional defiant disorder", "Racial disparities in a childhood diagnosis");
    spotlight("Oppositional defiant disorders");
}

function step5() {
    setTitle("Per-capita admission rate", "Adjusted by U.S. population, per 1,000");
    showAll();
    layerAnnotate.selectAll("*").remove();

    const rateB = (totals["Black/AA"] / POPULATION["Black/AA"] * 1000).toFixed(1);
    const rateW = (totals["White"]    / POPULATION["White"]    * 1000).toFixed(1);
    const ratio = (
        (totals["Black/AA"] / POPULATION["Black/AA"]) /
        (totals["White"]    / POPULATION["White"])
    ).toFixed(1);

    [
        { text: `${rateB} admissions per 1,000 Black adults`, y: 560, cls: "vlabel" },
        { text: `${rateW} admissions per 1,000 White adults`,  y: 600, cls: "vlabel" },
        { text: `${ratio}× higher per-capita admission rate for Black adults`, y: 645, cls: "annotation" },
    ].forEach(({ text, y, cls }) => {
        layerAnnotate.append("text")
            .attr("x", W / 2).attr("y", y)
            .attr("text-anchor", "middle")
            .attr("class", cls)
            .attr("opacity", 0)
            .text(text)
            .transition().duration(600)
            .attr("opacity", 1);
    });
}

const STEPS = [step0, step1, step2, step3, step4, step5];

function update(i) {
    STEPS[Math.max(0, Math.min(i, STEPS.length - 1))]();
}

// ── Mobile dot navigation ─────────────────────────────────────────────────────
function syncDot(i) {
    document.querySelectorAll('.step-dot').forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === i);
    });
}

function initMobileDots() {
    const container = document.getElementById('racial-disparity-dots');
    if (!container) return;
    STEPS.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'step-dot';
        dot.setAttribute('aria-label', `Step ${i + 1}`);
        dot.addEventListener('click', () => {
            update(i);
            syncDot(i);
        });
        container.appendChild(dot);
    });
    syncDot(0);
}

update(0);
initMobileDots();

// ── enter-view ────────────────────────────────────────────────────────────────
const stepSel = d3.select("#racial-disparity").selectAll(".step");

enterView({
    selector: "#racial-disparity .step",
    offset: 0.6,
    enter: el => {
        const i = +el.dataset.index;
        stepSel.classed("is-active", function () {
            return +this.dataset.index === i;
        });
        update(i);
        syncDot(i);
    },
    exit: el => {
        const newI = Math.max(0, +el.dataset.index - 1);
        update(newI);
        syncDot(newI);
    },
});
