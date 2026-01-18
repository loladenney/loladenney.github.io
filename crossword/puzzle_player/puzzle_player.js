'use strict';

let puzzleJson;
const cellReferenceArray = []; //for storing references to all the cells in the array (1d array), includes black squares
const inputReferenceArray = []; 
const clueReferenceArray = [];
let direction = 'down';
let clue_num = 1;
let current_active_cell_index = 0; // index of cell reference array
const across_in_order = []; // array of the clue number and indexes (clue num, row,col) of the characters in the across answers in order
const down_in_order = [];

// for like button
const NAMESPACE = 'shadowthehedgehog'; 
const KEY = '';
const LIKE_BUTTON_API_BASE = 'https://api.countapi.xyz';

function getPuzzleTitleFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }


function loadPuzzle(fileName){
    //load in the puzzle
    fetch(`https://shadowthehedgehog.ca/crossword/puzzles/${fileName}.json`)
    // for testing fetch(`https://shadowthehedgehog.ca/crossword/puzzles/JUMBOOOO.json`)
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


// calculates the next index. tab is a boolean to skip over the current word first
function FindNextIndex(currentRow, currentCol, tab) { 
    if (direction === "across") {
        let currentIndex = across_in_order.findIndex(cell => cell.row === currentRow && cell.col === currentCol);
        if (currentIndex >= 0) {
            let remaining_row = across_in_order.slice(currentIndex+1); 
            
            for (const cell of remaining_row) {
                
                if (cellReferenceArray[(cell.row * puzzleJson.dimensions) + cell.col].querySelector('input').value.trim() === "") {
                    if (cell.clue_num == clue_num && tab){ // skip open spots in current word if we want to tab
                        continue;
                    }
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
            let remaining_col = down_in_order.slice(currentIndex + 1); 
            for (const cell of remaining_col) {
                if (cellReferenceArray[(cell.row * puzzleJson.dimensions) + cell.col].querySelector('input').value.trim() === "") {
                    if (cell.clue_num == clue_num && tab){ // skip open spots in current word if we want to tab
                        continue;
                    }
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


// calculates the previous index for using backspace, only finds previous index within active word
function FindPrevIndex(currentRow, currentCol) {  // TODO issue with backspace after spacebar is in here
    if (direction === "across") {
        let currentIndex = across_in_order.findIndex(cell => cell.row === currentRow && cell.col === currentCol);

        // if current index is 0 we dont want to try to decrement index because it will be out of bounds.
        // and if its 0 its nessesarily the first char in its word
        if (currentIndex > 0) { 
            const prevIndex = currentIndex - 1;
            if (across_in_order[prevIndex].clue_num == clue_num) { // there is a character before focused on in the same word
                return [across_in_order[prevIndex].row, across_in_order[prevIndex].col]
            }
        }
        return [currentRow, currentCol]; // otherwise we don't want to move 
    } 
    else {  // direction = "down"
        let currentIndex = down_in_order.findIndex(cell => cell.row === currentRow && cell.col === currentCol);
    
    
        if (currentIndex > 0) { 
            const prevIndex = currentIndex - 1;
            if (down_in_order[prevIndex].clue_num == clue_num) { // there is a character before focused on in the same word
                return [down_in_order[prevIndex].row, down_in_order[prevIndex].col] // return it's position
            }
        }
        return [currentRow, currentCol]; // otherwise we don't want to move 
    }
  
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
        const dim = puzzleJson.dimensions
        document.documentElement.style.setProperty('--dim',dim);

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
                cornerNumber.className = 'corner-number';
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
        e.preventDefault();
        const input = e.target.closest('input.cell-input');
        if (!input) return; 

        const key = e.key.toUpperCase().replace(/[^A-Z0-9]/g, ''); // get rid of blank space and capitalize

        // TODO backspace doesnt work when we click on an already filled in word. check direction is correct and debug
        if (e.key === 'Backspace') { // delete current square and focus on previous one
            if (input.value == ""){ // if current cell input empty, we want to delete the previous char in that word (if it exists)
                // move to previous
                const row = parseInt(input.dataset.row);
                const col = parseInt(input.dataset.col);
                const [prevRow, prevCol] = FindPrevIndex(row, col);
                const prevInput = cellReferenceArray[(prevRow * puzzleJson.dimensions) + prevCol]?.querySelector('input');
                if (prevInput && ! (prevRow == row &&  prevCol == col) ){  // the position has changes and no errors
                    prevInput.value = "";
                    prevInput.focus();
                    const index = (prevRow * puzzleJson.dimensions) + prevCol;
                    updateActiveCellHighlight(index);
                }
            }
            else { // if current cell has content, just delete it
                input.value = "";
            }
        
            // no need to check if board is full because by def this will leave an empty cell
        }
        
        else if (/^[A-Z0-9]$/.test(key) || e.key === 'Tab') { // we write a character or we want to skip to next word
            if ( e.key != 'Tab'){ // write in to square if its a character
                input.value = key;
            }

            // move to next (either next empty, or if tab next empty not in current word)
            const row = parseInt(input.dataset.row);
            const col = parseInt(input.dataset.col);
            const [nextRow, nextCol] = FindNextIndex(row, col, e.key === 'Tab');
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

     
    AddBetterNavigation(); // spacebar to toggle
    
}

// call this function every time a cell gets clicked on or moved to
function updateActiveCellHighlight(index) {
    // remove all previous ones
    cellReferenceArray.forEach(cell => {
        cell.classList.remove('highlight-across', 'highlight-down');
    });

    current_active_cell_index = index
    const cell = cellReferenceArray[index];
    if (!cell) return;
    let highlightClass;
    if (direction === 'across'){
        highlightClass = 'highlight-across';
    }
    else {
        highlightClass = 'highlight-down';
    }
    
    cell.classList.add(highlightClass);
}

function AddBetterNavigation(){
    const container = document.getElementById('gameboard-grid');

     // toggle direction arrow on spacebar
     container.addEventListener('keydown', (e) => {
             
        if (e.key === ' '){
            const row = Math.floor(current_active_cell_index / puzzleJson.dimensions);
            const col = current_active_cell_index % puzzleJson.dimensions;

            // toggle direction and update clue num to match
            if (direction === 'down'){
                direction = 'across';
                const acrossClue = across_in_order.find(c => c.row === row && c.col === col);
                if (typeof acrossClue === 'undefined'){
                    clue_num = 0
                }
                else {
                    clue_num = acrossClue.clue_num; 
                }
            }
            else{
                direction = 'down';
                const downClue = down_in_order.find(c => c.row === row && c.col === col);
                if (typeof downClue === 'undefined'){
                    clue_num = 0
                }
                else {
                    clue_num = downClue.clue_num; 
                }
            }
            
            



            //update arrow in "highlight"
            updateActiveCellHighlight(current_active_cell_index);
        }


    });


    // this is about what happens when the user clicks on a cell (update direction and active clue number)
    container.addEventListener('click', function(event) { // TODO i changed it on the airplane TEST THIS. it should change this to only change if same cell is clicked twice in a row

        const cell = event.target.closest('.crossword-cell');
        if (!cell) return; //we didtn click a  cell
        
        const input = cell.querySelector('input');
        if (!input) return; // make sure somthign is there


        
        const row = Number(input.dataset.row);
        const col = Number(input.dataset.col);
       
        
        // if the cell changes, update current_active_cell
        if ( (row * puzzleJson.dimensions) + col != current_active_cell_index){
            current_active_cell_index = (row * puzzleJson.dimensions) + col
        }
        else { //toggle direction when the same cell is clicked on twice
        
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
                direction = "across";
                clue_num = acrossClue.clue_num;
            } else if (direction === "down" && downClue) {
                direction = "down";
                clue_num = downClue.clue_num;
            } else {
                return;
            }

            // check for highlighting update
            const index = row * puzzleJson.dimensions + col;
            updateActiveCellHighlight(index);
        }
        
    });


    // TODO check this works for initilaizing direction as across
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
    direction = "across"; // initialize to across
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

/* 
// like button stuff
const btn = document.getElementById('likeBtn');
let hasLiked = localStorage.getItem(`liked_${NAMESPACE}_${KEY}`) === 'true';

function updateLikeButton() {
    const img = btn.querySelector('.heart-image');
    
    if (hasLiked) {
      btn.classList.add('liked');
      img.src = 'liked-image.png'; 
    } else {
      btn.classList.remove('liked');
      img.src = 'unliked-image.png';
    }
}


// Handle like/unlike
async function toggleLike() {
    btn.disabled = true;

    try {
        let endpoint;
        
        if (hasLiked) {
            endpoint = `${API_BASE}/update/${NAMESPACE}/${KEY}?amount=-1`;
        } else {
            endpoint = `${API_BASE}/hit/${NAMESPACE}/${KEY}`;
        }
        
        const response = await fetch(endpoint);
        const data = await response.json();
        
        if (data.value !== undefined) {
            hasLiked = !hasLiked;
            localStorage.setItem(`liked_${NAMESPACE}_${KEY}`, hasLiked);
            updateLikeButton();
        } else {
            throw new Error('Invalid response');
        }
        
    } catch (error) {
        console.error('Error toggling like:', error);
    } finally {
        btn.disabled = false;
    }
}
    
        
  
async function fetchLikeCount(){
    try {
        const response = await fetch(`${LIKE_BUTTON_API_BASE}/get/${NAMESPACE}/${KEY}`);
        const data = await response.json();
        updateLikeButton();
        btn.disabled = false;
    } catch (error) {
        console.error('Error fetching count:', error);
        countSpan.textContent = '?';
    }
}
 */


// start running stuff
function loadPage(){
    const fileName = getPuzzleTitleFromUrl();
    // do like button stuff
    //fetchLikeCount();

    // load the puzzle
    loadPuzzle(fileName);

    // Event listener
    //likebtn.addEventListener('click', toggleLike);
}
  

loadPage();




// add animations for when the puzzle is complete

