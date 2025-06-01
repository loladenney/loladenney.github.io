# Crossword puzzle player written in vanilla JS

## purpose
so people can play the crosswords i like to write when i am on airplanes.

## features
- UI is HTML with a bit of CSS


## file structure
- crossword_puzzle.html - landing page of the crossword game tab so a game is set up to begin playing
- crossword_menu.html - lets user select the puzzle to play
- puzzles - directory contains the puzzles numbered in orderer added 
    -  contains fields with a title, the dimensions of the puzzle, the date uploaded, and the clues and answers
    - dates will use ISO Format to be compatable with js Date objects
- input_puzzle is the directory containing a tool to help me write my puzzle as a json file

## future plans  - move to features when added
- Autochecks correctness when the puzzle is filled i
- landing page of the crossword game tab will be the most recently added game so the user is immediately encourages to begin playing
- when a puzzle is complete you proceed to the next most recent puzzle
- menu will sort based on puzzle demensions and then with more recent at the top
- puzzle resets when the window in closed
- tool to help me add in puzzles
