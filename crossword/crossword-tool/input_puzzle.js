// turn on strict mode
'use strict';

//TODO make json global object that gets built where its ? or passed from function to function? 
const puzzleJson = {
    title: "Untitled",
    notes: "",
    dimensions: 2,
    template: null,     // array of a record with an integer value, and a flag for across and down 
                        // value is -1 for no character, 0 for character must be placed, numbers for clues will be added in here
                        // both flags in template get initialized to false in "confirmSquares"
    solution: null,    // special character ∅ to indicate a black square, otherwise it will have alpha numeric character. i dont know if i should allow punctuation
    clues: null
  };

// for saying is a clue is for an across or a down
const Direction = Object.freeze({
    ACROSS: "across",
    DOWN: "down",
  });


//on click of reset button, reset the form. this is the same as just reloading the page so maybe do that
function resetForm() {
    // reset all parameters to defaults
    let title = document.getElementById("puzzleTitle");
    title.readOnly = false;
    title.value = "";
    puzzleJson.title = "Untitled";

    let notes = document.getElementById("notes");
    notes.readOnly = false;
    notes.value = "";
    puzzleJson.notes = "";

    let dim = document.getElementById("dimensions");
    dim.readOnly = false;
    dim.value = 2;
    puzzleJson.dimensions = 2;

    puzzleJson.template = null;
    puzzleJson.solution = null;
    puzzleJson.clues = null;

    document.getElementById("nextButton").disabled = false;
    document.getElementById("confirmSquaresButton").disabled = false;

    // hide anything that isnt displayed when the page is first loaded. 
    document.getElementById("selectSquares").style.display = "none";
    document.getElementById("clueTableContainer").style.display = "none";
    document.getElementById("templateTableContainer").style.display = "none";
    document.getElementById("checkPuzzleButton").style.display = "none";

    // Wipe template display table and clue table
    
    document.getElementById("templateTableContainer").innerHTML = ""
    document.getElementById("clueTableContainer").innerHTML = ""
}

//when next is clicked: collect the user inputs,  disable editing the name, notes, and dimensions. 
//then show the next part of the form
function nextSteps() {
    //fetch title, notes, and dimensions of square puzzle from webform  
    let titleInput = document.getElementById('puzzleTitle');
    puzzleJson.title = titleInput.value; 

    let notesInput = document.getElementById('notes');
    puzzleJson.notes = notesInput.value; 

    let dimInput = document.getElementById('dimensions');
    puzzleJson.dimensions = parseInt(dimInput.value, 10);

    //set all fields to read over to prevent issues with ambiguity if it gets changed after he value is read
    document.getElementById("puzzleTitle").readOnly = true;
    document.getElementById("notes").readOnly = true;
    document.getElementById("dimensions").readOnly = true;
    document.getElementById("nextButton").disabled = true;

    //initialise the template and solution arrays in the json struct to have the right number of spots and flags set to null
    puzzleJson.template = new Array(puzzleJson.dimensions * puzzleJson.dimensions).fill(null).map(() => ({
        value: 0,
        acrossflag: false,
        downflag: false
    }));
    puzzleJson.solution = new Array(dimInput.value * dimInput.value).fill(null);

    selectSquares();
}

// this function will show a dimension appropriate array of buttons that can be toggled black and white
function selectSquares() {
    // display the label
    document.getElementById("selectSquares").style.display = "block";
    
    // draw out a dim^2 array of buttons to let user black out squares
    let container = document.getElementById("buttonContainer"); //container to hold the buttons
    document.getElementById("buttonContainer").style.display = "block";
    container.innerHTML = ""; //make sure container is empty

    let dim = puzzleJson.dimensions
    for (let i = 0 ; i < dim*dim; i++){
        if (i % dim === 0 && i !== 0 ){
            let br = document.createElement("br");
            container.appendChild(br);
        }
        // generate the button, give it a unique id and initialize it to white
        let b = document.createElement("button"); //todo make button square
        b.id = "button" + i;
        b.className = "select-squares-button"; //todo make css to make these buttons square and have padding maybe??
        b.style.backgroundColor = "rgb(255, 255, 255)"; // initialize its color to white

        //this toggles the button between black and white
        b.addEventListener("click", () => {
            if (b.style.backgroundColor === "rgb(255, 255, 255)") {
                b.style.backgroundColor = "rgb(0, 0, 0)";
            }
            else {
                b.style.backgroundColor = "rgb(255, 255, 255)";
            }
          });

        container.appendChild(b); //add the button to container to be displayed
    }
}

 // When Confirm is clicked, and lock the button array and records it's current state in json struct
 // then proceed to filling in clue numbers and asking for user to fill in clues and solutions
