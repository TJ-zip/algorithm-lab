# Algorithm Lab

An interactive, **zero-dependency** algorithm playground built end-to-end by Microsoft Copilot — plus a tested Python twin of every algorithm and CI on every push.

## What's inside

| Demo | What it shows |
|---|---|
| **Sorting visualizer** | Bubble, insertion, merge and quick sort animated live, with comparison and write counters |
| **A\* pathfinder** | Draw walls with your mouse or finger, then watch A\* (Manhattan heuristic) explore and find the shortest path |
| **Game of Life** | Conway's cellular automaton on a wrap-around grid, preloaded with the Gosper glider gun |

Light and dark themes follow your system. Works on mobile. No frameworks, no build step.

## Run it

Open `index.html` in a browser — that's it.

Or deploy as a static site: import this repo on **Vercel** (framework preset: *Other*, no build command) or enable **GitHub Pages** from `main` / root.

## Python toolkit

`toolkit/` mirrors the browser algorithms in clean, typed Python:

```python
from toolkit import merge_sort, astar, life_step

merge_sort([5, 2, 9, 1])                       # [1, 2, 5, 9]
astar([[0, 1, 0], [0, 0, 0]], (0, 0), (0, 2))  # [(0,0), (1,0), (1,1), (1,2), (0,2)]
```

Run the tests:

```bash
pip install pytest
pytest -q
```

## Project layout

```
index.html  style.css  app.js     # browser lab
toolkit/                          # sorting, A*, Game of Life (Python)
tests/                            # 30 pytest cases
.github/workflows/ci.yml          # pytest + JS syntax check
```

## License

MIT
