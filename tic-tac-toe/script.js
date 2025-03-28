const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // 橫向
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // 縱向
    [0, 4, 8], [2, 4, 6]            // 對角線
];

// 選擇DOM元素
const cellElements = document.querySelectorAll('[data-cell]');
const board = document.getElementById('board');
const winningMessageElement = document.getElementById('winningMessage');
const restartButton = document.getElementById('restart-button');
const winningMessageTextElement = document.querySelector('[data-winning-message-text]');
const restartButtonInMessage = document.getElementById('restartButton');
const playerScoreElement = document.getElementById('player-score');
const drawScoreElement = document.getElementById('draw-score');
const computerScoreElement = document.getElementById('computer-score');
const messageElement = document.getElementById('message');

// 遊戲狀態變數
let playerScore = 0;
let drawScore = 0;
let computerScore = 0;
let gameActive = true;
let currentBoard = Array(9).fill(null);

// 啟動遊戲
startGame();

// 重新開始按鈕事件監聽器
restartButton.addEventListener('click', startGame);
restartButtonInMessage.addEventListener('click', startGame);

function startGame() {
    gameActive = true;
    currentBoard = Array(9).fill(null);
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    winningMessageElement.classList.remove('show');
    messageElement.textContent = "輪到你了！";
}

function handleClick(e) {
    if (!gameActive) return;
    
    const cell = e.target;
    const cellIndex = Array.from(cellElements).indexOf(cell);
    
    // 玩家回合
    if (currentBoard[cellIndex] !== null) return; // 如果格子已被佔用，則直接返回
    
    // 更新遊戲狀態
    placeMark(cell, X_CLASS);
    currentBoard[cellIndex] = X_CLASS;
    
    // 檢查遊戲結果
    if (checkWin(X_CLASS)) {
        endGame(false);
        playerScore++;
        playerScoreElement.textContent = playerScore;
        return;
    } else if (isDraw()) {
        endGame(true);
        drawScore++;
        drawScoreElement.textContent = drawScore;
        return;
    }
    
    // 電腦回合
    messageElement.textContent = "電腦思考中...";
    setTimeout(() => {
        const bestMove = findBestMove();
        if (bestMove !== -1) {
            const computerCell = cellElements[bestMove];
            placeMark(computerCell, O_CLASS);
            currentBoard[bestMove] = O_CLASS;
            
            if (checkWin(O_CLASS)) {
                endGame(false, true);
                computerScore++;
                computerScoreElement.textContent = computerScore;
            } else if (isDraw()) {
                endGame(true);
                drawScore++;
                drawScoreElement.textContent = drawScore;
            } else {
                messageElement.textContent = "輪到你了！";
            }
        }
    }, 500); // 增加一點延遲，讓電腦"思考"
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return currentBoard[index] === currentClass;
        });
    });
}

function isDraw() {
    return currentBoard.every(cell => cell !== null);
}

function endGame(draw, isComputer = false) {
    gameActive = false;
    
    if (draw) {
        winningMessageTextElement.textContent = '平局！';
        messageElement.textContent = '平局！';
    } else {
        if (isComputer) {
            winningMessageTextElement.textContent = '電腦贏了！';
            messageElement.textContent = '電腦贏了！';
        } else {
            winningMessageTextElement.textContent = '你贏了！';
            messageElement.textContent = '你贏了！';
        }
    }
    
    winningMessageElement.classList.add('show');
}

// AI部分 - 使用極小化極大演算法（Minimax Algorithm）
function findBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;
    let availableMoves = [];
    
    // 收集所有可行的動作
    for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
            availableMoves.push(i);
        }
    }
    
    // 如果有可行動作，則選擇一個最佳動作
    if (availableMoves.length > 0) {
        // 電腦第一步時隨機下，增加遊戲樂趣
        if (availableMoves.length >= 8) {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
        
        // 否則使用Minimax演算法尋找最佳動作
        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === null) {
                currentBoard[i] = O_CLASS;
                let score = minimax(currentBoard, 0, false);
                currentBoard[i] = null;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
    }
    
    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    // 終止條件：檢查是否有人贏了或平局
    if (checkWinWithBoard(board, O_CLASS)) return 1;
    if (checkWinWithBoard(board, X_CLASS)) return -1;
    if (isDrawWithBoard(board)) return 0;
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = O_CLASS;
                let score = minimax(board, depth + 1, false);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = X_CLASS;
                let score = minimax(board, depth + 1, true);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinWithBoard(board, currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return board[index] === currentClass;
        });
    });
}

function isDrawWithBoard(board) {
    return board.every(cell => cell !== null);
}