function confirmSquares(){

    // lock the button and use its state to initialize the template and solution arrays
    for (let i = 0 ; i < puzzleJson.dimensions*puzzleJson.dimensions; i++){
        let b = document.getElementById("button" + i);
        b.disabled = true;
        let color = b.style.backgroundColor;

        // record the current state of the buttons in an array in the json stuct
        
        // we previously initialize the template array with both flags to false in "nextSteps"
        

        // if button is black it is selected, and a character cannot be placed there
        if (color === "rgb(0, 0, 0)") {
            puzzleJson.template[i].value = -1;
            puzzleJson.solution[i] = "∅";
        }

        // otherwise it is white and must take a character (keeps the 0 from initialization). 
        // the solution is intialized with null in this case so it is easy to detect if a square never gets filled in
        else {
            puzzleJson.solution[i] = null;
        }
    }

    //lock the Confirm Squares button before proceeding
    document.getElementById("confirmSquaresButton").disabled = true;


    addNumbers();
    generateClueTable();
}

// draws out the template to help user with inputting clues and answers
function drawTemplate() {
    //print out the crossword template as a table
    const table = document.createElement("table");
    document.getElementById("templateTableContainer").appendChild(table);
    
    for(let i = 0; i<puzzleJson.dimensions; i++){
        const row = document.createElement("tr");
        
        for (let j = 0; j<puzzleJson.dimensions; j++){
            const box = document.createElement("td");
            box.className = "display-template-box";
            const box_content = puzzleJson.template[(i*puzzleJson.dimensions)+j].value;
            
            if (box_content < 0){ // make background grey (so if black text appears it is easier to notice the error)
                box.style.backgroundColor = "rgb(100, 100, 100)";
            }
            else if (box_content > 0){ // write a number in the box
                box.textContent = box_content;
            }
            //otherwise leave the box blank and append
            
            row.appendChild(box);
        }
        table.appendChild(row);
    }
    //display the table
    document.getElementById("templateTableContainer").style.display = "block";
}

// parses the template array and figures out where all the across and down clues are and adds number to the corresponding squares
function addNumbers() {
    let template = puzzleJson.template;
    const dim = puzzleJson.dimensions;
    let num = 1;

    // add in number labels for answers in increasing order when required
    for (let i=0; i<dim*dim; i++){

        // case for across
        if ( template[i].value !== -1 &&                                          //current square is not black AND 
            (i+1 % dim !== 0 && i+1 < dim*dim && template[i+1].value >= 0) &&     //to the right is white ( with no wrap around or out of bounds) AND
            (i % dim === 0 || (( i-1 >= 0 && i % dim !== 0 && template[i-1].value === -1)) ))       // in first column OR left is black (with no wrap around or out of bounds)
            {     
                template[i].value = num;
                template[i].acrossflag = true;
                num ++;
            }

        // case for down
        if ( template[i].value !== -1 &&                            //current square is not black AND 
            (i + dim < dim * dim && template[i+dim].value >= 0) &&    // below is white (and in bounds) AND 
            (i < dim || (i-dim >= 0 && template[i-dim].value === -1)))         // in top row OR above is black (without being out of bounds, implicit by not being in top row)
            {    
                // to make sure only one number gets written if it had both an across and down clue
                if (!template[i].acrossflag) {
                    template[i].value = num;
                    num ++;
                }
                template[i].downflag = true;
            }
    }
    // write back in to the struct thing
    puzzleJson.template = template;

    // draw out the template
    drawTemplate();
}

