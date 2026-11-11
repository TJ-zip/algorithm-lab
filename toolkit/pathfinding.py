"""A* shortest path on a 4-connected grid (0 = open, 1 = wall)."""
import heapq
from typing import List, Optional, Tuple

Cell = Tuple[int, int]


def astar(grid: List[List[int]], start: Cell, goal: Cell) -> Optional[List[Cell]]:
    rows, cols = len(grid), len(grid[0]) if grid else 0

    def ok(r: int, c: int) -> bool:
        return 0 <= r < rows and 0 <= c < cols and grid[r][c] == 0

    if not (ok(*start) and ok(*goal)):
        return None

    def h(p: Cell) -> int:
        return abs(p[0] - goal[0]) + abs(p[1] - goal[1])

    open_heap = [(h(start), 0, start)]
    came_from = {}
    g = {start: 0}
    while open_heap:
        _, cost, cur = heapq.heappop(open_heap)
        if cur == goal:
            path = [cur]
            while cur in came_from:
                cur = came_from[cur]
                path.append(cur)
            return path[::-1]
        if cost > g[cur]:
            continue
        r, c = cur
        for nb in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if ok(*nb) and cost + 1 < g.get(nb, float("inf")):
                g[nb] = cost + 1
                came_from[nb] = cur
                heapq.heappush(open_heap, (cost + 1 + h(nb), cost + 1, nb))
    return None
