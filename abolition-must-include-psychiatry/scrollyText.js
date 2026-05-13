// // import loadData from "./load_data.js";

// export default async function initScrollyText() {
//     const steps = document.querySelectorAll(".step");

//     const observer = new IntersectionObserver((entries) => {

//     entries.forEach(entry => {

//         if (!entry.isIntersecting) return;

//         const el = entry.target;
//         const index = +el.dataset.index;

//         // highlight active step
//         steps.forEach(s => s.classList.remove("is-active"));
//         el.classList.add("is-active");

//         // trigger chart once
//         if (index === 0) {
//         showChart();
//         }
//     });

//     }, {
//     threshold: 0.5
//     });

//     steps.forEach(step => observer.observe(step));
// }