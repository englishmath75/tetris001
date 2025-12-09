// --- 1. 초기 설정 및 변수 ---

const board = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('start-button');
const width = 10; // 보드 너비 (10칸)
const height = 20; // 보드 높이 (20칸)
let score = 0;
let cells = []; // 보드 셀(칸) 요소를 저장할 배열
let currentPosition = 4; // 현재 블록의 시작 위치
let timerId;
let isGameOver = false;

// 보드 동적 생성 (10x20 = 200개의 셀)
function createBoard() {
    for (let i = 0; i < width * height; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        board.appendChild(cell);
        cells.push(cell);
    }
}

// 📐 테트로미노 모양 정의 (각 칸의 상대적 위치)
const lTetromino = [
    [1, width + 1, width * 2 + 1, 2], // 0도
    [width, width + 1, width + 2, width * 2 + 2], // 90도
    [1, width + 1, width * 2 + 1, width * 2], // 180도
    [width, width * 2, width * 2 + 1, width * 2 + 2] // 270도
];
// 다른 블록 (J, I, O, S, T, Z) 배열도 동일한 방식으로 정의합니다. 
// (설명의 간결함을 위해 생략하고 L 블록만 예시로 듭니다.)
const theTetrominoes = [lTetromino /*, jTetromino, ... */]; 
let random = Math.floor(Math.random() * theTetrominoes.length);
let currentRotation = 0;
let current = theTetrominoes[random][currentRotation]; // 현재 블록

// --- 2. 블록 그리기 및 지우기 함수 ---

// 블록을 그리는 함수
function draw() {
    current.forEach(index => {
        cells[currentPosition + index].classList.add('tetromino', lTetromino.className); // 실제 구현 시 클래스명을 동적으로 넣어야 함
    });
}

// 블록을 지우는 함수
function undraw() {
    current.forEach(index => {
        cells[currentPosition + index].classList.remove('tetromino', lTetromino.className);
    });
}

// --- 3. 이동 및 충돌 감지 로직 ---

// 아래로 이동
function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze(); // 바닥이나 다른 블록에 닿았는지 확인
}

// 멈춤 (Freeze) 로직
function freeze() {
    // 다음 이동 시 블록이 보드의 바닥(index가 width*height 이상)이거나 
    // 이미 채워진 칸(cells[...].classList.contains('taken'))에 닿으면 멈춥니다.
    if (current.some(index => cells[currentPosition + index + width].classList.contains('taken'))) {
        current.forEach(index => cells[currentPosition + index].classList.add('taken')); // 현재 블록을 고정 (taken 클래스 부여)
        
        // 새 블록 생성
        addScore();
        random = Math.floor(Math.random() * theTetrominoes.length);
        current = theTetrominoes[random][0];
        currentPosition = 4;
        draw();
        
        gameOver();
    }
}

// 왼쪽으로 이동
function moveLeft() {
    undraw();
    // 왼쪽 경계 체크: 현재 위치가 보드의 왼쪽 끝인지 확인
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
    // 왼쪽 칸이 이미 채워져 있는지 체크
    const isTaken = current.some(index => cells[currentPosition + index - 1].classList.contains('taken'));

    if (!isAtLeftEdge && !isTaken) {
        currentPosition -= 1;
    }
    draw();
}
// moveRight()와 rotate() 함수도 비슷한 충돌 로직을 사용하여 구현합니다.

// --- 4. 점수 및 게임 오버 로직 ---

// 줄 제거 및 점수 계산
function addScore() {
    for (let i = 0; i < width * height; i += width) {
        const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];

        // 한 줄이 모두 채워졌는지 확인 (모든 셀이 'taken' 클래스를 가짐)
        if (row.every(index => cells[index].classList.contains('taken'))) {
            score += 10;
            scoreDisplay.innerHTML = score;
            
            // 제거할 줄을 보드에서 지움
            row.forEach(index => {
                cells[index].classList.remove('taken', 'tetromino', lTetromino.className); 
            });
            const cellsRemoved = cells.splice(i, width); // 배열에서 해당 줄 제거
            cells = cellsRemoved.concat(cells); // 제거된 줄을 상단에 빈 줄로 채움

            // DOM을 새롭게 업데이트 (모든 칸을 다시 보드에 붙임)
            cells.forEach(cell => board.appendChild(cell));
        }
    }
}

// 게임 오버
function gameOver() {
    if (current.some(index => cells[currentPosition + index].classList.contains('taken'))) {
        scoreDisplay.innerHTML = 'end';
        clearInterval(timerId); // 타이머 멈춤
        isGameOver = true;
    }
}

// --- 5. 이벤트 리스너 및 게임 시작 ---

createBoard();

// 모바일 버튼 이벤트 리스너 연결
document.getElementById('left-btn').addEventListener('click', moveLeft);
// ... (나머지 버튼: right-btn, rotate-btn, down-btn도 연결)

// 게임 시작/재시작
startButton.addEventListener('click', () => {
    if (timerId) {
        // 이미 게임이 실행 중이면 멈춤 (일시정지 기능)
        clearInterval(timerId);
        timerId = null;
    } else {
        // 게임 시작: 1초마다 moveDown 실행
        timerId = setInterval(moveDown, 1000); 
    }
});

draw(); // 첫 블록 그리기
