"""Conway's Game of Life — one generation on a toroidal (wrap-around) grid."""
from typing import List


def life_step(grid: List[List[int]]) -> List[List[int]]:
    rows, cols = len(grid), len(grid[0]) if grid else 0
    nxt = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            n = sum(grid[(r + dr) % rows][(c + dc) % cols]
                    for dr in (-1, 0, 1) for dc in (-1, 0, 1) if dr or dc)
            nxt[r][c] = 1 if n == 3 or (grid[r][c] and n == 2) else 0
    return nxt
