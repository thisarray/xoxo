const X_MARKER = 'X';
const O_MARKER = 'O';
const BLANK_MARKER = ' ';
const TEST_MARKER = '?';

/*
 * Set of valid strings in a board state.
 */
const STATE_SET = new Set([X_MARKER, O_MARKER, BLANK_MARKER]);

class Board {
  constructor(width, height, length, player, computer, state) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.length = Math.max(2, length);
    this.playerMarker = player;
    this.computerMarker = computer;

    this.playerWin = false;
    this.computerWin = false;
    this.done = false;

    if ((!Board.is_valid_state(state)) ||
        (state.length != (this.width * this.height))) {
      // If state is invalid or not long enough
      this.cells = BLANK_MARKER.repeat(this.width * this.height);
    }
    else {
      this.cells = state.toUpperCase();

      let directions = this.rows.concat(this.columns),
          playerWinCondition = this.playerWinCondition,
          computerWinCondition = this.computerWinCondition;
      // Check the diagonals
      for (let x = 0; x < this.width; x++) {
        directions.push(this.getDiagonal(x, 0));
        directions.push(this.getDiagonal(x, 0, true));
      }
      for (let y = 1; y < this.height; y++) {
        directions.push(this.getDiagonal(0, y));
        directions.push(this.getDiagonal(this.width - 1, y, true));
      }
      for (let direction of directions) {
        if (direction.includes(playerWinCondition)) {
          this.playerWin = true;
        }
        if (direction.includes(computerWinCondition)) {
          this.computerWin = true;
        }
      }

      // Check if the player or the computer won or if any more moves are possible
      this.done = this.playerWin || this.computerWin || (!this.cells.includes(BLANK_MARKER));
    }
  }
  coordinatesToIndex(x, y) {
    return x + (y * this.width);
  }
  get(x, y) {
    if (x < 0) {
      return BLANK_MARKER;
    }
    if (y < 0) {
      return BLANK_MARKER;
    }
    if (x >= this.width) {
      return BLANK_MARKER;
    }
    if (y >= this.height) {
      return BLANK_MARKER;
    }
    return this.cells.charAt(this.coordinatesToIndex(x, y));
  }
  get playerWinCondition() {
    return this.playerMarker.repeat(this.length);
  }
  get computerWinCondition() {
    return this.computerMarker.repeat(this.length);
  }
  get rows() {
    let rows = [];
    for (let i = 0; i < this.cells.length; i += this.width) {
      rows.push(this.cells.substring(i, i + this.width).toUpperCase());
    }
    return rows;
  }
  get columns() {
    let columns = [];
    for (let x = 0; x < this.width; x++) {
      let column = [];
      for (let y = 0; y < this.height; y++) {
        column.push(this.get(x, y));
      }
      columns.push(column.join('').toUpperCase());
    }
    return columns;
  }

  /*
   * Return the diagonal containing the square at (x, y).
   *
   * Defaults to the diagonal going to the bottom right.
   * If toLeft is true, then return the diagonal going to the bottom left.
   */
  getDiagonal(x, y, toLeft = false) {
    let limit = Math.min(this.width, this.height),
        startX = 0,
        startY = 0;
    if (y <= 0) {
      startX = x;
    }
    else {
      if (toLeft) {
        if (x >= (this.width - 1)) {
          startX = this.width - 1;
          startY = y;
        }
        else {
          let delta = Math.min(this.width - 1 - x, y);
          startX = x + delta;
          startY = y - delta;
        }
      }
      else {
        if (x <= 0) {
          startX = 0;
          startY = y;
        }
        else {
          let delta = Math.min(x, y);
          startX = x - delta;
          startY = y - delta;
        }
      }
    }

    let buffer = [],
        currentX = 0,
        currentY = 0;
    for (let i = 0; i < limit; i++) {
      if (toLeft) {
        currentX = startX - i;
      }
      else {
        currentX = startX + i;
      }
      currentY = startY + i;

      if (currentX < 0) {
        break;
      }
      if (currentY < 0) {
        break;
      }
      if (currentX >= this.width) {
        break;
      }
      if (currentY >= this.height) {
        break;
      }
      buffer.push(this.get(currentX, currentY));
    }
    return buffer.join('').toUpperCase();
  }

  mark(x, y, computer = false) {
    if (x < 0) {
      return this;
    }
    if (y < 0) {
      return this;
    }
    if (x >= this.width) {
      return this;
    }
    if (y >= this.height) {
      return this;
    }
    if (this.done) {
      return this;
    }

    let index = this.coordinatesToIndex(x, y),
        marker = this.playerMarker;
    if (computer) {
      marker = this.computerMarker;
    }

    if (this.cells.charAt(index) == BLANK_MARKER) {
      return new Board(this.width, this.height, this.length, this.playerMarker, this.computerMarker,
                       Board.replaceCharAt(this.cells, index, marker));
    }
    else {
      return this;
    }
  }
  score(x, y) {
    if (x < 0) {
      return 0;
    }
    if (y < 0) {
      return 0;
    }
    if (x >= this.width) {
      return 0;
    }
    if (y >= this.height) {
      return 0;
    }
    if (this.get(x, y) != BLANK_MARKER) {
      return 0;
    }

    let directions = [],
        playerWinCondition = this.playerWinCondition,
        computerWinCondition = this.computerWinCondition,
        score = 0;
    directions.push(Board.replaceCharAt(this.rows[y], x, TEST_MARKER));
    directions.push(Board.replaceCharAt(this.columns[x], y, TEST_MARKER));
    directions.push(Board.replaceCharAt(this.getDiagonal(x, y), Math.min(x, y), TEST_MARKER));
    directions.push(Board.replaceCharAt(this.getDiagonal(x, y, true), Math.min(this.width - 1 - x, y), TEST_MARKER));

    for (let direction of directions) {
      let computerTake = direction.replace(TEST_MARKER, this.computerMarker),
          playerTake = direction.replace(TEST_MARKER, this.playerMarker);
      //console.log(x, y, '"' + direction + '"');

      if (computerTake.includes(computerWinCondition)) {
        // If taking the spot results in a win, then prioritize this spot
        score += 1000;
      }
      if (playerTake.includes(playerWinCondition)) {
        // If the player taking the spot results in a win, then block it
        score += 100;
      }
      if (direction.includes(this.playerMarker)) {
        if (!direction.includes(this.computerMarker)) {
          score += 1;
        }
      }
      else {
        if (direction.length >= this.length) {
          if (direction.includes(this.computerMarker)) {
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
  computerMove() {
    if (this.done) {
      return this;
    }

    let scores = [],
        loss = null;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.get(x, y) == BLANK_MARKER) {
          let index = this.coordinatesToIndex(x, y),
              playerBoard = new Board(this.width, this.height, this.length, this.playerMarker, this.computerMarker,
                                      Board.replaceCharAt(this.cells, index, this.playerMarker)),
              computerBoard = new Board(this.width, this.height, this.length, this.playerMarker, this.computerMarker,
                                        Board.replaceCharAt(this.cells, index, this.computerMarker));
          if (computerBoard.computerWin) {
            // If this move results in a win, then make it immediately
            return this.mark(x, y, true);
          }
          if (playerBoard.playerWin) {
            // If letting player have this move results in a loss, then remember to block it
            // We don't make the move immediately in case we find a winning move later
            loss = {x: x, y: y};
          }
          else if (loss == null) {
            // Only lookahead if we don't need to block
            let [O_count, X_count, draw_count] = Board.lookahead(computerBoard, this.playerMarker);
            if (this.computerMarker == O_MARKER) {
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
      return this.mark(loss.x, loss.y, true);
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
    return this.mark(scores[0].x, scores[0].y, true);
  }


  /*
   * Return true if state is a valid board state.
   */
  static is_valid_state(state) {
    if (typeof state == 'string') {
      for (let c of Array.from(state)) {
        if (!STATE_SET.has(c)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  /*
   * Lookahead to all possible moves and return the number of wins for each marker.
   */
  static lookahead(board, marker) {
    if (board.playerWin) {
      if (board.playerMarker == O_MARKER) {
        return [1, 0, 0];
      }
      else {
        return [0, 1, 0];
      }
    }
    if (board.computerWin) {
      if (board.computerMarker == O_MARKER) {
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
    let opposing = O_MARKER,
        O_total = 0,
        X_total = 0,
        draw_total = 0;
    if (marker == O_MARKER) {
      opposing = X_MARKER;
    }
    for (let i = 0; i < board.cells.length; i++) {
      let c = board.cells.charAt(i);
      if (c == BLANK_MARKER) {
        let move = new Board(board.width, board.height, board.length, board.playerMarker, board.computerMarker,
                             Board.replaceCharAt(board.cells, i, marker)),
            [O_count, X_count, draw_count] = Board.lookahead(move, opposing);
        O_total += O_count;
        X_total += X_count;
        draw_total += draw_count;
      }
    }
    return [O_total, X_total, draw_total];
  }

  /*
   * Replace the character at str[index] with replacement.
   */
  static replaceCharAt(str, index, replacement) {
    if (index < 0) {
      return str;
    }
    if (str.length <= index) {
      return str;
    }
    if (replacement.length > 1) {
      replacement = replacement.substring(0, 1);
    }
    return str.substring(0, index) + replacement + str.substring(index + 1);
  }

  /*
   * A short test suite to confirm the Board class works.
   */
  static test() {
    console.assert(!Board.is_valid_state(null),
                   {msg: 'Board.is_valid_state() failed.'});
    console.assert(!Board.is_valid_state(undefined),
                   {msg: 'Board.is_valid_state() failed.'});
    console.assert(!Board.is_valid_state('foobar'),
                   {msg: 'Board.is_valid_state() failed.'});
    console.assert(!Board.is_valid_state(`foobar`),
                   {msg: 'Board.is_valid_state() failed.'});
    console.assert(!Board.is_valid_state('foo bar'),
                   {msg: 'Board.is_valid_state() failed.'});
    console.assert(Board.is_valid_state(''),
                   {msg: 'Board.is_valid_state() failed.'});
    console.assert(Board.is_valid_state('X O'),
                   {msg: 'Board.is_valid_state() failed.'});
    console.assert(Board.is_valid_state('XOXO'),
                   {msg: 'Board.is_valid_state() failed.'});
    console.assert(Board.is_valid_state(`XO XO`),
                   {msg: 'Board.is_valid_state() failed.'});

    for (let values of [
      Board.lookahead(new Board(3, 3, 3, X_MARKER, O_MARKER, 'X        '), O_MARKER),
      Board.lookahead(new Board(3, 3, 3, X_MARKER, O_MARKER, '  X      '), O_MARKER),
      Board.lookahead(new Board(3, 3, 3, X_MARKER, O_MARKER, '      X  '), O_MARKER),
      Board.lookahead(new Board(3, 3, 3, X_MARKER, O_MARKER, '        X'), O_MARKER)]) {
      console.assert(values[0] == 7896,
                     {msg: 'Board.lookahead() failed.'});
      console.assert(values[1] == 14652,
                     {msg: 'Board.lookahead() failed.'});
      console.assert(values[2] == 5184,
                     {msg: 'Board.lookahead() failed.'});
    }
    let values = Board.lookahead(new Board(3, 3, 3, X_MARKER, O_MARKER, '    X    '), O_MARKER);
    console.assert(values[0] == 5616,
                   {msg: 'Board.lookahead() failed.'});
    console.assert(values[1] == 15648,
                   {msg: 'Board.lookahead() failed.'});
    console.assert(values[2] == 4608,
                   {msg: 'Board.lookahead() failed.'});
    values = Board.lookahead(new Board(3, 3, 3, X_MARKER, O_MARKER, 'OOO X    '), O_MARKER);
    console.assert(values[0] == 1,
                   {msg: 'Board.lookahead() failed.'});
    console.assert(values[1] == 0,
                   {msg: 'Board.lookahead() failed.'});
    console.assert(values[2] == 0,
                   {msg: 'Board.lookahead() failed.'});
    values = Board.lookahead(new Board(3, 3, 3, X_MARKER, O_MARKER, 'OO XXX   '), O_MARKER);
    console.assert(values[0] == 0,
                   {msg: 'Board.lookahead() failed.'});
    console.assert(values[1] == 1,
                   {msg: 'Board.lookahead() failed.'});
    console.assert(values[2] == 0,
                   {msg: 'Board.lookahead() failed.'});
    values = Board.lookahead(new Board(3, 3, 3, X_MARKER, O_MARKER, 'OXXXXOOOX'), O_MARKER);
    console.assert(values[0] == 0,
                   {msg: 'Board.lookahead() failed.'});
    console.assert(values[1] == 0,
                   {msg: 'Board.lookahead() failed.'});
    console.assert(values[2] == 1,
                   {msg: 'Board.lookahead() failed.'});

    console.assert(Board.replaceCharAt('foo', -1, 'F') == 'foo',
                   {msg: 'Board.replaceCharAt() failed.'});
    console.assert(Board.replaceCharAt('foo', 3, 'F') == 'foo',
                   {msg: 'Board.replaceCharAt() failed.'});
    console.assert(Board.replaceCharAt('foo', 0, 'F') == 'Foo',
                   {msg: 'Board.replaceCharAt() failed.'});
    console.assert(Board.replaceCharAt('foo', 0, 'b') == 'boo',
                   {msg: 'Board.replaceCharAt() failed.'});
    console.assert(Board.replaceCharAt('foo', 2, 'b') == 'fob',
                   {msg: 'Board.replaceCharAt() failed.'});
    console.assert(Board.replaceCharAt('foo', 0, 'ba') == 'boo',
                   {msg: 'Board.replaceCharAt() failed.'});
    console.assert(Board.replaceCharAt('foo', 2, 'bar') == 'fob',
                   {msg: 'Board.replaceCharAt() failed.'});

    for (let board of [
      new Board(3, 4, 5, X_MARKER, O_MARKER),
      new Board(3, 4, 5, X_MARKER, O_MARKER, ''),
      new Board(3, 4, 5, X_MARKER, O_MARKER, 'foobar baz'),
      new Board(3, 4, 5, X_MARKER, O_MARKER, 'XOXO')]) {
      console.assert(board.width == 3,
                     {msg: 'board has wrong width.'});
      console.assert(board.height == 4,
                     {msg: 'board has wrong height.'});
      console.assert(board.length == 5,
                     {msg: 'board has wrong length.'});
      console.assert(board.playerMarker == X_MARKER,
                     {msg: 'board has wrong marker.'});
      console.assert(board.computerMarker == O_MARKER,
                     {msg: 'board has wrong marker.'});
      console.assert(!board.playerWin,
                     {msg: 'board unexpectedly done.'});
      console.assert(!board.computerWin,
                     {msg: 'board unexpectedly done.'});
      console.assert(!board.done,
                     {msg: 'board unexpectedly done.'});
      console.assert(board.cells == BLANK_MARKER.repeat(12),
                     {msg: 'board.cells not initialized.'});
      for (let x = -1; x <= board.width; x++) {
        for (let y = -1; y <= board.height; y++) {
          console.assert(board.get(x, y) == BLANK_MARKER,
                         {msg: 'board.get() failed.'});
        }
      }
      console.assert(board.playerWinCondition == X_MARKER.repeat(5),
                     {msg: 'board.playerWinCondition is incorrect.'});
      console.assert(board.computerWinCondition == O_MARKER.repeat(5),
                     {msg: 'board.computerWinCondition is incorrect.'});
      console.assert(board.rows.length == 4,
                     {msg: 'board.rows is incorrect.'});
      console.assert(board.rows.every(v => (v == BLANK_MARKER.repeat(3))),
                     {msg: 'board.rows is incorrect.'});
      console.assert(board.columns.length == 3,
                     {msg: 'board.columns is incorrect.'});
      console.assert(board.columns.every(v => (v == BLANK_MARKER.repeat(4))),
                     {msg: 'board.columns is incorrect.'});
    }

    let board = new Board(3, 3, 3, O_MARKER, X_MARKER);
    console.assert(board.width == 3,
                   {msg: 'board has wrong width.'});
    console.assert(board.height == 3,
                   {msg: 'board has wrong height.'});
    console.assert(board.length == 3,
                   {msg: 'board has wrong length.'});
    console.assert(board.playerMarker == O_MARKER,
                   {msg: 'board has wrong marker.'});
    console.assert(board.computerMarker == X_MARKER,
                   {msg: 'board has wrong marker.'});
    console.assert(!board.playerWin,
                   {msg: 'board unexpectedly done.'});
    console.assert(!board.computerWin,
                   {msg: 'board unexpectedly done.'});
    console.assert(!board.done,
                   {msg: 'board unexpectedly done.'});
    console.assert(board.cells == BLANK_MARKER.repeat(9),
                   {msg: 'board.cells not initialized.'});
    for (let x = -1; x <= board.width; x++) {
      for (let y = -1; y <= board.height; y++) {
        console.assert(board.get(x, y) == BLANK_MARKER,
                       {msg: 'board.get() failed.'});
      }
    }
    console.assert(board.playerWinCondition == O_MARKER.repeat(3),
                   {msg: 'board.playerWinCondition is incorrect.'});
    console.assert(board.computerWinCondition == X_MARKER.repeat(3),
                   {msg: 'board.computerWinCondition is incorrect.'});
    console.assert(board.rows.length == 3,
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows.every(v => (v == BLANK_MARKER.repeat(3))),
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.columns.length == 3,
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns.every(v => (v == BLANK_MARKER.repeat(3))),
                   {msg: 'board.columns is incorrect.'});
    board.cells = Board.replaceCharAt(board.cells, 0, O_MARKER);
    board.cells = Board.replaceCharAt(board.cells, 4, X_MARKER);
    console.assert(board.cells == 'O   X    ',
                   {msg: 'board.cells is incorrect.'});
    for (let x = -1; x <= board.width; x++) {
      let expected = BLANK_MARKER;
      for (let y = -1; y <= board.height; y++) {
        if ((x == 0) && (y == 0)) {
          expected = O_MARKER;
        }
        else if ((x == 1) && (y == 1)) {
          expected = X_MARKER;
        }
        else {
          expected = BLANK_MARKER;
        }
        console.assert(board.get(x, y) == expected,
                       {msg: 'board.get() failed.'});
      }
    }
    console.assert(board.rows.length == 3,
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[0] == 'O  ',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[1] == ' X ',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[2] == '   ',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.columns.length == 3,
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[0] == 'O  ',
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[1] == ' X ',
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[2] == '   ',
                   {msg: 'board.columns is incorrect.'});
    for (let [x, y, expected] of [
      [0, 0, 'OX '],
      [1, 0, '  '],
      [2, 0, ' '],
      [0, 1, '  '],
      [1, 1, 'OX '],
      [2, 1, '  '],
      [0, 2, ' '],
      [1, 2, '  '],
      [2, 2, 'OX ']]) {
      console.assert(board.getDiagonal(x, y) == expected,
                     {msg: 'board.getDiagonal() failed.'});
      console.assert(board.getDiagonal(x, y, false) == expected,
                     {msg: 'board.getDiagonal() failed.'});
    }
    for (let [x, y, expected] of [
      [0, 0, 'O'],
      [1, 0, '  '],
      [2, 0, ' X '],
      [0, 1, '  '],
      [1, 1, ' X '],
      [2, 1, '  '],
      [0, 2, ' X '],
      [1, 2, '  '],
      [2, 2, ' ']]) {
      console.assert(board.getDiagonal(x, y, true) == expected,
                     {msg: 'board.getDiagonal() failed.'});
    }
    console.assert(board.score(0, 0) == 0,
                   {msg: 'board.score() failed.'});
    console.assert(board.score(1, 1) == 0,
                   {msg: 'board.score() failed.'});
    console.assert(board.score(1, 0) == 11,
                   {msg: 'board.score() failed.'});
    console.assert(board.score(2, 0) == 13,
                   {msg: 'board.score() failed.'});
    console.assert(board.score(1, 2) == 12,
                   {msg: 'board.score() failed.'});

    console.assert(board.mark(-1, 0, false) == board,
                   {msg: 'board.mark() failed.'});
    console.assert(board.mark(0, 0, false) == board,
                   {msg: 'board.mark() failed.'});
    console.assert(board.mark(0, -1, false) == board,
                   {msg: 'board.mark() failed.'});
    console.assert(board.mark(1, 1, true) == board,
                   {msg: 'board.mark() failed.'});
    console.assert(board.mark(board.width, 0, false) == board,
                   {msg: 'board.mark() failed.'});
    console.assert(board.mark(0, board.height, false) == board,
                   {msg: 'board.mark() failed.'});

    board = board.mark(2, 0, true);
    board = board.mark(0, 2, false);
    console.assert(!board.playerWin,
                   {msg: 'board unexpectedly done.'});
    console.assert(!board.computerWin,
                   {msg: 'board unexpectedly done.'});
    console.assert(!board.done,
                   {msg: 'board unexpectedly done.'});
    console.assert(board.cells == 'O X X O  ',
                   {msg: 'board.cells is incorrect.'});
    console.assert(board.rows.length == 3,
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[0] == 'O X',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[1] == ' X ',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[2] == 'O  ',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.columns.length == 3,
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[0] == 'O O',
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[1] == ' X ',
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[2] == 'X  ',
                   {msg: 'board.columns is incorrect.'});
    for (let [x, y, expected] of [
      [0, 0, 'OX '],
      [1, 0, '  '],
      [2, 0, 'X'],
      [0, 1, '  '],
      [1, 1, 'OX '],
      [2, 1, '  '],
      [0, 2, 'O'],
      [1, 2, '  '],
      [2, 2, 'OX ']]) {
      console.assert(board.getDiagonal(x, y) == expected,
                     {msg: 'board.getDiagonal() failed.'});
      console.assert(board.getDiagonal(x, y, false) == expected,
                     {msg: 'board.getDiagonal() failed.'});
    }
    for (let [x, y, expected] of [
      [0, 0, 'O'],
      [1, 0, '  '],
      [2, 0, 'XXO'],
      [0, 1, '  '],
      [1, 1, 'XXO'],
      [2, 1, '  '],
      [0, 2, 'XXO'],
      [1, 2, '  '],
      [2, 2, ' ']]) {
      console.assert(board.getDiagonal(x, y, true) == expected,
                     {msg: 'board.getDiagonal() failed.'});
    }

    board = board.mark(2, 1, true);
    board = board.mark(0, 1, false);
    console.assert(board.cells == 'O XOXXO  ',
                   {msg: 'board.cells is incorrect.'});
    console.assert(board.playerWin,
                   {msg: 'board unexpectedly not done.'});
    console.assert(!board.computerWin,
                   {msg: 'board unexpectedly not done.'});
    console.assert(board.done,
                   {msg: 'board unexpectedly not done.'});
    console.assert(board.rows.length == 3,
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[0] == 'O X',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[1] == 'OXX',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.rows[2] == 'O  ',
                   {msg: 'board.rows is incorrect.'});
    console.assert(board.columns.length == 3,
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[0] == 'OOO',
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[1] == ' X ',
                   {msg: 'board.columns is incorrect.'});
    console.assert(board.columns[2] == 'XX ',
                   {msg: 'board.columns is incorrect.'});
    for (let [x, y, expected] of [
      [0, 0, 'OX '],
      [1, 0, ' X'],
      [2, 0, 'X'],
      [0, 1, 'O '],
      [1, 1, 'OX '],
      [2, 1, ' X'],
      [0, 2, 'O'],
      [1, 2, 'O '],
      [2, 2, 'OX ']]) {
      console.assert(board.getDiagonal(x, y) == expected,
                     {msg: 'board.getDiagonal() failed.'});
      console.assert(board.getDiagonal(x, y, false) == expected,
                     {msg: 'board.getDiagonal() failed.'});
    }
    for (let [x, y, expected] of [
      [0, 0, 'O'],
      [1, 0, ' O'],
      [2, 0, 'XXO'],
      [0, 1, ' O'],
      [1, 1, 'XXO'],
      [2, 1, 'X '],
      [0, 2, 'XXO'],
      [1, 2, 'X '],
      [2, 2, ' ']]) {
      console.assert(board.getDiagonal(x, y, true) == expected,
                     {msg: 'board.getDiagonal() failed.'});
    }
  }
}
