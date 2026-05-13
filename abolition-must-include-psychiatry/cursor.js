const $ball = document.querySelector('.cursor__ball');
const $hoverables = document.querySelectorAll('.nav-brand, .nav-button, .navlink');

document.body.addEventListener('mousemove', onMouseMove);
$hoverables.forEach(el => {
    el.addEventListener('mouseenter', onMouseHover);
    el.addEventListener('mouseleave', onMouseHoverOut);
});

function onMouseMove(e) {
    gsap.to($ball, { duration: 0.4, x: e.clientX - 15, y: e.clientY - 15 });
}

function onMouseHover() {
    gsap.to($ball, { duration: 0.3, scale: 3 });
}

function onMouseHoverOut() {
    gsap.to($ball, { duration: 0.3, scale: 1 });
}
