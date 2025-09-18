'use strict';

let puzzleJson;
const cellReferenceArray = []; //for storing references to all the cells in the array (1d array), includes black squares
const inputReferenceArray = []; 
const clueReferenceArray = [];
let direction = 'across';
let clue_num = 1;
let current_active_cell_index = 0;
const across_in_order = []; // array of the clue number and indexes (clue num, row,col) of the characters in the across answers in order
const down_in_order = [];

function getPuzzleTitleFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

function loadPuzzle(){
    const fileName = getPuzzleTitleFromUrl();
    fetch(`https://shadowthehedgehog.ca/crossword/puzzles/${fileName}.json`)
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        puzzleJson = data;
        WriteInOrders();
        drawPage();
        CheckBoardFull();
        
      })
    .catch(error => {
        console.error('Error fetching JSON:', error);
      });
}

function drawPage(){
    //draw in text for title and date and notes
    document.getElementById("title").textContent = puzzleJson.title;
    const date = new Date(puzzleJson.date);
    document.getElementById("date").textContent = date.toLocaleDateString();
    document.getElementById("notes").textContent = puzzleJson.notes;

    
    DrawBoard(); //draw out the table with each square being able to take a character a-z, A-Z, (cast to uppercase), 0-9
    DrawCluesList(); //add in all the clues in order using flexbox
}

function WriteInOrders() {
    const answer_info = new Map(JSON.parse(puzzleJson.answer_info));

    across_in_order.length = 0;  // prevent overwriting/duplication
    down_in_order.length = 0;

    const dim = puzzleJson.dimensions;

    for (let i = 0; i < dim * dim; i++) {
        const cell = puzzleJson.template[i];
        const row = Math.floor(i / dim);
        const col = i % dim;

        if (cell.acrossflag) {
            const clue_num = cell.value;
            const length = answer_info.get("A" + clue_num);

            for (let j = 0; j < length; j++) {
                across_in_order.push({
                    clue_num: clue_num,
                    row: row,
                    col: col + j
                });
            }
        }

        if (cell.downflag) {
            const clue_num = cell.value;
            const length = answer_info.get("D" + clue_num);

            for (let j = 0; j < length; j++) {
                down_in_order.push({
                    clue_num: clue_num,
                    row: row + j,
                    col: col
                });
            }
        }
    }
}


// something is not right in here... i must test it better
function FindNextIndex(currentRow, currentCol) { 
    if (direction === "across") {
        let currentIndex = across_in_order.findIndex(cell => cell.row === currentRow && cell.col === currentCol);
        if (currentIndex >= 0) {
            let remaining_row = across_in_order.slice(currentIndex+1); //TODO handle if currentIndex+1 out of bounds (might be handled by if statement)
            
            for (const cell of remaining_row) {
                
                if (cellReferenceArray[(cell.row * puzzleJson.dimensions) + cell.col].querySelector('input').value.trim() === "") {
                    clue_num = cell.clue_num;
                    return [cell.row, cell.col];
                }
            }

            for (const cell of down_in_order) {
                if (cellReferenceArray[(cell.row * puzzleJson.dimensions) + cell.col].querySelector('input').value.trim() === "") {
                    clue_num = cell.clue_num;
                    direction = "down";
                    return [cell.row, cell.col];
                }
            }

            let beginning_row = across_in_order.slice(0, currentIndex);
            for (const cell of beginning_row) {
                if (cellReferenceArray[(cell.row * puzzleJson.dimensions) + cell.col].querySelector('input').value.trim() === "") {
                    clue_num = cell.clue_num;
                    return [cell.row, cell.col];
                }
            }
        }
    } 
    else {  // direction = "down"
        let currentIndex = down_in_order.findIndex(cell => cell.row === currentRow && cell.col === currentCol);
        if (currentIndex >= 0) {
            let remaining_col = down_in_order.slice(currentIndex + 1); //TODO handle if currentIndex+1 out of bounds
            for (const cell of remaining_col) {
                if (cellReferenceArray[(cell.row * puzzleJson.dimensions) + cell.col].querySelector('input').value.trim() === "") {
                    clue_num = cell.clue_num;
                    return [cell.row, cell.col];
                }
            }

            for (const cell of across_in_order) {
                if (cellReferenceArray[(cell.row * puzzleJson.dimensions) + cell.col].querySelector('input').value.trim() === "") {
                    clue_num = cell.clue_num;
                    direction = "across";
                    return [cell.row, cell.col];
                }
            }

            let beginning_col = down_in_order.slice(0, currentIndex);
            for (const cell of beginning_col) {
                if (cellReferenceArray[(cell.row * puzzleJson.dimensions) + cell.col].querySelector('input').value.trim() === "") {
                    clue_num = cell.clue_num;
                    return [cell.row, cell.col];
                }
            }
        }
    }
    // in case we dont find an empty cell
    return [currentRow, currentCol];
}






