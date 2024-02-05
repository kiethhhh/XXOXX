document.addEventListener('DOMContentLoaded', function () {
    const board = document.getElementById('board');
    const categoryDropdown = document.getElementById('category');
    const playersDropdown = document.getElementById('players');
    const resetButton = document.getElementById('resetButton'); // Add the reset button
    const scoreXElement = document.getElementById('scoreX'); // Add the X score element
    const scoreOElement = document.getElementById('scoreO'); // Add the O score element

    const sizeX = 5;
    const sizeY = 6;
    const winningScores = {
        'horizontal': 6,
        'vertical': 5,
        'diagonal': [2, 3, 4, 5],
    };
    let currentPlayer = 'X';
    let scores = {
        'X': 0,
        'O': 0
    };

    // Initialize the game
    createBoard();
    resetGame();

    function createBoard() {
        for (let i = 0; i < sizeY; i++) {
            for (let j = 0; j < sizeX; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', handleCellClick);
                board.appendChild(cell);
            }
        }
    }

    function resetGame() {
        resetBoard();
        resetScores();
    }

    function resetBoard() {
        const cells = document.querySelectorAll('.cell');
        for (const cell of cells) {
            cell.textContent = '';
        }
    }

    function resetScores() {
        scores['X'] = 0;
        scores['O'] = 0;
        updateScores();
    }

    function updateScores() {
        scoreXElement.textContent = scores['X'];
        scoreOElement.textContent = scores['O'];
    
        if (scores['X'] >= 5 || scores['O'] >= 5) {
            // Display separate messages for AI and human wins
            if (currentPlayer === 'X' && playersDropdown.value === 'AIvsHuman') {
                // Replace 'your-popup-image-congrats.jpg' with the actual path to the congratulatory image
                showPopup('your-popup-image-congrats.jpg');
            } else if (currentPlayer === 'O' && playersDropdown.value === 'AIvsHuman') {
                // Replace 'your-popup-image-ai-wins.jpg' with the actual path to the AI wins image
                showPopup('your-popup-image-ai-wins.jpg');
            } else {
                // Replace 'your-popup-image-player-wins.jpg' with the actual path to the player wins image
                showPopup('your-popup-image-player-wins.jpg');
            }
    
            resetGame();
        }
    }
    
    function handleCellClick(event) {
        const clickedCell = event.target;
        const row = clickedCell.dataset.row;
        const col = clickedCell.dataset.col;
    
        // Check if the cell is empty
        if (!clickedCell.textContent) {
            // Update the cell with the current player
            clickedCell.textContent = currentPlayer;
    
            // Check for a winner
            if (checkWinner(parseInt(row), parseInt(col))) {
                scores[currentPlayer]++;
                updateScores();
                resetBoard();
                // Display separate messages for AI and human wins
                if (currentPlayer === 'X' && playersDropdown.value === 'AIvsHuman') {
                    // Replace 'your-popup-image-congrats.jpg' with the actual path to the congratulatory image
                    showPopup('youwin.png');
                } else if (currentPlayer === 'O' && playersDropdown.value === 'AIvsHuman') {
                    // Replace 'your-popup-image-ai-wins.jpg' with the actual path to the AI wins image
                    showPopup('youlose.png');
                } else {
                    // Replace 'your-popup-image-player-wins.jpg' with the actual path to the player wins image
                    showPopup('your-popup-image-player-wins.jpg');
                }
            } else if (checkDraw()) {
                // Replace 'your-popup-image-draw.jpg' with the actual path to the draw image
                showPopup('draw.png');
                updateScores();
                resetBoard();
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    
                if (checkPoints(parseInt(row), parseInt(col))) {
                    return;
                }
    
                if (currentPlayer === 'O' && playersDropdown.value === 'AIvsHuman') {
                    setTimeout(makeAIMove, 500);
                }
            }
        }
    }

    function checkEdgeToEdge(row, col, rowDelta, colDelta, direction) {
        const player = currentPlayer;
        let count = 1; // Count the current cell

        // Check in one direction
        for (let i = 1; i < Math.max(sizeY, sizeX); i++) {
            const newRow = row + i * rowDelta;
            const newCol = col + i * colDelta;

            // Break if out of bounds or different player
            if (newRow < 0 || newRow >= sizeY || newCol < 0 || newCol >= sizeX || board.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`).textContent !== player) {
                break;
            }

            count++;
        }

        // Check in the opposite direction
        for (let i = 1; i < Math.max(sizeY, sizeX); i++) {
            const newRow = row - i * rowDelta;
            const newCol = col - i * colDelta;

            // Break if out of bounds or different player
            if (newRow < 0 || newRow >= sizeY || newCol < 0 || newCol >= sizeX || board.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`).textContent !== player) {
                break;
            }

            count++;
        }

        // Adjust the condition to consider edge-to-edge diagonals
        return count >= Math.min(sizeY, sizeX) - 1 && count <= Math.max(sizeY, sizeX) - 1;
    }

    function checkPoints(row, col) {
        const horizontalScore = checkEdgeToEdge(row, col, 1, 0, 'horizontal');
        const verticalScore = checkEdgeToEdge(row, col, 0, 1, 'vertical');
        const diagonalScore = checkEdgeToEdge(row, col, 1, 1, 'diagonal') || checkEdgeToEdge(row, col, 1, -1, 'diagonal');
    
        // Check if any score is achieved and the pattern is fully occupied
        if ((horizontalScore && isPatternOccupied(winningPatterns['horizontal'])) ||
            (verticalScore && isPatternOccupied(winningPatterns['vertical'])) ||
            (diagonalScore && isPatternOccupied(winningPatterns['diagonal']))) {
    
            if (currentPlayer === 'X') {
                scores['X']++;
                updateScores();
                // Replace 'your-popup-image-x.jpg' with the actual path to the 'X' popup image
                showPopup('xscore.png');
            } else if (currentPlayer === 'O') {
                scores['O']++;
                updateScores();
                // Replace 'your-popup-image-o.jpg' with the actual path to the 'O' popup image
                showPopup('oscore.png');
            }
    
            resetBoard();
            return true; // Return true if any score is achieved and the pattern is fully occupied
        }
    
        return false; // Return false if no score is achieved or the pattern is not fully occupied
    }
    function isPatternOccupied(pattern) {
        // Check if all cells in the pattern are occupied by the current player
        return pattern.every(index => {
            const rowIndex = Math.floor(index / sizeX);
            const colIndex = index % sizeX;
            const cell = board.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex}"]`);
            return cell.textContent === currentPlayer;
        });
    }

    function checkWinner(row, col) {
        for (const pattern of winningPatterns['horizontal']) {
            if (checkPattern(row, col, pattern)) {
                return true;
            }
        }

        for (const pattern of winningPatterns['vertical']) {
            if (checkPattern(row, col, pattern)) {
                return true;
            }
        }

        for (const pattern of winningPatterns['diagonal']) {
            if (checkPattern(row, col, pattern)) {
                return true;
            }
        }

        return false;
    }

    const winningPatterns = {
        'horizontal': [
            [0, 1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10, 11],
            [12, 13, 14, 15 ,16, 17],
            [18, 19, 20, 21, 22, 23],
            [24, 25, 26, 27, 28, 29],
        ],
        'vertical': [
            [0, 6, 12, 18, 24],
            [1, 7, 13, 19, 25],
            [2, 8, 14, 20, 26],
            [3, 9, 15, 21, 27],
            [4, 10, 16, 22, 28],
            [5, 11, 17, 23, 29],
        ],
        'diagonal': [
            [18, 25],
            [12, 19, 26],
            [6, 13, 20, 27],
            [0, 7, 14, 21, 28],
            [1, 8, 15, 22, 29],
            [2, 9, 16, 23],
            [3, 10, 17],
            [4, 11],
            [23, 28],
            [17, 22, 27],
            [11, 16, 21, 26],
            [5, 10, 15, 20, 25],
            [4, 9, 14, 19, 24],
            [3, 8, 13, 18],
            [2, 7, 12],
            [1, 6],
        ]
    };

    function checkPattern(row, col, pattern) {
        const player = currentPlayer;
        for (const index of pattern) {
            const rowIndex = Math.floor(index / sizeX);
            const colIndex = index % sizeX;

            // Check if the cell is out of bounds or belongs to a different player
            if (rowIndex < 0 || rowIndex >= sizeY || colIndex < 0 || colIndex >= sizeX || board.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex}"]`).textContent !== player) {
                return false;
            }
        }

        return true;
    }

    function checkDraw() {
        const cells = document.querySelectorAll('.cell');
        for (const cell of cells) {
            if (!cell.textContent) {
                return false; // If there is any empty cell, the game is not a draw
            }
        }
        return true; // All cells are filled, and no winner
    }
    function makeAIMove() {
        const emptyCells = document.querySelectorAll('.cell:not(.X):not(.O)');
        const difficulty = playersDropdown.value;
        const timeout = calculateTimeout(emptyCells.length);
    
        switch (difficulty) {
            case 'Easy':
                makeRandomMove(emptyCells);
                break;
    
            case 'Medium':
                makeSlightlySmartMove(emptyCells);
                break;
    
            case 'Hard':
                setTimeout(() => performAdvancedMove(emptyCells), timeout);
                break;
    
            default:
                makeRandomMove(emptyCells);
                break;
        }
    
        currentPlayer = 'X';
    }
    
    function calculateTimeout(emptyCellsCount) {
        // Adjust the formula based on your preferences
        const baseTimeout = 300;
        const maxTimeout = 1000;
    
        const timeout = Math.min(baseTimeout + (maxTimeout - baseTimeout) * (1 - emptyCellsCount / (sizeX * sizeY)), maxTimeout);
        return timeout;
    }
    
    
    
    
    
    

    function makeRandomMove(emptyCells) {
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const randomCell = emptyCells[randomIndex];
            simulateClick(randomCell);
        }
    }

    function makeSlightlySmartMove(emptyCells) {
        const winningMove = findWinningMove(emptyCells);
        if (winningMove) {
            simulateClick(winningMove);
        } else {
            makeRandomMove(emptyCells);
        }
    }

    function findWinningMove(emptyCells) {
        for (const cell of emptyCells) {
            cell.textContent = currentPlayer;

            if (checkWinner(parseInt(cell.dataset.row), parseInt(cell.dataset.col))) {
                cell.textContent = '';
                return cell;
            }

            cell.textContent = '';
        }

        return null;
    }

    async function makeAdvancedMove(emptyCells) {
        const winningMove = findWinningMove(emptyCells);
    
        if (winningMove) {
            simulateClick(winningMove);
        } else {
            const selectedCell = await getBestMove();
            if (selectedCell) {
                // Calculate the dynamic timeout based on the board's emptiness percentage
                const emptinessPercentage = getEmptinessPercentage();
                const dynamicTimeout = calculateTimeout(emptinessPercentage);
    
                // Wait for the dynamic timeout before making the move
                await new Promise(resolve => setTimeout(resolve, dynamicTimeout));
    
                await simulateClick(selectedCell);
            } else {
                makeSlightlySmartMove(emptyCells);
            }
        }
    }
    
    function getEmptinessPercentage() {
        const totalCells = sizeX * sizeY;
        const filledCells = document.querySelectorAll('.cell.X, .cell.O').length;
        return (totalCells - filledCells) / totalCells;
    }
    
    function calculateTimeout(emptinessPercentage) {
        const baseTimeout = 500; // Adjust the base timeout (in milliseconds) as needed
        const maxTimeout = 2000; // Adjust the max timeout (in milliseconds) as needed
    
        // Calculate the dynamic timeout based on the emptiness percentage
        const dynamicTimeout = baseTimeout + (maxTimeout - baseTimeout) * emptinessPercentage;
    
        return Math.min(dynamicTimeout, maxTimeout);
    }
    
    
    async function performAdvancedMove(emptyCells) {
        const selectedCell = await getBestMove();
    
        if (selectedCell) {
            await simulateClick(selectedCell);
        } else {
            makeSlightlySmartMove(emptyCells);
        }
    }
    
    
    

    // Function to get the best move using the advanced AI logic
    function getBestMove() {
        const currentPlayerCopy = currentPlayer;
        const boardCopy = createBoardCopy();

        // Call the advanced AI logic
        const bestMove = minmax(boardCopy, 0, currentPlayerCopy);

        if (bestMove) {
            const row = bestMove[0];
            const col = bestMove[1];
            const selectedCell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            return selectedCell;
        }

        return null;
    }

    // Function to create a deep copy of the current board state
    function createBoardCopy() {
        const cells = document.querySelectorAll('.cell');
        const boardCopy = [];

        for (const cell of cells) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = cell.textContent;

            if (!boardCopy[row]) {
                boardCopy[row] = [];
            }

            boardCopy[row][col] = value;
        }

        return boardCopy;
    }

    function simulateClick(cell) {
        const event = new Event('click');
        cell.dispatchEvent(event);
    }

    // Update the current player to switch back to the human player
    currentPlayer = 'X';

    function showPopup(imagePath) {
        const popup = document.createElement('div');
        popup.classList.add('popup');
    
        const image = document.createElement('img');
        image.src = imagePath;
    
        popup.appendChild(image);
        document.body.appendChild(popup);
    
        // Center the popup in the viewport
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.display = 'block';
    
        // Set a timeout of 2000 milliseconds (2 seconds) to hide the popup
        setTimeout(() => hidePopup(popup), 2000);
    }
    
    
    
    
    
    function hidePopup(popup) {
        document.body.removeChild(popup);
    }
    
    // Event listener for changing settings or difficulties
    categoryDropdown.addEventListener('change', function () {
        resetGame();
    });

    playersDropdown.addEventListener('change', function () {
        resetGame();
    });

    // Event listener for the reset button
    resetButton.addEventListener('click', function () {
        resetGame();
    });
});
