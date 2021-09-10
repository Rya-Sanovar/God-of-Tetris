const grid = document.querySelector(".grid");
const miniGrid = document.querySelector(".mini-grid");
// First we create our main grids
for(let i = 0; i < 210; i++)
{
  if((i>199) && (i<210)) {
    grid.innerHTML += '<div id="taken" class="taken"></div>';
  }
  else {
    grid.innerHTML += '<div></div>';
  }
}

// then we create our mini grids
for(let i = 0; i < 16; i++)
{
  miniGrid.innerHTML += '<div></div>';
}

const width = 10; // 10 grids
let squares = Array.from(document.querySelectorAll(".grid div")); // 210 squares
const scoreDisplay = document.querySelector('#score');
const startBtn = document.querySelector('#start-button');
let nextRandom = 0;
let timerId;
let score = 0;
const colors = [
  'orange',
  'red',
  'purple',
  'green',
  'blue'
];

// the Tetrominoes
const lTetromino = [// each element like 'width*2+1' denotes index number of square from squares array which has to be colored.
  [1, width+1, width*2+1, 2],
  [width, width+1, width+2, width*2+2],
  [1, width+1, width*2+1, width*2],
  [width, width*2, width*2+1, width*2+2]
];

const zTetromino = [
  [0,width,width+1,width*2+1],
  [width+1, width+2,width*2,width*2+1],
  [0,width,width+1,width*2+1],
  [width+1, width+2,width*2,width*2+1]
];

const tTetromino = [
  [1,width,width+1,width+2],
  [1,width+1,width+2,width*2+1],
  [width,width+1,width+2,width*2+1],
  [1,width,width+1,width*2+1]
];

const oTetromino = [
  [0,1,width,width+1],//each array inside denotes a certain rotation of the tetromino
  [0,1,width,width+1],
  [0,1,width,width+1],
  [0,1,width,width+1]
];

const iTetromino = [
  [1,width+1,width*2+1,width*3+1],
  [width,width+1,width+2,width+3],
  [1,width+1,width*2+1,width*3+1],
  [width,width+1,width+2,width+3]
];

const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

let currentPosition = 4;
let currentRotation = 0;
//randomly select a tetromino and its first rotation
let random = Math.floor(Math.random() * theTetrominoes.length); // any 5 tetrominoes 0 to 4
let current = theTetrominoes[random][currentRotation];

// draw the Tetromino
function draw() {
  current.forEach(index => {
    squares[currentPosition + index].classList.add('tetromino');
    squares[currentPosition + index].style.backgroundColor = colors[random];
  });
}

// undraw the Tetromino
function undraw() {
  current.forEach(index => {
    squares[currentPosition + index].classList.remove('tetromino');
    squares[currentPosition + index].style.backgroundColor = '';
  });
}

// control where the Tetromino moves
function control(e) {
  if(e.keyCode === 37){
    moveLeft();
  }
  else if(e.keyCode === 38){//space bar
    rotate();
  }
  else if(e.keyCode === 39){
    moveRight();
  }
  else if(e.keyCode === 40){
    moveDown();
  }
}

document.addEventListener('keyup', control);

//move down the Tetromino
function moveDown() {
  undraw();
  currentPosition += width;
  draw();
  freeze();
}

// freeze the Tetromino if it stacks over another or reaches the bottom
function freeze() {
  if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
    current.forEach(index => squares[currentPosition + index].classList.add('taken'));
    //start a new tetromino falling
    random = nextRandom;
    nextRandom = Math.floor(Math.random() * theTetrominoes.length);
    current = theTetrominoes[random][currentRotation];
    currentPosition = 4;
    draw();
    displayShape();
    addScore();
    gameOver();
  }
}

// move the Tetromino left unless there's blockage
function moveLeft() {
  undraw();
  const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
  if(!isAtLeftEdge) {
    currentPosition--;
  }
  if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
    currentPosition++;
  }
  draw();
}

// move the Tetromino right unless there's blockage
function moveRight() {
  undraw();
  const isAtRightEdge = current.some(index => (currentPosition + index) % width === 9)
  if(!isAtRightEdge) {
    currentPosition++;
  }
  if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
    currentPosition--;
  }
  draw();
}

// fix rotation of tetraminoes at the edge
function isAtRight() {
  return current.some(index => (currentPosition + index) % width === 9)
}

function isAtLeft() {
  return current.some(index => (currentPosition + index) % width === 0)
}

function checkRotatedPosition(P) {
  P = P || currentPosition;
  if ((P+1) % width < 4) {
    if(isAtRight()){
      currentPosition += 1;
      checkRotatedPosition(P);
    }
  }
  else if (P % width > 5) {
    if (isAtLeft()) {
      currentPosition -= 1;
      checkRotatedPosition(P);
    }
  }
}

// rotate the Tetromino
function rotate() {
  undraw();
  currentRotation++;
  if(currentRotation === lTetromino.length) {
    currentRotation = 0;
  }
  current = theTetrominoes[random][currentRotation];
  checkRotatedPosition();
  draw();
}

// show upcoming tetromino in the mini grid
const displaySquares = document.querySelectorAll(".mini-grid div");
const displayWidth = 4; // 4 squares in one line in mini grid.
const displayIndex = 0;

//the display Tetrominos without rotations
const upNextTetrominoes = [
  [1, displayWidth+1, displayWidth*2+1, 2], //lTetromino
  [0, displayWidth, displayWidth+1, displayWidth*2+1], //zTetromino
  [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
  [0, 1, displayWidth, displayWidth+1], //oTetromino
  [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //iTetromino
];

// display the shape in mini grid display
function displayShape() {
  // remove any trace of the tetromino from the entire grid.
  displaySquares.forEach(element => {
    element.classList.remove('tetromino');
    element.style.backgroundColor = '';
  });
  upNextTetrominoes[nextRandom].forEach(index => {
    displaySquares[displayIndex + index].classList.add('tetromino');
    displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
  })
}

// add functionality to the start button
startBtn.addEventListener('click', () => {
  if(timerId) { // will enter this block if timerId is NOT null i.e. button is currently going on.
    clearInterval(timerId);
    timerId = null;
  }
  else { // if timerId is null i.e. game is either paused or didn't begin yet.
    draw();
    timerId = setInterval(moveDown, 1000);
    nextRandom = Math.floor(Math.random() * theTetrominoes.length);
    displayShape();
  }
});

// add score
function addScore() {
  for (let i = 0; i < 200; i +=width) {
    const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];

    if(row.every(index => squares[index].classList.contains('taken'))) {
      score += 10;
      scoreDisplay.innerHTML = score;
      row.forEach(index => {
        squares[index].classList.remove('taken');
        squares[index].classList.remove('tetromino');
        squares[index].style.backgroundColor = '';
      });
      const squaresRemoved = squares.splice(i, width);
      squares = squaresRemoved.concat(squares);
      squares.forEach(cell => grid.appendChild(cell));
    }
  }
}

// game over
function gameOver() {
  if( current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
    scoreDisplay.innerHTML = 'end';
    clearInterval(timerId);
  }
}