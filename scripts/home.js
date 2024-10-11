// smooth scrolling for scrollDown button
const tsh= document.body.scrollHeight;
document.getElementById("scrollDown").addEventListener("click", scroll);
function scroll() {
    const s = window.scrollY;
    const d = tsh - s;
    const wh = window.innerHeight;
    const mxs = tsh - wh;
    if (s >= mxs) {
        return;
    }
    const st = performance.now();
    function a(currentTime) {
        const te = currentTime - st;
        const p = Math.min(te / 600, 1);
        const e = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
        window.scrollTo(0, s + d * e );
        if (p < 1) {
            requestAnimationFrame(a);
        }
    }
    requestAnimationFrame(a);
}