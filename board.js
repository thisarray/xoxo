/*
 * An immutable representation of the current state.
 */
class Board {
  static X_MARKER = 'X';
  static O_MARKER = 'O';
  static BLANK_MARKER = ' ';
  static TEST_MARKER = '?';

  /*
   * Map instance to memoize the look ahead wins, losses, and draws.
   */
  static CACHE = new Map();

  constructor(width, height, length, player, computer) {
    if (typeof width !== 'number') {
      throw new TypeError('width must be a number.');
    }
    if (typeof height !== 'number') {
      throw new TypeError('height must be a number.');
    }
    if (typeof length !== 'number') {
      throw new TypeError('length must be a number.');
    }

    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.winLength = Math.max(2, length);
    this.playerMarker = player;
    this.computerMarker = computer;

    // Use an array of strings for the board
    this.cells = new Array(this.width * this.height).fill(Board.BLANK_MARKER);
  }

  /*
   * Return the index for coordinates (x, y).
   */
  _coordinatesToIndex(x, y) {
    return x + (y * this.width);
  }

  /*
   * Return the marker at the coordinates (x, y).
   */
  getMarker(x, y) {
    if (typeof x !== 'number') {
      throw new TypeError('x must be a number.');
    }
    if (typeof y !== 'number') {
      throw new TypeError('y must be a number.');
    }

    if (x < 0) {
      return Board.BLANK_MARKER;
    }
    if (y < 0) {
      return Board.BLANK_MARKER;
    }
    if (this.width <= x) {
      return Board.BLANK_MARKER;
    }
    if (this.height <= y) {
      return Board.BLANK_MARKER;
    }
    return this.cells[this._coordinatesToIndex(x, y)];
  }