//returns a 1d array with references to all the cells
function DrawBoard(){
    const grid = document.getElementById("gameboard-grid");
    grid.style.gridTemplateColumns = `repeat(${puzzleJson.dimensions}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${puzzleJson.dimensions}, 1fr)`;

    // generating the puzzle cells
    for (let i=0; i< puzzleJson.dimensions ** 2; i ++){
        const cell = document.createElement('div');
        cell.className = 'crossword-cell';

        // for scaling the font size with css
        document.documentElement.style.setProperty('--dim', puzzleJson.dimensions);

        // iterate through puzzle json template
        //  -1 means black and no input, otherwise there is an input and the square is white
        // we also add the clue index numbers as needed
        if (puzzleJson.template[i].value >= 0) {
            const input = document.createElement('input');
            input.className = "cell-input"
            input.type = 'text';
            input.maxLength = 1;
            input.dataset.row = Math.floor( i / puzzleJson.dimensions); // record the position in the context of the full gameboard 
            input.dataset.col = i % puzzleJson.dimensions;
            inputReferenceArray.push(input);

            
            //ensure input is a valid one
            input.addEventListener('input', (e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                e.target.value = value;

                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                const index = row * puzzleJson.dimensions + col;
                updateActiveCellHighlight(index);
            });

            //write in number if needed
            if (puzzleJson.template[i].value > 0){
                const cornerNumber = document.createElement('div');
                cornerNumber.className = cornerNumber;
                cornerNumber.textContent = puzzleJson.template[i].value;
                cell.appendChild(cornerNumber);
            }

            cell.style.backgroundColor = 'white';
            cell.appendChild(input);
        }
        else {
            cell.style.backgroundColor = '#737373';
        }

        grid.appendChild(cell);
        cellReferenceArray.push(cell);
    }

    //writing in to input
    document.getElementById('gameboard-grid').addEventListener('keydown', (e) => {
        
        const input = e.target.closest('input.cell-input');
        if (!input) return; 
      
        const key = e.key.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (/^[A-Z0-9]$/.test(key)) {
          e.preventDefault();
          input.value = key;
      
          // focus on next
          const row = parseInt(input.dataset.row);
          const col = parseInt(input.dataset.col);
          const [nextRow, nextCol] = FindNextIndex(row, col);
          const nextInput = cellReferenceArray[(nextRow * puzzleJson.dimensions) + nextCol]?.querySelector('input');
          if (nextInput){ 
            nextInput.focus();
            const index = (nextRow * puzzleJson.dimensions) + nextCol;
            updateActiveCellHighlight(index);
        }


          // check for when full
          CheckBoardFull()
        }
      
      });


    
    AddBetterNavigation();
    
}

// call this function every time a cell gets clicked on or moved to
function updateActiveCellHighlight(index) {
    console.log("in highlighting code");
    // remove all previous ones
    cellReferenceArray.forEach(cell => {
        cell.classList.remove('highlight-across', 'highlight-down');
    });

    current_active_cell_index = index
    const cell = cellReferenceArray[index];
    if (!cell) return;

    const highlightClass = direction === "across" ? 'highlight-across' : 'highlight-down';
    cell.classList.add(highlightClass);
}

function AddBetterNavigation(){
    const container = document.getElementById('gameboard-grid');

     // toggle direction on space etc   TODO test this with highlighting
     container.addEventListener('keydown', (e) => {
             
        if (e.key === ' '){
            direction = direction === "across"? "down":"across";
            //update arrow in "highlight"
            updateActiveCellHighlight(current_active_cell_index);

        }

        //TODO add backspace to delete current input and go back one spot or arrow keys??

    });


    // this is about what happens when the user clicks on a cell (update direction and active clue number)
    container.addEventListener('click', function(event) {

        const cell = event.target.closest('.crossword-cell');
        if (!cell) return; //we didtn click a  cell
        
        const input = cell.querySelector('input');
        if (!input) return;
        
        const row = Number(input.dataset.row);
        const col = Number(input.dataset.col);
        
        // Find clue number and if they have across and/or down
        const acrossClue = across_in_order.find(c => c.row === row && c.col === col);
        const downClue = down_in_order.find(c => c.row === row && c.col === col);

        // update direction and clue number accordingly
        if (direction === "across" && downClue) {
            direction = "down";
            clue_num = downClue.clue_num;
        } else if (direction === "down" && acrossClue) {
            direction = "across";
            clue_num = acrossClue.clue_num;
        } else if (direction === "across" && acrossClue) {
            clue_num = acrossClue.clue_num;
        } else if (direction === "down" && downClue) {
            clue_num = downClue.clue_num;
        } else {
            return;
        }

        // check for highlighting update
        const index = row * puzzleJson.dimensions + col;
        updateActiveCellHighlight(index);
    });




    // TODO THIS DOESNT WORK start by focusing on the first guy in the puzzle.
    // WHEN IT WORKS SWITCH DEFUALT AT TOP TO ACROSS 
    for (const cell of cellReferenceArray){
        const input = cell?.querySelector('input');
        if (input){
            const row = Number(input.dataset.row);
            const col = Number(input.dataset.col);
            const acrossClue = across_in_order.find(c => c.row === row && c.col === col);
            const downClue = down_in_order.find(c => c.row === row && c.col === col);
            if (acrossClue){
                direction = "across";
                clue_num = acrossClue.clue_num;
            }
            else if (downClue){
                direction = "down";
                clue_num = downClue.clue_num;
            }
            else {break;}
            focus(input)
            break;
        }
    }
}

