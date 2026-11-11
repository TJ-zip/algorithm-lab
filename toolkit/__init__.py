"""Small, dependency-free algorithms toolkit mirroring the browser lab."""
from .sorting import bubble_sort, insertion_sort, merge_sort, quick_sort
from .pathfinding import astar
from .life import life_step

__all__ = ["bubble_sort", "insertion_sort", "merge_sort", "quick_sort", "astar", "life_step"]
