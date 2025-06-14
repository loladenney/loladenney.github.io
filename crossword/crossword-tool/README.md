# Webform for digitizing my crossword games

## purpose
to let me input my crossword games as compatible json to be playable on my website

## features
- UI is pure (ugly) HTML 
- the crossword games are stored as 1d arrays like this [a,b,c,d] -> a b 
                                                                  c d
- when a crossword is created with this tool, it gets saved to ~loladenney.github.io/crossword/puzzles where it's filename is ???????? i havent decided yet


## file structure
- input_puzzle.html is a webform that prompts the user to collect the info needed to make a json file out of a written crossword
- input_puzzle.css is barely used, only to make the buttons in the grid square
- input_puzzle.js  where the code lives


## future plans  - move to features when added

## todo
- check the completed game has no conflicts and that all words are the correct number of characters long and print error messages when needed.
- export as json when clicking on a button (auto add current date on upload)
- add author field (maybe just write in notes as a guest if its not by me???)