function DrawCluesList(){
    //give a thing where clicking on the clue brings you to the head of the puzzle. (going in the right direction, across or down)

    const acrossBox = document.getElementById('across-box');
    const downBox = document.getElementById('down-box');
    
    puzzleJson.clues.forEach((item) => {
        if (item.direction === "across"){
            const clueElement = document.createElement('div');
            clueElement.classList.add('clue');
            clueElement.innerHTML = `<b>${item.number}.</b> ${item.clue}`;
            acrossBox.appendChild(clueElement);
        }
        if (item.direction === "down"){
            const clueElement = document.createElement('div');
            clueElement.classList.add('clue');
            clueElement.innerHTML = `<b>${item.number}.</b> ${item.clue}`;
            downBox.appendChild(clueElement);
        }
    });

    //TODO make it so current selected clue is same light grey as square being inputted to. 



}

// checks the crossword. will only run if all white cells have an character
function CheckBoardFull(){
    const allFilled = inputReferenceArray.every(input => input.value.trim() !== '');
    
    if (allFilled) {
        CheckPuzzle();
    }
}
   
 // Compare with the solution, this will only be called on a completely filled in puzzle
function CheckPuzzle() {
    const puzzleGrid = document.getElementById('gameboard-grid');
    const i = puzzleGrid.querySelectorAll('#gameboard-grid input');
    const inputs = Array.from(i);
    
    let j = 0;
    for (let i = 0; i < inputs.length ; i++) {
        while (puzzleJson.solution[i+j] === "∅") j++; // to skip black squares in solution
        
        if (inputs[i].value != puzzleJson.solution[i+j].toUpperCase()){
            //wrong answer
            alert("Not quite right");
            console.log("FAIL");
            return;
        }
    }

    //success
    YouWin();
}

function RevealIncorrectSquares() {
    const puzzleGrid = document.getElementById('gameboard-grid');
    const i = puzzleGrid.querySelectorAll('#gameboard-grid input');
    const inputs = Array.from(i);
    
    let j = 0;
    for (let i = 0; i < inputs.length ; i++) {
        while (puzzleJson.solution[i+j] === "∅") j++; // to skip black squares in solution
        //set crossword-cell background back to white to 

        cellReferenceArray[i+j].style.backgroundColor = "rgb(255, 255, 255)";
        if (inputs[i].value != puzzleJson.solution[i+j].toUpperCase() && inputs[i].value != ""){
            //wrong answer -> highlight the square red
            cellReferenceArray[i+j].style.backgroundColor = "rgb(255, 144, 144)";
        }
        
    }
}

//remove all red from squares and send alert
function YouWin(){
    let j = 0;
    for (let i = 0; i < inputReferenceArray.length ; i++) {
        while (puzzleJson.solution[i+j] === "∅") j++; // to skip black squares in solution
        
        cellReferenceArray[i+j].style.backgroundColor = "rgb(255, 255, 255)";
    }

    //let the cells update first before the alert
    setTimeout(() => {
        alert("YOU WIN!");
    }, 20);

    //TODO make the alert nicer and add a graphic
}



loadPuzzle();

//TODO highlight full word based on direction and current letter



// then add all the interactivity, inputing, , reveal answer
//below notes, add buttons for puzzle check and letter reveal
// add a letter check, and full puzzle check. once a letter is checked, lock its input and change its background to light grey. 

// add controls for getting between clues quicker. arrow keys for squares in grid? return to get to next word in list, auto move to next space when typing in character
// highlight current work beign written?? to know if its across or down. 

// add animations for when the puzzle is complete


//todo highlight currently selected box, starting with top right corner. when a character is inputted, automatically move to the right. 






// ok for the highlighting
/*
when you click on a clue, it highlights the corresponding first empty square in the right direction at that number. if its all full it goes to the first square
clicking on a clue sets the "direction" state, so we know which way to move the cursor when a character is entered

by default on load in, the direction is set to across, and the highlighted square is the top left one. the first across clue is also highlighted
if a cell that is currently selected gets clicked, direction flips and the square doesnt change even if its filled. 
if no across clue exists, if there is a down clue flip direction and start with that one. if there is neither then 

when a character is written, the cursor move one spot in the direction of "direction", if we are already at the end, we look at the list of 
clues in the current direction, and go to the next empty square from a clue after the current one. 
if there are no more blank squares from any of the clues in the current direction, we go to the next open square of the other direction (make sure we flip the direction), 
if that one is filled then look through the original direction from the top. there will always be an open square because the below thing will enforce that.

if the character is the one that completes the puzzle (correct or not) (this will be detected the same way we know to check the full puzzle) do not change anything. check this before the above to avoid infinite loops

-how can i get the thing to immediately take a character? a secret click happening? idk

*/