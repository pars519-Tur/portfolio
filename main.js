// Sensor-tasking illustration
// Three ground sensors on a rotating Earth (top-down view) each observe one
// visible object per tasking step. Unobserved objects' uncertainty grows;
// observation shrinks it. Occasionally an object maneuvers to a new orbit and
// its uncertainty grows faster until a sensor reacquires it.
(function () {
    const canvas = document.getElementById('sim');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, cx = 0, cy = 0, R = 0, dpr = 1;
    let colors = {};

    function readColors() {
        const cs = getComputedStyle(document.documentElement);
        const v = (n) => cs.getPropertyValue(n).trim();
        colors = {
            ink: v('--ink'), slate: v('--slate'), signal: v('--signal'),
            maneuver: v('--maneuver'), orbit: v('--orbit'), paper2: v('--paper-2'), rule: v('--rule'),
        };
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        W = rect.width; H = rect.height;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cx = W / 2; cy = H / 2;
        R = Math.min(W, H) * 0.2;
    }

    // Deterministic RNG so the scene looks the same on each load
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    const N = 36;
    const SHELLS = [1.35, 1.6, 1.9, 2.2];
    const objects = [];
    for (let i = 0; i < N; i++) {
        const shell = SHELLS[Math.floor(rand() * SHELLS.length)];
        const r = shell + (rand() - 0.5) * 0.12;
        objects.push({
            r, rTarget: r,
            th: rand() * Math.PI * 2,
            dir: rand() < 0.85 ? 1 : -1,
            u: 0.2 + rand() * 0.6,     // normalized uncertainty, 0..1
            maneuvering: false,
            lost: false,               // maneuvered and not yet reacquired
        });
    }

    const sensorLon = [0.3, 2.4, 4.3];
    let earthRot = 0;
    let tasks = [];                // [{s, o, t}]
    let sinceTask = 0, sinceManeuver = 2.5;

    const TASK_DT = 0.55;          // s between tasking decisions
    const GROW = 0.055;            // uncertainty growth per s
    const GROW_LOST = 0.22;

    function omega(r) { return 0.38 * Math.pow(r / 1.35, -1.5); }  // Kepler-ish

    function pos(o) {
        return [cx + Math.cos(o.th) * o.r * R, cy + Math.sin(o.th) * o.r * R];
    }
    function sensorPos(k) {
        const a = sensorLon[k] + earthRot;
        return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, nx: Math.cos(a), ny: Math.sin(a) };
    }
    function visible(s, o) {
        const [x, y] = pos(o);
        return (x - s.x) * s.nx + (y - s.y) * s.ny > R * 0.08;
    }

    function step(dt) {
        earthRot += dt * 0.07;
        for (const o of objects) {
            o.th += o.dir * omega(o.r) * dt;
            if (o.maneuvering) {
                o.r += (o.rTarget - o.r) * Math.min(1, dt * 0.9);
                if (Math.abs(o.rTarget - o.r) < 0.01) { o.r = o.rTarget; o.maneuvering = false; }
            }
            o.u = Math.min(1, o.u + (o.lost ? GROW_LOST : GROW) * dt);
        }

        sinceManeuver += dt;
        if (sinceManeuver > 5.5) {
            sinceManeuver = 0;
            const candidates = objects.filter(o => !o.lost);
            const o = candidates[Math.floor(rand() * candidates.length)];
            const shells = SHELLS.filter(s => Math.abs(s - o.r) > 0.2);
            o.rTarget = shells[Math.floor(rand() * shells.length)];
            o.maneuvering = true; o.lost = true;
        }

        sinceTask += dt;
        if (sinceTask > TASK_DT) {
            sinceTask = 0;
            const taken = new Set();
            tasks = [];
            for (let k = 0; k < sensorLon.length; k++) {
                const s = sensorPos(k);
                let best = -1, bestU = -1;
                objects.forEach((o, i) => {
                    if (!taken.has(i) && visible(s, o) && o.u > bestU) { best = i; bestU = o.u; }
                });
                if (best >= 0) {
                    taken.add(best);
                    tasks.push({ s: k, o: best, t: 0 });
                    const o = objects[best];
                    o.u = 0.06;
                    if (!o.maneuvering) o.lost = false;
                }
            }
        }
        for (const t of tasks) t.t += dt;
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Orbit shells
        ctx.lineWidth = 1;
        ctx.strokeStyle = colors.orbit;
        for (const s of SHELLS) {
            ctx.beginPath(); ctx.arc(cx, cy, s * R, 0, Math.PI * 2); ctx.stroke();
        }

        // Earth
        ctx.fillStyle = colors.paper2;
        ctx.strokeStyle = colors.rule;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // a few meridians to show rotation
        ctx.strokeStyle = colors.orbit;
        for (let m = 0; m < 6; m++) {
            const a = earthRot + m * Math.PI / 3;
            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
        }

        // Tasking lines
        for (const t of tasks) {
            const s = sensorPos(t.s);
            const [x, y] = pos(objects[t.o]);
            const fade = Math.max(0, 1 - t.t / (TASK_DT * 1.1));
            ctx.globalAlpha = 0.25 + 0.6 * fade;
            ctx.strokeStyle = colors.signal;
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(x, y); ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Objects with uncertainty rings
        for (const o of objects) {
            const [x, y] = pos(o);
            const c = o.lost ? colors.maneuver : colors.ink;
            const ring = 3 + o.u * R * 0.3;
            ctx.strokeStyle = c;
            ctx.globalAlpha = o.lost ? 0.75 : 0.18 + 0.4 * o.u;
            ctx.lineWidth = o.lost ? 1.5 : 1;
            ctx.beginPath(); ctx.arc(x, y, ring, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.fillStyle = c;
            ctx.beginPath(); ctx.arc(x, y, o.lost ? 3.6 : 2.4, 0, Math.PI * 2); ctx.fill();
        }

        // Sensors
        for (let k = 0; k < sensorLon.length; k++) {
            const s = sensorPos(k);
            ctx.fillStyle = colors.signal;
            ctx.beginPath(); ctx.arc(s.x, s.y, 5, 0, Math.PI * 2); ctx.fill();
        }
    }

    let last = 0, running = false, onScreen = true;
    function frame(ts) {
        if (!running) return;
        const dt = Math.min(0.05, (ts - last) / 1000 || 0);
        last = ts;
        step(dt); draw();
        requestAnimationFrame(frame);
    }
    function start() {
        if (running || reduceMotion || !onScreen || document.hidden) return;
        running = true; last = performance.now(); requestAnimationFrame(frame);
    }
    function stop() { running = false; }

    readColors(); resize();
    // warm up so the first frame already shows varied uncertainty
    for (let i = 0; i < 400; i++) step(0.05);
    draw();

    window.addEventListener('resize', () => { resize(); draw(); });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readColors(); draw(); });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    new IntersectionObserver((entries) => {
        onScreen = entries[0].isIntersecting;
        onScreen ? start() : stop();
    }).observe(canvas);
    start();
})();

// Highlight the current section in the nav
(function () {
    const links = [...document.querySelectorAll('.nav a[href^="#"]')];
    const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            links.forEach(a => a.removeAttribute('aria-current'));
            const a = links.find(l => l.getAttribute('href') === '#' + e.target.id);
            if (a) a.setAttribute('aria-current', 'true');
        });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => io.observe(s));
})();
