import random
import pytest
from toolkit import bubble_sort, insertion_sort, merge_sort, quick_sort, astar, life_step

SORTS = [bubble_sort, insertion_sort, merge_sort, quick_sort]


@pytest.mark.parametrize("fn", SORTS)
@pytest.mark.parametrize("data", [[], [1], [2, 1], [3, 3, 1], list(range(10, 0, -1))])
def test_sort_edge_cases(fn, data):
    assert fn(data) == sorted(data)


@pytest.mark.parametrize("fn", SORTS)
def test_sort_random_and_no_mutation(fn):
    rng = random.Random(42)
    for _ in range(50):
        data = [rng.randint(-100, 100) for _ in range(rng.randint(0, 60))]
        copy = list(data)
        assert fn(data) == sorted(data)
        assert data == copy


def test_astar_straight_line():
    grid = [[0] * 5]
    assert astar(grid, (0, 0), (0, 4)) == [(0, i) for i in range(5)]


def test_astar_around_wall():
    grid = [[0, 1, 0],
            [0, 1, 0],
            [0, 0, 0]]
    path = astar(grid, (0, 0), (0, 2))
    assert path[0] == (0, 0) and path[-1] == (0, 2)
    assert len(path) == 7


def test_astar_blocked():
    grid = [[0, 1, 0]]
    assert astar(grid, (0, 0), (0, 2)) is None


def test_astar_start_on_wall():
    assert astar([[1, 0]], (0, 0), (0, 1)) is None


def test_life_blinker_oscillates():
    g = [[0] * 5 for _ in range(5)]
    for c in (1, 2, 3):
        g[2][c] = 1
    g1 = life_step(g)
    assert [g1[r][2] for r in (1, 2, 3)] == [1, 1, 1]
    assert sum(map(sum, g1)) == 3
    assert life_step(g1) == g


def test_life_block_is_still():
    g = [[0] * 4 for _ in range(4)]
    for r, c in ((1, 1), (1, 2), (2, 1), (2, 2)):
        g[r][c] = 1
    assert life_step(g) == g
