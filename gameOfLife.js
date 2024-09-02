
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playButton = document.getElementById('playButton');
const clearButton = document.getElementById('clearButton');
const randomButton = document.getElementById('randomButton');
const speedSlider = document.getElementById('speedSlider');
const rewindSlider = document.getElementById('rewindSlider');
const darkModeBtn = document.getElementById('darkModeButton');


const cellSize = 12;
const rows = 50;
const cols = 50;
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let grid = createGrid(rows, cols);
let isPaused = true;
let interval = getInterval();
let lastTime = 0;
let generation = 0;

//document.body.classList.add('dark-mode');
let aliveColor = '#000';
let deadColor = '#FFF';
ctx.strokeStyle = deadColor;

let history = [];
const maxHistory = 1000;


function createGrid(rows, cols) {
    return Array.from({ length: rows }, () => new Array(cols).fill(0));
}

function drawGrid(grid) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 0.25;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.beginPath();
            ctx.rect(col * cellSize, row * cellSize, cellSize, cellSize);
            ctx.fillStyle = grid[row][col] ? aliveColor : deadColor;
            ctx.fill();
            ctx.stroke();
        }
    }

    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';

    // Calculate position for the text (bottom right corner)
    const textX = canvas.width - 10; // 10 pixels from the right edge
    const textY = canvas.height - 10; // 10 pixels from the bottom edge

    // Draw the generation text
    ctx.fillStyle = aliveColor; // Use the aliveColor for the text color
    ctx.fillText(`Gen: ${generation}`, textX, textY);
}


function getNextGeneration(grid) {
    const newGrid = createGrid(rows, cols);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const neighbors = countNeighborsWithWrap(grid, row, col);
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

function countNeighborsWithWrap(grid, x, y) {
    let neighbors = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const row = (x + i + rows) % rows;
            const col = (y + j + cols) % cols;
            neighbors += grid[row][col];
        }
    }
    return neighbors;
}

function pauseGame() {
    if (!isPaused) {
        togglePlayPause();
        isPaused = true;
    }
}

function startGame() {
    isPaused = false;
}


function update(timestamp) {
    if (!isPaused) {
        if (timestamp - lastTime >= interval) {
            if (history.length >= maxHistory) {
                history.shift();
            }

            history.push(grid.map(row => [...row])); // Store a deep copy of the grid
            
            grid = getNextGeneration(grid);

            generation++;

            drawGrid(grid);
            lastTime = timestamp;

            rewindSlider.max = generation;
            rewindSlider.value = generation;
        }
    }
    requestAnimationFrame(update);
}

// Randomizes the whole grid
function randomizeGrid() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            grid[row][col] = Math.random() < 0.3 ? 1 : 0;
        }
    }
}

function addRandomPattern(len, height, x, y) {
    for (let i = 0; i <= len; i++) {
        for (let j = 0; j <= height; j++) {
            grid[x + i][y + j] = Math.random() < 0.5 ? 1 : 0;
        }
    }
}

function clearGrid() {
    grid = createGrid(rows, cols);
    drawGrid(grid);
    generation = 0;
    history = [];
    rewindSlider.max = generation;
    rewindSlider.value = generation;
}

function getInterval() {
    return 1000 - parseInt(speedSlider.value, 10);
}

function togglePlayPause() {
    const icon = playButton.querySelector('i');
    if (icon.classList.contains('fa-play')) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
        isPaused = false;
    } else {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
        isPaused = true;
        history.push(grid.map(row => [...row]));
    }
}

playButton.addEventListener('click', () => {
    togglePlayPause();
});

clearButton.addEventListener('click', () => {
    clearGrid();
    pauseGame();
});

randomButton.addEventListener('click', () => {
    const randomPatternSize = 5;
    addRandomPattern(randomPatternSize, randomPatternSize, 
    Math.floor((rows - randomPatternSize) / 2), 
    Math.floor((cols - randomPatternSize) / 2));
    drawGrid(grid);
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
    generation = parseInt(event.target.value, 10);
    grid = history[generation - Math.max(0, generation - maxHistory)];
    drawGrid(grid);
});


darkModeBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        aliveColor = '#FFF';
        deadColor = '#000';
        darkModeBtn.textContent = 'Light Mode';
    }
    else {
        aliveColor = '#000';
        deadColor = '#FFF';
        darkModeBtn.textContent = 'Dark Mode';
    }


    // TODO: Get this working
    // if (document.body.classList.contains('dark-mode')) {
    //     localStorage.setItem('mode', 'dark');
    // } else {
    //     localStorage.setItem('mode', 'light');
    // }

    // darkModeBtn.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';

    // aliveColor = aliveColor === '#FFF' ? '#000' : '#FFF';
    // deadColor = deadColor === '#000' ? '#FFF' : '#000';
    ctx.strokeStyle = deadColor;

    drawGrid(grid);
});

// window.addEventListener('load', function() {
//     if (localStorage.getItem('mode') === 'dark') {
//         document.body.classList.add('dark-mode');
//     }
// });


const randomPatternSize = 5;
addRandomPattern(randomPatternSize, randomPatternSize, 
    Math.floor((rows - randomPatternSize) / 2), 
    Math.floor((cols - randomPatternSize) / 2));
drawGrid(grid);
requestAnimationFrame(update);
