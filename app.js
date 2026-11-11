'use strict';
/* Algorithm Lab — zero-dependency demos. */
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (id) => document.getElementById(id);

/* ---------- Tabs ---------- */
document.querySelectorAll('[data-tab]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-tab]').forEach((b) => {
      const on = b === btn;
      b.setAttribute('aria-selected', String(on));
      $(b.dataset.tab).hidden = !on;
    });
    if (btn.dataset.tab !== 'life') Life.pause();
  });
});

/* ---------- Sorting visualizer ---------- */
const Sort = (() => {
  const cv = $('sortCanvas'), ctx = cv.getContext('2d');
  let arr = [], running = false, cmp = 0, writes = 0, hi = new Set();

  const shuffle = () => {
    const n = Number($('sortSize').value);
    arr = Array.from({ length: n }, (_, i) => (i + 1) / n);
    for (let i = n - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [arr[i], arr[j]] = [arr[j], arr[i]]; }
    cmp = writes = 0; hi.clear(); draw();
  };
  const draw = (done = false) => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    const w = cv.width / arr.length;
    arr.forEach((v, i) => {
      ctx.fillStyle = done ? css('--accent') : hi.has(i) ? css('--hot') : css('--ink');
      ctx.fillRect(i * w + 1, cv.height - v * (cv.height - 10), Math.max(1, w - 2), v * (cv.height - 10));
    });
    $('sortStats').textContent = `Comparisons: ${cmp} · Writes: ${writes}`;
  };
  const delay = () => sleep(101 - Number($('sortSpeed').value));
  const tick = async (...idx) => { hi = new Set(idx); draw(); await delay(); };
  const less = async (i, j) => { cmp++; await tick(i, j); return arr[i] < arr[j]; };
  const set = async (i, v) => { writes++; arr[i] = v; await tick(i); };
  const swap = async (i, j) => { writes += 2; [arr[i], arr[j]] = [arr[j], arr[i]]; await tick(i, j); };

  const algos = {
    async bubble() {
      for (let i = 0; i < arr.length; i++) {
        let swapped = false;
        for (let j = 0; j < arr.length - i - 1; j++) if (await less(j + 1, j)) { await swap(j, j + 1); swapped = true; }
        if (!swapped) break;
      }
    },
    async insertion() {
      for (let i = 1; i < arr.length; i++) for (let j = i; j > 0 && await less(j, j - 1); j--) await swap(j, j - 1);
    },
    async merge(lo = 0, hiI = arr.length) {
      if (hiI - lo < 2) return;
      const mid = (lo + hiI) >> 1;
      await algos.merge(lo, mid); await algos.merge(mid, hiI);
      const tmp = []; let i = lo, j = mid;
      while (i < mid && j < hiI) { cmp++; tmp.push(arr[i] <= arr[j] ? arr[i++] : arr[j++]); }
      while (i < mid) tmp.push(arr[i++]);
      while (j < hiI) tmp.push(arr[j++]);
      for (let k = 0; k < tmp.length; k++) await set(lo + k, tmp[k]);
    },
    async quick(lo = 0, hiI = arr.length - 1) {
      if (lo >= hiI) return;
      let i = lo;
      for (let j = lo; j < hiI; j++) if (await less(j, hiI)) { await swap(i, j); i++; }
      await swap(i, hiI);
      await algos.quick(lo, i - 1); await algos.quick(i + 1, hiI);
    },
  };

  const lock = (on) => ['sortRun', 'sortShuffle', 'sortAlgo', 'sortSize'].forEach((id) => { $(id).disabled = on; });
  $('sortShuffle').addEventListener('click', shuffle);
  $('sortSize').addEventListener('input', shuffle);
  $('sortRun').addEventListener('click', async () => {
    if (running) return;
    running = true; lock(true); cmp = writes = 0;
    await algos[$('sortAlgo').value]();
    hi.clear(); draw(true); running = false; lock(false);
  });
  shuffle();
  return { draw };
})();