// builds a form table for each of the word solutions and clues to be added to 
function generateClueTable() {
    const table = document.createElement("table");
   
    //build the header row 
    const header_row = document.createElement("tr");
    const direction = document.createElement("th");  // uses the Direction object from line ~15, values are "across" or "down"
    const clue_number = document.createElement("th");
    const clue = document.createElement("th");
    const answer_length = document.createElement("th");
    const answer = document.createElement("th");

    direction.textContent = " direction ";
    clue_number.textContent = " clue number ";
    clue.textContent = " clue ";
    answer_length.textContent = " answer length (chars) ";
    answer.textContent = " answer ";

    clue.style.width = "200px";
    answer.style.width = "100px";
    
    header_row.append(direction, clue_number, clue, answer, answer_length);
    table.appendChild(header_row);

    //build remaining rows from template
    const template = puzzleJson.template


    //iterate through template twice, first for across clues, then for down clues

    //across clue iterations
    for (let i = 0; i< puzzleJson.dimensions*puzzleJson.dimensions; i++){
        // skip if not across clue begins here
        if (! template[i].acrossflag) continue;
        
        // try to go across
        let j = i + 1;
        let count_char_across = 1;
        // we can write in j and we havent wrapped around (note: first spot is always writable by containing number > 0)
        while ( j % puzzleJson.dimensions !== 0 && template[j].value > -1){
            count_char_across ++;
            j ++;
        }

        // if the word has less than 2 characters, print an error
        if (count_char_across < 2) console.log("across word at " + i + " has less than 2 charaters. this shouldnt happen.");
        
        // we are sure there is a valid length word across starting here so we can add an input row for it
        const row = document.createElement("tr");

        const direction = document.createElement("td");
        const clue_number = document.createElement("td");
        const clue = document.createElement("td");
        const answer_length = document.createElement("td");
        const answer = document.createElement("td");

        //making answer and clue able to take user inputs
        const clue_content = document.createElement("input");
        clue_content.type = "text";
        clue_content.id = "clueContent_A_" + template[i].value;
        const answer_content = document.createElement("input");
        answer_content.type = "text";
        answer_content.id = "answerContent_A_" + template[i].value;
    
        // filling in the table
        direction.textContent = Direction.ACROSS;
        clue_number.textContent = template[i].value;
        clue.appendChild(clue_content); 
        answer_length.textContent = count_char_across;
        answer.appendChild(answer_content); 

        row.append(direction, clue_number, clue, answer, answer_length);
        
        //append row to table
        table.appendChild(row);
    
    }

    //down clue iterations
    for (let i = 0; i< puzzleJson.dimensions*puzzleJson.dimensions; i++){
        //skip if no down answer starts from here
        if (! template[i].downflag) continue;

        // try to go down
        let k = i + puzzleJson.dimensions;
        let count_char_down = 1;
        // we can write in j and we havent wrapped around (note: first spot is always writable by containing number > 0)
        while (k < puzzleJson.dimensions*puzzleJson.dimensions && k > -1){

            count_char_down ++;
            k += puzzleJson.dimensions; //fix
        }

        // if the word has less than 2 characters, print an error
        if (count_char_down < 2) console.log("down word at " + i + " has less than 2 charaters. this shouldnt happen.");
        
        // we are sure there is a valid length word down starting here so we can add an input row for it
        const row = document.createElement("tr");

        const direction = document.createElement("td");
        const clue_number = document.createElement("td");
        const clue = document.createElement("td");
        const answer_length = document.createElement("td");
        const answer = document.createElement("td");

        //making answer and clue able to take user inputs
        const clue_content = document.createElement("input");
        clue_content.type = "text";
        clue_content.id = "clueContent_D_" + template[i].value;
        const answer_content = document.createElement("input");
        answer_content.type = "text";
        answer_content.id = "answerContent_D_" + template[i].value;

        // filling in the table
        direction.textContent = Direction.DOWN;
        clue_number.textContent = template[i].value;
        clue.appendChild(clue_content); 
        answer_length.textContent = count_char_down;
        answer.appendChild(answer_content); 

        row.append(direction, clue_number, clue, answer, answer_length);
        
        table.appendChild(row);
    }

    document.getElementById("clueTableContainer").appendChild(table);

    //display the table to fill in and the button to check
    document.getElementById("clueTableContainer").style.display = "block";
    document.getElementById("checkPuzzleButton").style.display = "block";
}

// checks that all answers fit together, no empty spots, not conflicts.
function checkPuzzleSolution() {
// Note: ID names for clues and answers follow the format "TYPEContent_DIRECTION_NUM" 
// where TYPE is either "clue" or "answer", DIRECTION is "A" for across or "D" for down 
// and NUM is the corresponding clue number


}



// then display a table for clues with columns across and down, ask for input of clues and solutions
//check solutions are valid (no conflicts and covered the whole map)
// make a thing that prints the error and where it happens in the grid and what it is. a bad sumbission shouldnt wipe anything


// add a restart button at the top