  /*
   * Return an array containing the string of markers for each row in this Board instance.
   */
  get rows() {
    let rows = [],
        row;
    for (let y = 0; y < this.height; y++) {
      row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(this.cells[this._coordinatesToIndex(x, y)]);
      }
      rows.push(row.join(''));
    }
    return rows;
  }

  /*
   * Return an array containing the string of markers for each column in this Board instance.
   */
  get columns() {
    let columns = [],
        column;
    for (let x = 0; x < this.width; x++) {
      column = [];
      for (let y = 0; y < this.height; y++) {
        column.push(this.cells[this._coordinatesToIndex(x, y)]);
      }
      columns.push(column.join(''));
    }
    return columns;
  }

  /*
   * Return the string of markers along the diagonal starting at the coordinates (originX, originY).
   */
  _getDiagonal(originX, originY, left = false) {
    let result = [],
        x = originX,
        y = originY,
        dx = 1,
        dy = 1;
    if (left) {
      dx = -1;
    }
    while ((0 <= x) && (x < this.width) && (0 <= y) && (y < this.height)) {
      result.push(this.cells[this._coordinatesToIndex(x, y)]);
      x += dx;
      y += dy;
    }
    return result.join('');
  }

  get leftDiagonals() {
    let result = [];
    for (let x = 0; x < this.width; x++) {
      result.push(this._getDiagonal(x, 0, true));
    }
    for (let y = 1; y < this.height; y++) {
      result.push(this._getDiagonal(this.width - 1, y, true));
    }
    return result;
  }

  get rightDiagonals() {
    let result = [];
    for (let y = this.height - 1; y > 0; y--) {
      result.push(this._getDiagonal(0, y, false));
    }
    for (let x = 0; x < this.width; x++) {
      result.push(this._getDiagonal(x, 0, false));
    }
    return result;
  }

  _someoneWin(winCondition) {
    for (let r of [this.rows, this.columns, this.leftDiagonals, this.rightDiagonals]) {
      for (let s of r) {
        if (s.includes(winCondition)) {
          return true;
        }
      }
    }
    return false;
  }

  get playerWin() {
    return this._someoneWin(this.playerMarker.repeat(this.winLength));
  }

  get computerWin() {
    return this._someoneWin(this.computerMarker.repeat(this.winLength));
  }

  get done() {
    if (this.playerWin) {
      return true;
    }
    if (this.computerWin) {
      return true;
    }
    if (this.cells.every(v => ((v === this.playerMarker) || (v === this.computerMarker)))) {
      // If the game is tied
      return true;
    }
    return false;
  }

  /*
   * Return a new Board instance resulting from placing marker at the coordinates (x, y).
   */
  place(x, y, marker) {
    if (typeof x !== 'number') {
      throw new TypeError('x must be a number.');
    }
    if (typeof y !== 'number') {
      throw new TypeError('y must be a number.');
    }

    if (this.done) {
      return this;
    }
    if (x < 0) {
      return this;
    }
    if (y < 0) {
      return this;
    }
    if (this.width <= x) {
      return this;
    }
    if (this.height <= y) {
      return this;
    }
    if (this.getMarker(x, y) !== Board.BLANK_MARKER) {
      return this;
    }
    if ((marker !== this.playerMarker) && (marker !== this.computerMarker)) {
      return this;
    }

    let board = new Board(this.width, this.height, this.winLength, this.playerMarker, this.computerMarker),
        index = this._coordinatesToIndex(x, y);
    board.cells = this.cells.slice();
    board.cells[index] = marker;

    return board;
  }


  /*
   * Return a score for placing the computer marker at the coordinates (x, y).
   */
  score(x, y) {
    if (typeof x !== 'number') {
      throw new TypeError('x must be a number.');
    }
    if (typeof y !== 'number') {
      throw new TypeError('y must be a number.');
    }

    if (this.done) {
      return 0;
    }
    if (x < 0) {
      return 0;
    }
    if (y < 0) {
      return 0;
    }
    if (this.width <= x) {
      return 0;
    }
    if (this.height <= y) {
      return 0;
    }
    if (this.getMarker(x, y) !== Board.BLANK_MARKER) {
      return 0;
    }

    let computerTake = this.place(x, y, this.computerMarker),
        playerTake = this.place(x, y, this.playerMarker),
        score = 0;

    if (computerTake.computerWin) {
      // If taking the spot results in a win, then prioritize this spot
      score += 1000;
    }
    if (playerTake.playerWin) {
      // If the player taking the spot results in a win, then block it
      score += 100;
    }

    // Temporarily modify the board with Board.TEST_MARKER to evaluate how good this spot is
    computerTake.cells[computerTake._coordinatesToIndex(x, y)] = Board.TEST_MARKER;
    for (let r of [computerTake.rows, computerTake.columns, computerTake.leftDiagonals, computerTake.rightDiagonals]) {
      for (let s of r) {
        if (s.length < this.winLength) {
          continue;
        }
        if (s.includes(this.playerMarker)) {
          if (!s.includes(this.computerMarker)) {
            score += 1;
          }
        }
        else {
          if (s.includes(this.computerMarker)) {
            // Try to continue runs
            score += 10;
          }
          else {
            // Start a run that is not blocked
            score += 2;
          }
        }
      }
    }

    return score;
  }

  getComputerMove() {
    if (this.done) {
      return {x: -1, y: -1};
    }

    let scores = [],
        loss = null;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.getMarker(x, y) === Board.BLANK_MARKER) {
          let computerTake = this.place(x, y, this.computerMarker),
              playerTake = this.place(x, y, this.playerMarker),
              index = this._coordinatesToIndex(x, y);
          if (computerTake.computerWin) {
            // If this move results in a win, then make it immediately
            return {x: x, y: y};
          }
          if (playerTake.playerWin) {
            // If letting player have this move results in a loss, then remember to block it
            // We don't make the move immediately in case we find a winning move later
            loss = {x: x, y: y};
          }
          else if (loss == null) {
            // Only look ahead if we don't need to block
            let [O_count, X_count, draw_count] = Board.look_ahead(computerTake, this.playerMarker);
            if (this.computerMarker === Board.O_MARKER) {
              scores.push({losses: X_count, wins: O_count, x: x, y: y});
            }
            else {
              scores.push({losses: O_count, wins: X_count, x: x, y: y});
            }
          }
        }
      }
    }

    if (loss != null) {
      // Block player to prevent a loss
      return loss;
    }

    // Fallback to the best move according to minimax
    scores.sort(function (a, b) {
      // Sort ascending by losses (min)
      if (a.losses < b.losses) {
        return -1;
      }
      else if (a.losses > b.losses) {
        return 1;
      }
      else {
        // If losses are equal, then sort descending by wins (max)
        if (a.wins < b.wins) {
          return 1;
        }
        else if (a.wins > b.wins) {
          return -1;
        }
        else {
          return 0;
        }
      }
    });
    return {x: scores[0].x, y: scores[0].y};
  }

  /*
   * Look ahead to all possible moves and return the number of wins for each marker.
   */
  static look_ahead(board, marker) {
    if (board.playerWin) {
      if (board.playerMarker === Board.O_MARKER) {
        return [1, 0, 0];
      }
      else {
        return [0, 1, 0];
      }
    }
    if (board.computerWin) {
      if (board.computerMarker === Board.O_MARKER) {
        return [1, 0, 0];
      }
      else {
        return [0, 1, 0];
      }
    }
    if (board.done) {
      return [0, 0, 1];
    }

    // At this point, the board must have an empty space
    let key = marker + ':' + board.cells.join(''),
        opposing = Board.O_MARKER,
        O_total = 0,
        X_total = 0,
        draw_total = 0;
    if (marker === Board.O_MARKER) {
      opposing = Board.X_MARKER;
    }
    if (Board.CACHE.has(key)) {
      // Return the memoized result to reduce computation
      return Board.CACHE.get(key);
    }
    for (let x = 0; x < board.width; x++) {
      for (let y = 0; y < board.height; y++) {
        if (board.getMarker(x, y) === Board.BLANK_MARKER) {
          let newBoard = board.place(x, y, marker),
              [O_count, X_count, draw_count] = Board.look_ahead(newBoard, opposing);
          O_total += O_count;
          X_total += X_count;
          draw_total += draw_count;
        }
      }
    }

    Board.CACHE.set(key, [O_total, X_total, draw_total])
    return [O_total, X_total, draw_total];
  }


  /*
   * Return a new Board instance built from the string s.
   */
  static fromString(s) {
    if (typeof s !== 'string') {
      throw new TypeError('s must be a non-empty string.');
    }
    let parts = s.split(Board.TEST_MARKER),
        board = new Board(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2], 10), parts[3], parts[4]);
    board.cells = Array.from(parts[5]);
    return board;
  }

  /*
   * A short test suite to confirm the Board class works.
   */
  static test() {
    let board = new Board(3, 3, 3, Board.X_MARKER, Board.O_MARKER);
    console.assert(board.width === 3,
                   {msg: 'board.width is incorrect.'});
    console.assert(board.height === 3,
                   {msg: 'board.height is incorrect.'});
    console.assert(board.winLength === 3,
                   {msg: 'board.winLength is incorrect.'});
    console.assert(board.playerMarker === Board.X_MARKER,
                   {msg: 'board.playerMarker is incorrect.'});
    console.assert(board.computerMarker === Board.O_MARKER,
                   {msg: 'board.computerMarker is incorrect.'});
    console.assert(board.cells.every(v => (v === Board.BLANK_MARKER)),
                   {msg: 'board.cells is incorrect.'});
    for (let x = -1; x <= board.width; x++) {
      for (let y = -1; y <= board.height; y++) {
        console.assert(board.getMarker(x, y) === Board.BLANK_MARKER,
                       {msg: 'board.getMarker() failed.'});
      }
    }
    console.assert(!board.playerWin,
                   {msg: 'board.playerWin is incorrect.'});
    console.assert(!board.computerWin,
                   {msg: 'board.computerWin is incorrect.'});
    console.assert(!board.done,
                   {msg: 'board.done is incorrect.'});
    for (let s of board.rows) {
      console.assert(s === Board.BLANK_MARKER.repeat(board.width),
                     {msg: 'board.rows is incorrect.'});
    }
    for (let s of board.columns) {
      console.assert(s === Board.BLANK_MARKER.repeat(board.height),
                     {msg: 'board.columns is incorrect.'});
    }
    for (let s of [board.leftDiagonals, board.rightDiagonals]) {
      console.assert(s[0] === Board.BLANK_MARKER.repeat(1),
                     {msg: 'board.leftDiagonals is incorrect.'});
      console.assert(s[1] === Board.BLANK_MARKER.repeat(2),
                     {msg: 'board.leftDiagonals is incorrect.'});
      console.assert(s[2] === Board.BLANK_MARKER.repeat(3),
                     {msg: 'board.leftDiagonals is incorrect.'});
      console.assert(s[3] === Board.BLANK_MARKER.repeat(2),
                     {msg: 'board.leftDiagonals is incorrect.'});
      console.assert(s[4] === Board.BLANK_MARKER.repeat(1),
                     {msg: 'board.leftDiagonals is incorrect.'});
    }

    for (let values of [
      Board.look_ahead(board.place(0, 0, board.playerMarker), Board.O_MARKER),
      Board.look_ahead(board.place(2, 0, board.playerMarker), Board.O_MARKER),
      Board.look_ahead(board.place(0, 2, board.playerMarker), Board.O_MARKER),
      Board.look_ahead(board.place(2, 2, board.playerMarker), Board.O_MARKER)]) {
      console.assert(values[0] === 7896,
                     {msg: 'Board.look_ahead() failed.'});
      console.assert(values[1] === 14652,
                     {msg: 'Board.look_ahead() failed.'});
      console.assert(values[2] === 5184,
                     {msg: 'Board.look_ahead() failed.'});
    }
    let values = Board.look_ahead(board.place(1, 1, board.playerMarker), Board.O_MARKER);
    console.assert(values[0] === 5616,
                   {msg: 'Board.look_ahead() failed.'});
    console.assert(values[1] === 15648,
                   {msg: 'Board.look_ahead() failed.'});
    console.assert(values[2] === 4608,
                   {msg: 'Board.look_ahead() failed.'});
    board = new Board(3, 3, 3, Board.X_MARKER, Board.O_MARKER);
    board.cells = Array.from('OOO X    ');
    values = Board.look_ahead(board, Board.O_MARKER);
    console.assert(values[0] === 1,
                   {msg: 'Board.look_ahead() failed.'});
    console.assert(values[1] === 0,
                   {msg: 'Board.look_ahead() failed.'});
    console.assert(values[2] === 0,
                   {msg: 'Board.look_ahead() failed.'});
    board.cells = Array.from('OO XXX   ');
    values = Board.look_ahead(board, Board.O_MARKER);
    console.assert(values[0] === 0,
                   {msg: 'Board.look_ahead() failed.'});
    console.assert(values[1] === 1,
                   {msg: 'Board.look_ahead() failed.'});
    console.assert(values[2] === 0,
                   {msg: 'Board.look_ahead() failed.'});
    board.cells = Array.from('OXXXXOOOX');
    values = Board.look_ahead(board, Board.O_MARKER);
    console.assert(values[0] === 0,
                   {msg: 'Board.look_ahead() failed.'});
    console.assert(values[1] === 0,
                   {msg: 'Board.look_ahead() failed.'});
    console.assert(values[2] === 1,
                   {msg: 'Board.look_ahead() failed.'});

    board = new Board(3, 4, 5, Board.X_MARKER, Board.O_MARKER);
    console.assert(board.width === 3,
                   {msg: 'board.width is incorrect.'});
    console.assert(board.height === 4,
                   {msg: 'board.height is incorrect.'});
    console.assert(board.winLength === 5,
                   {msg: 'board.winLength is incorrect.'});
    console.assert(board.playerMarker === Board.X_MARKER,
                   {msg: 'board.playerMarker is incorrect.'});
    console.assert(board.computerMarker === Board.O_MARKER,
                   {msg: 'board.computerMarker is incorrect.'});
    console.assert(board.cells.every(v => (v === Board.BLANK_MARKER)),
                   {msg: 'board.cells is incorrect.'});
    for (let x = -1; x <= board.width; x++) {
      for (let y = -1; y <= board.height; y++) {
        console.assert(board.getMarker(x, y) === Board.BLANK_MARKER,
                       {msg: 'board.getMarker() failed.'});
      }
    }
    console.assert(!board.playerWin,
                   {msg: 'board.playerWin is incorrect.'});
    console.assert(!board.computerWin,
                   {msg: 'board.computerWin is incorrect.'});
    console.assert(!board.done,
                   {msg: 'board.done is incorrect.'});
    for (let s of board.rows) {
      console.assert(s === Board.BLANK_MARKER.repeat(board.width),
                     {msg: 'board.rows is incorrect.'});
    }
    for (let s of board.columns) {
      console.assert(s === Board.BLANK_MARKER.repeat(board.height),
                     {msg: 'board.columns is incorrect.'});
    }
    console.assert(board.leftDiagonals[0] === Board.BLANK_MARKER.repeat(1),
                   {msg: 'board.leftDiagonals is incorrect.'});
    console.assert(board.leftDiagonals[1] === Board.BLANK_MARKER.repeat(2),
                   {msg: 'board.leftDiagonals is incorrect.'});
    console.assert(board.leftDiagonals[2] === Board.BLANK_MARKER.repeat(3),
                   {msg: 'board.leftDiagonals is incorrect.'});
    console.assert(board.leftDiagonals[3] === Board.BLANK_MARKER.repeat(3),
                   {msg: 'board.leftDiagonals is incorrect.'});
    console.assert(board.leftDiagonals[4] === Board.BLANK_MARKER.repeat(2),
                   {msg: 'board.leftDiagonals is incorrect.'});
    console.assert(board.leftDiagonals[5] === Board.BLANK_MARKER.repeat(1),
                   {msg: 'board.leftDiagonals is incorrect.'});
    console.assert(board.rightDiagonals[0] === Board.BLANK_MARKER.repeat(1),
                   {msg: 'board.rightDiagonals is incorrect.'});
    console.assert(board.rightDiagonals[1] === Board.BLANK_MARKER.repeat(2),
                   {msg: 'board.rightDiagonals is incorrect.'});
    console.assert(board.rightDiagonals[2] === Board.BLANK_MARKER.repeat(3),
                   {msg: 'board.rightDiagonals is incorrect.'});
    console.assert(board.rightDiagonals[3] === Board.BLANK_MARKER.repeat(3),
                   {msg: 'board.rightDiagonals is incorrect.'});
    console.assert(board.rightDiagonals[4] === Board.BLANK_MARKER.repeat(2),
                   {msg: 'board.rightDiagonals is incorrect.'});
    console.assert(board.rightDiagonals[5] === Board.BLANK_MARKER.repeat(1),
                   {msg: 'board.rightDiagonals is incorrect.'});

    board = new Board(3, 3, 3, Board.O_MARKER, Board.X_MARKER);
    console.assert(board.width === 3,
                   {msg: 'board.width is incorrect.'});
    console.assert(board.height === 3,
                   {msg: 'board.height is incorrect.'});
    console.assert(board.winLength === 3,
                   {msg: 'board.winLength is incorrect.'});
    console.assert(board.playerMarker === Board.O_MARKER,
                   {msg: 'board.playerMarker is incorrect.'});
    console.assert(board.computerMarker === Board.X_MARKER,
                   {msg: 'board.computerMarker is incorrect.'});
    console.assert(board.cells.every(v => (v === Board.BLANK_MARKER)),
                   {msg: 'board.cells is incorrect.'});
    for (let x = -1; x <= board.width; x++) {
      for (let y = -1; y <= board.height; y++) {
        console.assert(board.getMarker(x, y) === Board.BLANK_MARKER,
                       {msg: 'board.getMarker() failed.'});
      }
    }
    console.assert(!board.playerWin,
                   {msg: 'board.playerWin is incorrect.'});
    console.assert(!board.computerWin,
                   {msg: 'board.computerWin is incorrect.'});
    console.assert(!board.done,
                   {msg: 'board.done is incorrect.'});
    for (let s of board.rows) {
      console.assert(s === Board.BLANK_MARKER.repeat(board.width),
                     {msg: 'board.rows is incorrect.'});
    }
    for (let s of board.columns) {
      console.assert(s === Board.BLANK_MARKER.repeat(board.height),
                     {msg: 'board.columns is incorrect.'});
    }
    for (let s of [board.leftDiagonals, board.rightDiagonals]) {
      console.assert(s[0] === Board.BLANK_MARKER.repeat(1),
                     {msg: 'board.leftDiagonals is incorrect.'});
      console.assert(s[1] === Board.BLANK_MARKER.repeat(2),
                     {msg: 'board.leftDiagonals is incorrect.'});
      console.assert(s[2] === Board.BLANK_MARKER.repeat(3),
                     {msg: 'board.leftDiagonals is incorrect.'});
      console.assert(s[3] === Board.BLANK_MARKER.repeat(2),
                     {msg: 'board.leftDiagonals is incorrect.'});
      console.assert(s[4] === Board.BLANK_MARKER.repeat(1),
                     {msg: 'board.leftDiagonals is incorrect.'});
    }

    board = board.place(0, 0, Board.O_MARKER);
    board = board.place(1, 1, Board.X_MARKER);
    console.assert(board.cells.join('') === 'O   X    ',
                   {msg: 'board.cells is incorrect.'});
    for (let x = -1; x <= board.width; x++) {
      for (let y = -1; y <= board.height; y++) {
        let expected = Board.BLANK_MARKER;
        if ((x === 0) && (y === 0)) {
          expected = Board.O_MARKER;
        }
        else if ((x === 1) && (y === 1)) {
          expected = Board.X_MARKER;
        }
        console.assert(board.getMarker(x, y) === expected,
                       {msg: 'board.getMarker() failed.'});
      }
    }
    console.assert(board.rows.length === 3,
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[0] === 'O  ',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[1] === ' X ',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[2] === '   ',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.columns.length === 3,
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[0] === 'O  ',
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[1] === ' X ',
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[2] === '   ',
                   {msg: 'board.columns is incorrect.'});
    for (let [x, y, expected] of [
      [0, 0, 'OX '],
      [1, 0, '  '],
      [2, 0, ' '],
      [0, 1, '  '],
      [1, 1, 'X '],
      [2, 1, ' '],
      [0, 2, ' '],
      [1, 2, ' '],
      [2, 2, ' ']]) {
      console.assert(board._getDiagonal(x, y) === expected,
                     {msg: 'board._getDiagonal() failed.'});
      console.assert(board._getDiagonal(x, y, false) === expected,
                     {msg: 'board._getDiagonal() failed.'});
    }
    for (let [x, y, expected] of [
      [0, 0, 'O'],
      [1, 0, '  '],
      [2, 0, ' X '],
      [0, 1, ' '],
      [1, 1, 'X '],
      [2, 1, '  '],
      [0, 2, ' '],
      [1, 2, ' '],
      [2, 2, ' ']]) {
      console.assert(board._getDiagonal(x, y, true) === expected,
                     {msg: 'board._getDiagonal() failed.'});
    }

    console.assert(board.place(-1, 0, Board.O_MARKER) === board,
                   {msg: 'board.place() failed.'});
    console.assert(board.place(0, -1, Board.X_MARKER) === board,
                   {msg: 'board.place() failed.'});
    console.assert(board.place(board.width, 0, Board.O_MARKER) === board,
                   {msg: 'board.place() failed.'});
    console.assert(board.place(0, board.height, Board.X_MARKER) === board,
                   {msg: 'board.place() failed.'});
    console.assert(board.place(0, 0, Board.O_MARKER) === board,
                   {msg: 'board.place() failed.'});
    console.assert(board.place(0, 0, Board.X_MARKER) === board,
                   {msg: 'board.place() failed.'});
    console.assert(board.place(1, 1, Board.O_MARKER) === board,
                   {msg: 'board.place() failed.'});
    console.assert(board.place(1, 1, Board.X_MARKER) === board,
                   {msg: 'board.place() failed.'});

    board = board.place(2, 0, board.computerMarker);
    board = board.place(0, 2, board.playerMarker);
    console.assert(!board.playerWin,
                   {msg: 'board.playerWin is incorrect.'});
    console.assert(!board.computerWin,
                   {msg: 'board.computerWin is incorrect.'});
    console.assert(!board.done,
                   {msg: 'board.done is incorrect.'});
    console.assert(board.cells.join('') === 'O X X O  ',
                   {msg: 'board.cells is incorrect.'});
    console.assert(board.rows.length === 3,
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[0] === 'O X',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[1] === ' X ',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[2] === 'O  ',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.columns.length === 3,
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[0] === 'O O',
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[1] === ' X ',
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[2] === 'X  ',
                   {msg: 'board.columns is incorrect.'});
    for (let [x, y, expected] of [
      [0, 0, 'OX '],
      [1, 0, '  '],
      [2, 0, 'X'],
      [0, 1, '  '],
      [1, 1, 'X '],
      [2, 1, ' '],
      [0, 2, 'O'],
      [1, 2, ' '],
      [2, 2, ' ']]) {
      console.assert(board._getDiagonal(x, y) === expected,
                     {msg: 'board._getDiagonal() failed.'});
      console.assert(board._getDiagonal(x, y, false) === expected,
                     {msg: 'board._getDiagonal() failed.'});
    }
    for (let [x, y, expected] of [
      [0, 0, 'O'],
      [1, 0, '  '],
      [2, 0, 'XXO'],
      [0, 1, ' '],
      [1, 1, 'XO'],
      [2, 1, '  '],
      [0, 2, 'O'],
      [1, 2, ' '],
      [2, 2, ' ']]) {
      console.assert(board._getDiagonal(x, y, true) === expected,
                     {msg: 'board._getDiagonal() failed.'});
    }

    board = board.place(2, 1, board.computerMarker);
    board = board.place(0, 1, board.playerMarker);
    console.assert(board.playerWin,
                   {msg: 'board.playerWin is incorrect.'});
    console.assert(!board.computerWin,
                   {msg: 'board.computerWin is incorrect.'});
    console.assert(board.done,
                   {msg: 'board.done is incorrect.'});
    console.assert(board.cells.join('') === 'O XOXXO  ',
                   {msg: 'board.cells is incorrect.'});
    console.assert(board.rows.length === 3,
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[0] === 'O X',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[1] === 'OXX',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[2] === 'O  ',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.columns.length === 3,
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[0] === 'OOO',
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[1] === ' X ',
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[2] === 'XX ',
                   {msg: 'board.columns is incorrect.'});
    for (let [x, y, expected] of [
      [0, 0, 'OX '],
      [1, 0, ' X'],
      [2, 0, 'X'],
      [0, 1, 'O '],
      [1, 1, 'X '],
      [2, 1, 'X'],
      [0, 2, 'O'],
      [1, 2, ' '],
      [2, 2, ' ']]) {
      console.assert(board._getDiagonal(x, y) === expected,
                     {msg: 'board._getDiagonal() failed.'});
      console.assert(board._getDiagonal(x, y, false) === expected,
                     {msg: 'board._getDiagonal() failed.'});
    }
    for (let [x, y, expected] of [
      [0, 0, 'O'],
      [1, 0, ' O'],
      [2, 0, 'XXO'],
      [0, 1, 'O'],
      [1, 1, 'XO'],
      [2, 1, 'X '],
      [0, 2, 'O'],
      [1, 2, ' '],
      [2, 2, ' ']]) {
      console.assert(board._getDiagonal(x, y, true) === expected,
                     {msg: 'board._getDiagonal() failed.'});
    }

    values = board.getComputerMove();
    console.assert(values.x === -1,
                   {msg: 'board.getComputerMove() failed.'});
    console.assert(values.y === -1,
                   {msg: 'board.getComputerMove() failed.'});

    // Test the AI goes for the win
    board = new Board(3, 3, 3, Board.X_MARKER, Board.O_MARKER);
    board.cells = Array.from('OXX X OOX');
    values = board.getComputerMove();
    console.assert(values.x === 0,
                   {msg: 'board.getComputerMove() failed.'});
    console.assert(values.y === 1,
                   {msg: 'board.getComputerMove() failed.'});

    board.cells = Array.from('OXXXX OO ');
    values = board.getComputerMove();
    console.assert(values.x === 2,
                   {msg: 'board.getComputerMove() failed.'});
    console.assert(values.y === 2,
                   {msg: 'board.getComputerMove() failed.'});

    // Test the AI goes for the block
    board = Board.fromString('3?3?3?X?O?OX  X    ');
    values = board.getComputerMove();
    console.assert(values.x === 1,
                   {msg: 'board.getComputerMove() failed.'});
    console.assert(values.y === 2,
                   {msg: 'board.getComputerMove() failed.'});
  }
}
Board.prototype.toString = function () {
  let result = [
    this.width,
    this.height,
    this.winLength,
    this.playerMarker,
    this.computerMarker,
    this.cells.join('')
  ]
  return result.join(Board.TEST_MARKER);
}
