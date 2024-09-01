
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const pauseButton = document.getElementById('pauseButton');
const speedSlider = document.getElementById('speedSlider');
const generationCounter = document.getElementById('generationCounter');


const cellSize = 10;
const rows = 50;
const cols = 50;
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let grid = createGrid(rows, cols);
let isPaused = true;
let interval = getInterval();
let lastTime = 0;
let generation = 0;

let history = [];
const maxHistory = 1000;


function createGrid(rows, cols) {
    return Array.from({ length: rows }, () => new Array(cols).fill(0));
}

function drawGrid(grid) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.beginPath();
            ctx.rect(col * cellSize, row * cellSize, cellSize, cellSize);
            ctx.fillStyle = grid[row][col] ? '#FFF' : '#000';
            ctx.fill();
            ctx.stroke();
        }
    }
}


function getNextGeneration(grid) {
    const newGrid = createGrid(rows, cols);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const neighbors = countNeighbors(grid, row, col);
            const cell = grid[row][col];

            if (cell === 1 && (neighbors < 2 || neighbors > 3)) {
                newGrid[row][col] = 0; // Cell dies
            } else if (cell === 0 && neighbors === 3) {
                newGrid[row][col] = 1; // Cell is born
            } else {
                newGrid[row][col] = cell; // Cell stays the same
            }
        }
    }
    return newGrid;
}

function countNeighbors(grid, x, y) {
    let neighbors = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const row = x + i;
            const col = y + j;
            if (row >= 0 && row < rows && col >= 0 && col < cols) {
                neighbors += grid[row][col];
            }
        }
    }
    return neighbors;
}

function pauseGame() {
    isPaused = true;
    pauseButton.textContent = 'Start';
}

function startGame() {
    isPaused = false;
    pauseButton.textContent = 'Pause';
}


function update(timestamp) {
    if (!isPaused) {
        if (timestamp - lastTime >= interval) {
            if (history.length >= maxHistory) {
                history.shift();
            }
            grid = getNextGeneration(grid);

            history.push(grid.map(row => [...row])); // Store a deep copy of the grid

            drawGrid(grid);
            generation++;
            generationCounter.textContent = `Generations: ${generation}`;
            lastTime = timestamp;

            rewindSlider.max = generation;
            rewindSlider.value = generation;
        }
    }
    requestAnimationFrame(update);
}

// Initialize with a random pattern
function randomizeGrid() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            grid[row][col] = Math.random() < 0.3 ? 1 : 0;
        }
    }

}

function getInterval() {
    return 1000 - parseInt(speedSlider.value, 10);
}

pauseButton.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? 'Start' : 'Pause';
});

speedSlider.addEventListener('input', () => {
    interval = getInterval();
});


canvas.addEventListener('click', (event) => {
    const x = Math.floor(event.offsetX / cellSize);
    const y = Math.floor(event.offsetY / cellSize);
    grid[y][x] = grid[y][x] ? 0 : 1;
    drawGrid(grid);
});

rewindSlider.addEventListener('input', (event) => {
    pauseGame();
    const gen = parseInt(event.target.value, 10);
    grid = history[gen - Math.max(0, generation - maxHistory)];
    drawGrid(grid);
    generationCounter.textContent = `Generations: ${gen}`;
});

randomizeGrid();
drawGrid(grid);
history.push(grid.map(row => [...row]))
requestAnimationFrame(update);