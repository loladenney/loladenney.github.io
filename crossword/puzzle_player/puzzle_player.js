'use strict';

let puzzleJson;

function loadPuzzle(fileName){
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
    //TODO go to YouWin() function
}


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
loadPuzzle("hello");