/* ---------- A* pathfinder ---------- */
const Path = (() => {
  const cv = $('pathCanvas'), ctx = cv.getContext('2d');
  const C = 24, R = 12, S = cv.width / C;
  const start = [0, 0], goal = [R - 1, C - 1];
  let walls, visited, path, painting = null, busy = false;

  const reset = (keepWalls) => {
    if (!keepWalls) walls = Array.from({ length: R }, () => Array(C).fill(0));
    visited = new Set(); path = [];
    $('pathStats').textContent = 'Start: top-left · Goal: bottom-right'; draw();
  };
  const key = (r, c) => r * C + c;
  const draw = () => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    const onPath = new Set(path.map(([r, c]) => key(r, c)));
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const k = key(r, c);
      let fill = null;
      if (walls[r][c]) fill = css('--wall');
      else if (onPath.has(k)) fill = css('--hot');
      else if (visited.has(k)) fill = css('--accent') + '33';
      if (fill) { ctx.fillStyle = fill; ctx.fillRect(c * S, r * S, S, S); }
      ctx.strokeStyle = css('--line'); ctx.strokeRect(c * S + .5, r * S + .5, S - 1, S - 1);
    }
    [[start, css('--accent')], [goal, css('--hot')]].forEach(([[r, c], col]) => {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(c * S + S / 2, r * S + S / 2, S / 3, 0, 7); ctx.fill();
    });
  };
  const cellAt = (e) => {
    const b = cv.getBoundingClientRect();
    const c = Math.floor(((e.clientX - b.left) / b.width) * C), r = Math.floor(((e.clientY - b.top) / b.height) * R);
    return r >= 0 && r < R && c >= 0 && c < C ? [r, c] : null;
  };
  const isEnd = (r, c) => (r === start[0] && c === start[1]) || (r === goal[0] && c === goal[1]);
  cv.addEventListener('pointerdown', (e) => {
    if (busy) return; const p = cellAt(e); if (!p || isEnd(...p)) return;
    painting = walls[p[0]][p[1]] ? 0 : 1; walls[p[0]][p[1]] = painting; visited.clear(); path = []; draw();
  });
  cv.addEventListener('pointermove', (e) => {
    if (painting === null || busy) return; const p = cellAt(e);
    if (p && !isEnd(...p)) { walls[p[0]][p[1]] = painting; draw(); }
  });
  window.addEventListener('pointerup', () => { painting = null; });

  async function run() {
    busy = true; visited = new Set(); path = [];
    const h = ([r, c]) => Math.abs(r - goal[0]) + Math.abs(c - goal[1]);
    const g = new Map([[key(...start), 0]]), from = new Map();
    let open = [[h(start), 0, start]];
    while (open.length) {
      open.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
      const [, cost, cur] = open.shift(); const ck = key(...cur);
      if (cost > g.get(ck)) continue;
      visited.add(ck);
      if (cur[0] === goal[0] && cur[1] === goal[1]) {
        let k = ck; path = [cur];
        while (from.has(k)) { const p = from.get(k); path.unshift(p); k = key(...p); }
        draw(); $('pathStats').textContent = `Path length: ${path.length - 1} · Cells explored: ${visited.size}`;
        busy = false; return;
      }
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = [cur[0] + dr, cur[1] + dc];
        if (n[0] < 0 || n[0] >= R || n[1] < 0 || n[1] >= C || walls[n[0]][n[1]]) continue;
        const nk = key(...n);
        if (cost + 1 < (g.get(nk) ?? Infinity)) { g.set(nk, cost + 1); from.set(nk, cur); open.push([cost + 1 + h(n), cost + 1, n]); }
      }
      draw(); await sleep(12);
    }
    $('pathStats').textContent = `No path exists · Cells explored: ${visited.size}`; busy = false;
  }
  $('pathRun').addEventListener('click', () => { if (!busy) run(); });
  $('pathClear').addEventListener('click', () => { if (!busy) reset(false); });
  $('pathMaze').addEventListener('click', () => {
    if (busy) return;
    walls = Array.from({ length: R }, (_, r) => Array.from({ length: C }, (_, c) => (!isEnd(r, c) && Math.random() < 0.28 ? 1 : 0)));
    reset(true);
  });
  reset(false);
  return { draw };
})();

/* ---------- Game of Life ---------- */
const Life = (() => {
  const cv = $('lifeCanvas'), ctx = cv.getContext('2d');
  const C = 80, R = 40, S = cv.width / C;
  let grid = Array.from({ length: R }, () => Array(C).fill(0)), gen = 0, timer = null;

  const draw = () => {
    ctx.clearRect(0, 0, cv.width, cv.height); ctx.fillStyle = css('--accent'); let alive = 0;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid[r][c]) { alive++; ctx.fillRect(c * S + 1, r * S + 1, S - 2, S - 2); }
    $('lifeStats').textContent = `Generation ${gen} · Alive ${alive}`;
  };
  const step = () => {
    grid = grid.map((row, r) => row.map((v, c) => {
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++)
        if (dr || dc) n += grid[(r + dr + R) % R][(c + dc + C) % C];
      return n === 3 || (v && n === 2) ? 1 : 0;
    }));
    gen++; draw();
  };
  const pause = () => { clearInterval(timer); timer = null; $('lifeToggle').textContent = 'Play'; };
  const load = (cells) => { pause(); grid = Array.from({ length: R }, () => Array(C).fill(0)); gen = 0; cells.forEach(([r, c]) => { grid[r][c] = 1; }); draw(); };

  // Gosper glider gun
  const GUN = [[5,1],[5,2],[6,1],[6,2],[5,11],[6,11],[7,11],[4,12],[8,12],[3,13],[9,13],[3,14],[9,14],[6,15],[4,16],[8,16],
    [5,17],[6,17],[7,17],[6,18],[3,21],[4,21],[5,21],[3,22],[4,22],[5,22],[2,23],[6,23],[1,25],[2,25],[6,25],[7,25],[3,35],[4,35],[3,36],[4,36]];

  $('lifeToggle').addEventListener('click', () => {
    if (timer) pause(); else { timer = setInterval(step, 80); $('lifeToggle').textContent = 'Pause'; }
  });
  $('lifeStep').addEventListener('click', () => { pause(); step(); });
  $('lifeGlider').addEventListener('click', () => load(GUN.map(([r, c]) => [r + 2, c + 2])));
  $('lifeRandom').addEventListener('click', () => {
    const cells = []; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (Math.random() < 0.25) cells.push([r, c]); load(cells);
  });
  cv.addEventListener('click', (e) => {
    const b = cv.getBoundingClientRect();
    const c = Math.floor(((e.clientX - b.left) / b.width) * C), r = Math.floor(((e.clientY - b.top) / b.height) * R);
    if (r >= 0 && r < R && c >= 0 && c < C) { grid[r][c] ^= 1; draw(); }
  });
  load(GUN.map(([r, c]) => [r + 2, c + 2]));
  return { pause, draw };
})();

/* Redraw on theme change */
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { Sort.draw(); Path.draw(); Life.draw(); });
