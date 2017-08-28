// checkers.js

/** The state of the game */
var state = {
    over: false,
    turn: 'b',
    board: [
        [null, 'w', null, 'w', null, 'w', null, 'w', null, 'w'],
        ['w', null, 'w', null, 'w', null, 'w', null, 'w', null],
        [null, 'w', null, 'w', null, 'w', null, 'w', null, 'w'],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, 'w', null, null, null, null, null, null],
        [null, null, 'b', null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        ['b', null, 'b', null, 'b', null, 'b', null, 'b', null],
        [null, 'b', null, 'b', null, 'b', null, 'b', null, 'b'],
        ['b', null, 'b', null, 'b', null, 'b', null, 'b', null]
    ],
    legalMoves: []
};

/** @function getLegalMoves
 * returns a list of legal moves for the specified
 * piece to make.
 * @param {String} piece - 'b' or 'w' for black or white pawns,
 *    'bk' or 'wk' for white or black kings.
 * @param {integer} x - the x position of the piece on the board
 * @param {integer} y - the y position of the piece on the board
 * @returns {Array} the legal moves as an array of objects.
 */
function getLegalMoves(piece, x, y) {
    var moves = [];
    switch (piece) {
        case 'b': // black can only move down the board diagonally
            checkSlide(moves, x - 1, y - 1);
            checkSlide(moves, x - 1, y + 1);
            checkJump(moves, {captures: [], landings: []}, piece, x, y);
            break;
        case 'w':  // white can only move up the board diagonally
            checkSlide(moves, x + 1, y + 1);
            checkSlide(moves, x + 1, y - 1);
            checkJump(moves, {captures: [], landings: []}, piece, x, y);
            break;
        case 'bk': // kings can move diagonally any direction
        case 'wk': // kings can move diagonally any direction
            checkSlide(moves, x - 1, y + 1);
            checkSlide(moves, x + 1, y + 1);
            checkSlide(moves, x - 1, y - 1);
            checkSlide(moves, x + 1, y - 1);
            checkJump(moves, {captures: [], landings: []}, piece, x, y);
            break;
    }
    return moves;
}

/** @function checkSlide
 * A helper function to check if a slide move is legal.
 * If it is, it is added to the moves array.
 * @param {Array} moves - the list of legal moves
 * @param {integer} x - the x position of the movement
 * @param {integer} y - the y position of the movement
 */
function checkSlide(moves, x, y) {
    // Check square is on grid
    if (x < 0 || x > 9 || y < 0 || y > 9) return;
    // check square is unoccupied
    if (state.board[x][y])
        return;
    // legal move!  Add it to the move list
    moves.push({type: 'slide', x: x, y: y});
}

/** @function copyJumps
 * A helper function to clone a jumps object
 * @param {Object} jumps - the jumps to clone
 * @returns The cloned jump object
 */
function copyJumps(jumps) {
    // Use Array.prototype.slice() to create a copy
    // of the landings and captures array.
    var newJumps = {
        landings: jumps.landings.slice(),
        captures: jumps.captures.slice()
    }
    return newJumps;
}

/** @function checkJump
 * A recursive helper function to determine legal jumps
 * and add them to the moves array
 * @param {Array} moves - the moves array
 * @param {Object} jumps - an object describing the
 *  prior jumps in this jump chain.
 * @param {String} piece - 'b' or 'w' for black or white pawns,
 *    'bk' or 'wk' for white or black kings
 * @param {integer} x - the current x position of the piece
 * @param {integer} y - the current y position of the peice
 */
function checkJump(moves, jumps, piece, x, y) {
    switch (piece) {
        case 'b': // black can only move down the board diagonally
            checkLanding(moves, copyJumps(jumps), piece, x - 1, y + 1, x - 2, y + 2);
            checkLanding(moves, copyJumps(jumps), piece, x - 1, y - 1, x - 2, y - 2);
            break;
        case 'w':  // white can only move up the board diagonally
            checkLanding(moves, copyJumps(jumps), piece, x + 1, y + 1, x + 2, y + 2);
            checkLanding(moves, copyJumps(jumps), piece, x + 1, y - 1, x + 2, y - 2);
            break;
        case 'bk': // kings can move diagonally any direction
        case 'wk': // kings can move diagonally any direction
            checkLanding(moves, copyJumps(jumps), piece, x - 1, y + 1, x - 2, y + 2);
            checkLanding(moves, copyJumps(jumps), piece, x + 1, y + 1, x + 2, y + 2);
            checkLanding(moves, copyJumps(jumps), piece, x - 1, y - 1, x - 2, y - 2);
            checkLanding(moves, copyJumps(jumps), piece, x + 1, y - 1, x + 2, y - 2);
            break;
    }
}

