(() => {
    const boardEl = document.getElementById('board');
    const cells = Array.from(document.querySelectorAll('.cell'));
    const statusText = document.getElementById('status-text');
    const statusBar = document.querySelector('.status-bar');
    const winLine = document.getElementById('win-line');
    const winLineSvg = winLine.querySelector('line');
    const restartBtn = document.getElementById('restart-btn');
    const modal = document.getElementById('result-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalIcon = document.getElementById('modal-icon');
    const modalBtn = document.getElementById('modal-btn');
    const scoreXEl = document.getElementById('score-x');
    const scoreOEl = document.getElementById('score-o');
    const scoreDrawEl = document.getElementById('score-draw');
    const modeSwitch = document.getElementById('mode-switch');
    const modeBtns = Array.from(document.querySelectorAll('.mode-btn'));
    const subtitle = document.getElementById('subtitle');

    const PLAYER_X = 'X';
    const PLAYER_O = 'O';

    let gameBoard = Array(9).fill('');
    let gameActive = true;
    let currentPlayer = PLAYER_X;
    let currentMode = 'pve'; // 'pve' | 'pvp' | 'aivsai'
    let scores = { X: 0, O: 0, draw: 0 };
    let aiTimer = null;

    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const xSvg = `
        <svg class="mark mark-x" viewBox="0 0 100 100">
            <path d="M25 25 L75 75 M75 25 L25 75" />
        </svg>`;
    const oSvg = `
        <svg class="mark mark-o" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="35" />
        </svg>`;

    function init() {
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });
        restartBtn.addEventListener('click', resetGame);
        modalBtn.addEventListener('click', resetGame);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) resetGame();
        });
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => setMode(btn.dataset.mode));
        });
        updateStatus(getTurnText(), 'x');
    }

    function setMode(mode) {
        clearTimeout(aiTimer);
        aiTimer = null;
        if (currentMode === mode) return;
        currentMode = mode;
        modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        if (mode === 'pve') subtitle.textContent = '不可战胜的 AI 对手';
        else if (mode === 'pvp') subtitle.textContent = '好友本地对战';
        else subtitle.textContent = '最强 AI 巅峰对决';
        updateScoreLabels();
        resetGame();
    }

    function updateScoreLabels() {
        const labelX = document.querySelector('.score-card.player-x .label');
        const labelO = document.querySelector('.score-card.player-o .label');
        if (currentMode === 'pve') {
            labelX.textContent = '玩家 (X)';
            labelO.textContent = 'AI (O)';
        } else if (currentMode === 'pvp') {
            labelX.textContent = '玩家 1 (X)';
            labelO.textContent = '玩家 2 (O)';
        } else {
            labelX.textContent = 'AI (X)';
            labelO.textContent = 'AI (O)';
        }
    }

    function getTurnText() {
        if (currentMode === 'aivsai') return `AI ${currentPlayer} 思考中...`;
        if (currentMode === 'pvp') {
            return currentPlayer === PLAYER_X ? '玩家 1 的回合' : '玩家 2 的回合';
        }
        return currentPlayer === PLAYER_X ? '你的回合' : 'AI 思考中...';
    }

    function getWinnerText(winner) {
        if (currentMode === 'aivsai') return `AI ${winner} 获胜`;
        if (currentMode === 'pvp') return winner === PLAYER_X ? '玩家 1 获胜！' : '玩家 2 获胜！';
        return winner === PLAYER_X ? '你赢了！' : 'AI 获胜';
    }

    function handleCellClick(e) {
        const index = parseInt(e.currentTarget.dataset.index);
        if (!gameActive || gameBoard[index] !== '') return;
        if (currentMode === 'aivsai') return;
        if (currentMode === 'pve' && currentPlayer !== PLAYER_X) return;

        makeMove(index, currentPlayer);

        if (gameActive && currentMode === 'pve') {
            updateStatus(getTurnText(), 'o');
            lockBoard(true);
            aiTimer = setTimeout(() => {
                if (!gameActive) return;
                const aiMove = getBestMoveGeneric(gameBoard, PLAYER_O);
                makeMove(aiMove, PLAYER_O);
                lockBoard(false);
            }, 400);
        }
    }

    function startAiVsAi() {
        if (!gameActive || currentMode !== 'aivsai') return;
        lockBoard(true);
        aiTimer = setTimeout(() => {
            if (!gameActive || currentMode !== 'aivsai') return;
            const move = getBestMoveGeneric(gameBoard, currentPlayer);
            makeMove(move, currentPlayer);
            if (gameActive) {
                startAiVsAi();
            } else {
                aiTimer = setTimeout(() => {
                    if (currentMode === 'aivsai') resetGame();
                }, 1200);
            }
        }, 500);
    }

    function makeMove(index, player) {
        gameBoard[index] = player;
        const cell = cells[index];
        cell.innerHTML = player === PLAYER_X ? xSvg : oSvg;
        cell.classList.add('disabled');

        if (checkWin(gameBoard, player)) {
            endGame(false, player);
        } else if (checkDraw(gameBoard)) {
            endGame(true);
        } else {
            currentPlayer = player === PLAYER_X ? PLAYER_O : PLAYER_X;
            const activeClass = currentPlayer === PLAYER_X ? 'x' : 'o';
            updateStatus(getTurnText(), activeClass);
        }
    }

    function lockBoard(lock) {
        cells.forEach(cell => {
            const idx = parseInt(cell.dataset.index);
            if (gameBoard[idx] === '') {
                cell.classList.toggle('disabled', lock);
            }
        });
    }

    function updateStatus(text, activeClass) {
        statusText.textContent = text;
        statusBar.classList.remove('active-x', 'active-o');
        if (activeClass) statusBar.classList.add(`active-${activeClass}`);
    }

    function endGame(draw, winner) {
        gameActive = false;
        lockBoard(true);

        if (draw) {
            scores.draw++;
            animateScore(scoreDrawEl);
            const msg = currentMode === 'aivsai' ? '两大 AI 势均力敌' : '旗鼓相当的对手！';
            showModal('🤝', '平局', msg);
            updateStatus('平局', null);
        } else {
            scores[winner]++;
            animateScore(winner === PLAYER_X ? scoreXEl : scoreOEl);
            drawWinLine(winner);

            const title = getWinnerText(winner);
            if (winner === PLAYER_X) {
                const msg = currentMode === 'aivsai' ? 'AI X 技高一筹' :
                            (currentMode === 'pvp' ? '玩家 1 大获全胜！' : '不可思议，你击败了 AI！');
                showModal(currentMode === 'aivsai' ? '⚡' : '🎉', title, msg);
                updateStatus(title, 'x');
            } else {
                const msg = currentMode === 'aivsai' ? 'AI O 赢得胜利' :
                            (currentMode === 'pvp' ? '玩家 2 技高一筹！' : '别气馁，再来一局！');
                showModal(currentMode === 'aivsai' ? '⚡' : (currentMode === 'pvp' ? '🔥' : '🤖'), title, msg);
                updateStatus(title, 'o');
            }
        }
    }

    function animateScore(el) {
        el.classList.add('pop');
        el.textContent = parseInt(el.textContent) + 1;
        setTimeout(() => el.classList.remove('pop'), 200);
    }

    function resetGame() {
        clearTimeout(aiTimer);
        aiTimer = null;
        gameBoard = Array(9).fill('');
        gameActive = true;
        currentPlayer = PLAYER_X;
        cells.forEach(cell => {
            cell.innerHTML = '';
            cell.classList.remove('disabled');
        });
        hideModal();
        hideWinLine();
        updateStatus(getTurnText(), 'x');
        if (currentMode === 'aivsai') {
            startAiVsAi();
        }
    }

    function showModal(icon, title, msg) {
        modalIcon.textContent = icon;
        modalTitle.textContent = title;
        modalMessage.textContent = msg;
        modal.classList.add('show');
    }

    function hideModal() {
        modal.classList.remove('show');
    }

    function drawWinLine(winner) {
        const condition = getWinningCondition(gameBoard, winner);
        if (!condition) return;

        const [a, , c] = condition;
        const posA = getCellCenter(a);
        const posB = getCellCenter(c);

        const rect = boardEl.getBoundingClientRect();
        const padding = 12;
        const innerW = rect.width - padding * 2;
        const innerH = rect.height - padding * 2;
        const scaleX = 300 / innerW;
        const scaleY = 300 / innerH;

        const x1 = (posA.x - rect.left - padding) * scaleX;
        const y1 = (posA.y - rect.top - padding) * scaleY;
        const x2 = (posB.x - rect.left - padding) * scaleX;
        const y2 = (posB.y - rect.top - padding) * scaleY;

        winLineSvg.setAttribute('x1', x1);
        winLineSvg.setAttribute('y1', y1);
        winLineSvg.setAttribute('x2', x2);
        winLineSvg.setAttribute('y2', y2);
        winLineSvg.setAttribute('stroke', winner === PLAYER_X ? 'var(--x-color)' : 'var(--o-color)');

        winLine.classList.add('show');
    }

    function hideWinLine() {
        winLine.classList.remove('show');
    }

    function getCellCenter(index) {
        const cell = cells[index];
        const rect = cell.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    function checkWin(board, player) {
        return winConditions.some(cond => cond.every(i => board[i] === player));
    }

    function getWinningCondition(board, player) {
        return winConditions.find(cond => cond.every(i => board[i] === player)) || null;
    }

    function checkDraw(board) {
        return board.every(cell => cell !== '');
    }

    // ===== Generic Minimax for any player =====
    function getBestMoveGeneric(board, aiPlayer) {
        const humanPlayer = aiPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
        let bestScore = -Infinity;
        let move = -1;

        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = aiPlayer;
                const score = minimaxGeneric(board, 0, false, aiPlayer, humanPlayer);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    function minimaxGeneric(board, depth, isMaximizing, aiPlayer, humanPlayer) {
        if (checkWin(board, aiPlayer)) return 10 - depth;
        if (checkWin(board, humanPlayer)) return depth - 10;
        if (checkDraw(board)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = aiPlayer;
                    const score = minimaxGeneric(board, depth + 1, false, aiPlayer, humanPlayer);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = humanPlayer;
                    const score = minimaxGeneric(board, depth + 1, true, aiPlayer, humanPlayer);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    updateScoreLabels();
    init();
})();
