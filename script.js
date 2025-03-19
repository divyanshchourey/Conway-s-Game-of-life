document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth-30;
    canvas.height = window.innerHeight-50;
    
    const startBtn = document.getElementById('start');
    const stopBtn = document.getElementById('stop');
    const resetBtn = document.getElementById('reset');
    const randomBtn = document.getElementById('random');
    const speedSlider = document.getElementById('speed');
    
    const cellSize = 10;
    const rows = Math.floor(canvas.height / cellSize);
    const cols = Math.floor(canvas.width / cellSize);
    let grid = createEmptyGrid();
    let animationId = null;
    let speed = 1000 / speedSlider.value;
    let lastUpdateTime = 0;
    let state = "stop";
    
    function createEmptyGrid() {
        return Array(rows).fill().map(() => Array(cols).fill(0));
    }
    
    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (grid[i][j] === 1) {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                }
            }
        }
        
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.2;
        
        for (let i = 0; i <= rows; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvas.width, i * cellSize);
            ctx.stroke();
        }
        
        for (let j = 0; j <= cols; j++) {
            ctx.beginPath();
            ctx.moveTo(j * cellSize, 0);
            ctx.lineTo(j * cellSize, canvas.height);
            ctx.stroke();
        }
    }
    
    function countNeighbors(grid, x, y) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const newX = x + i;
                const newY = y + j;
                
                if (newX >= 0 && newX < rows && newY >= 0 && newY < cols) {
                    count += grid[newX][newY];
                }
            }
        }
        return count;
    }
    
    function updateGrid() {
        const newGrid = createEmptyGrid();
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const neighbors = countNeighbors(grid, i, j);
                
                if (grid[i][j] === 1 && (neighbors < 2 || neighbors > 3)) {
                    newGrid[i][j] = 0; // Cell dies
                } else if (grid[i][j] === 1 && (neighbors === 2 || neighbors === 3)) {
                    newGrid[i][j] = 1; // Cell survives
                } else if (grid[i][j] === 0 && neighbors === 3) {
                    newGrid[i][j] = 1; // Cell becomes alive
                }
            }
        }
        
        grid = newGrid;
    }
    
    function animate(timestamp) {
        if (!lastUpdateTime) lastUpdateTime = timestamp;
        
        const elapsed = timestamp - lastUpdateTime;
        
        if (elapsed > speed) {
            updateGrid();
            drawGrid();
            lastUpdateTime = timestamp;
        }
        
        animationId = requestAnimationFrame(animate);
    }
    
    function startGame() {
        if (!animationId) {
            lastUpdateTime = 0;
            animationId = requestAnimationFrame(animate);
            startBtn.disabled = true;
            stopBtn.disabled = false;
        }
    }
    
    function stopGame() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    }
    
    function resetGame() {
        stopGame();
        grid = createEmptyGrid();
        drawGrid();
    }
    
    function randomize() {
        stopGame();
        grid = createEmptyGrid();
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                grid[i][j] = Math.random() > 0.7 ? 1 : 0;
            }
        }
        
        drawGrid();
    }
    
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const row = Math.floor(y / cellSize);
        const col = Math.floor(x / cellSize);
        
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
            grid[row][col] = grid[row][col] ? 0 : 1;
            drawGrid();
        }
    });

    document.addEventListener('keydown', function(event){
        if (event.code === 'Space' || event.key === ' ') {
            event.preventDefault();
            console.log('Spacebar was pressed!');
            if(state === "stop"){
                 startGame();
                 state = "start";
            }
            else if(state === "start"){
                stopGame();
                state = "stop";
            }
          }
    });
    
    speedSlider.addEventListener('input', () => {
        speed = 1000 / speedSlider.value;
    });
    
    startBtn.addEventListener('click', startGame);
    stopBtn.addEventListener('click', stopGame);
    resetBtn.addEventListener('click', resetGame);
    randomBtn.addEventListener('click', randomize);
    
    drawGrid();
    
    function addGlider() {
        const r = 10;
        const c = 10;
        grid[r][c+1] = 1;
        grid[r+1][c+2] = 1;
        grid[r+2][c] = 1;
        grid[r+2][c+1] = 1;
        grid[r+2][c+2] = 1;
        drawGrid();
    }
    
    setTimeout(addGlider, 100);
});