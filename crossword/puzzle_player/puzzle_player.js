'use strict';

let puzzleJson;

function getPuzzleTitleFromUrl() {
    const params = new URLSearchParams(window.location.search);
    console.log(params.get('id'));
    return params.get('id');
  }

function loadPuzzle(){
    const fileName = getPuzzleTitleFromUrl();
    fetch(`https://loladenney.github.io/crossword/puzzles/${fileName}.json`)
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        puzzleJson = data;
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
        console.log(puzzleJson.template[i]);
        if (puzzleJson.template[i].value >= 0) {
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
    
            

            input.addEventListener('input', (e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                e.target.value = value;
            });

            //write in number if needed
            if (puzzleJson.template[i].value > 0){
                const cornerNumber = document.createElement('div');
                cornerNumber.textContent = puzzleJson.template[i].value;
                cornerNumber.style.placeItems = "center";
                cornerNumber.style.gridColumn = '1';
                cornerNumber.style.gridRow = '1';
                cell.appendChild(cornerNumber);
            }

            cell.style.backgroundColor = 'white';
            cell.appendChild(input);
        }
        else {
            cell.style.backgroundColor = '#737373';
        }

        grid.appendChild(cell);
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
            acrossBox.appendChild(clueElement);
        }
    });

    //TODO make it so current selected clue is same light grey as square being inputted to. 



}

// checks the crossword. will only run if all white cells have an character
function CheckBoardFull(){
    const puzzleGrid = document.getElementById('gameboard-grid');
    puzzleGrid.addEventListener('input', () => {
        const inputs = puzzleGrid.querySelectorAll('input');
        const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
    
        if (allFilled) {
            CheckPuzzle();
        }
    });
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
            console.log("FAIL");
            return;
        }
    }

    //success
    console.log("WIN");
    alert("YOU WIN!");
    //TODO go to YouWin() function
}


loadPuzzle();


// then add all the interactivity, inputing, , reveal answer
//below notes, add buttons for puzzle check and letter reveal
// add a letter check, and full puzzle check. once a letter is checked, lock its input and change its background to light grey. 

// add controls for getting between clues quicker. arrow keys for squares in grid? return to get to next word in list, auto move to next space when typing in character
// highlight current work beign written?? to know if its across or down. 

// add animations for when the puzzle is complete

// add a timer?

// add a thing that saves progress even if you leave the page (i dont think i want this)

//YouWin() should lock the puzzle inputs and stop checking and play a horray animation

//todo highlight currently selected box, starting with top right corner. when a character is inputted, automatically move to the right. 

// temporary for testing!!!





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