/** @function checkLanding
 * A helper function to determine if a landing is legal,
 * if so, it adds the jump sequence to the moves list
 * and recursively seeks additional jump opportunities.
 * @param {Array} moves - the moves array
 * @param {Object} jumps - an object describing the
 *  prior jumps in this jump chain.
 * @param {String} piece - 'b' or 'w' for black or white pawns,
 *    'bk' or 'wk' for white or black kings
 * @param {integer} cx - the 'capture' x position the piece is jumping over
 * @param {integer} cy - the 'capture' y position of the peice is jumping over
 * @param {integer} lx - the 'landing' x position the piece is jumping onto
 * @param {integer} ly - the 'landing' y position of the peice is jumping onto
 */
function checkLanding(moves, jumps, piece, cx, cy, lx, ly) {
    // Check landing square is on grid
    if (lx < 0 || lx > 9 || ly < 0 || ly > 9) return;
    // Check landing square is unoccupied
    if (state.board[lx][ly]) return;
    //check if there is a piece to capture
    if (!state.board[cx][cy]) return;
    // Check capture square is occuped by opponent
    if ((piece == 'b' || piece == 'bk') && (state.board[cx][cy] == 'b' || state.board[cx][cy] == 'bk')) return;
    if ((piece == 'w' || piece == 'wk') && (state.board[cx][cy] == 'w' || state.board[cx][cy] == 'wk')) return;
    // legal jump! add it to the moves list
    jumps.captures.push({x: cx, y: cy});
    jumps.landings.push({x: lx, y: ly});
    moves.push({
        type: 'jump',
        captures: jumps.captures.slice(),
        landings: jumps.landings.slice()
    });
    // check for further jump opportunities
    checkJump(moves, jumps, piece, lx, ly);
}

function compareMoves(m1, m2) {
    return JSON.stringify(m1) === JSON.stringify(m2);
}

/** @function ApplyMove
 * A function to apply the selected move to the game
 * @param x of piece that we are moving
 * @param y of piece that we are moving
 * @param {object} move - the move to apply.
 */
function applyMove(x, y, move) {
    //check if the right player is playing
    if (state.board[x][y] != state.turn) return;
    state.legalMoves = getLegalMoves(state.turn, x, y);
    validMove = false;
    state.legalMoves.forEach(function (item) {
        validMove = compareMoves(move, item);
    });

    if (state.legalMoves.length == 0 || !validMove) {
        console.log("Illegal move!");
        return;
    }
    // TODO: Apply the move
    if (move.type === 'slide') {
        state.board[move.x][move.y] = state.board[x][y];
        state.board[x][y] = null;
    } else {
        state.board[x][y] = null;
        move.captures.forEach(function (square) {
            state.board[square.x][square.y] = null;
        });
        lastLandingIndex = move.landings.length - 1;
        state.board[move.landings[lastLandingIndex].x][move.landings[lastLandingIndex].y] = state.turn;

    }
    // TODO: Check for victory
    checkVictory();
    nextTurn();
    // TODO: Start the next turn
}

function checkVictory() {
    var white = 0, black = 0;
    for (var i = 0; i < 10; i++) {
        for (var y = 0; y < 10; y++) {
            switch (state.board[i][y]) {
                case "b":
                    black++;
                    break;
                case "w":
                    white++;
                    break;
            }
        }
    }
    if (white = 0) return "black wins";
    if (black = 0) return "white wins";
    return false;
}

function nextTurn() {
    state.turn = state.turn === 'b' ? 'w' : 'b';
}

function printBoard() {
    console.log("____________________________________________")
    state.board.forEach(function (row, y) {
        var text = "|";
        row.forEach(function (column, x) {
            var fill = " ";//((x + y) % 2) ? " " : "\u25A1";
            var char = column === "b" ? "\u25CF" : "\u25CB"
            text += " " + (column === null ? fill : char) + " |";
        });
        console.log(text);
    });
    console.log("____________________________________________")
}

function main() {
    printBoard();
}

main();