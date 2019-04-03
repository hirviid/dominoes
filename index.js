const vorpal = require('vorpal')();

const dominoes = [
  [0,0],
  [0,1],
  [0,2],
  [0,3],
  [0,4],
  [1,1],
  [1,2],
  [1,3],
  [1,4],
  [2,2],
  [2,3],
  [2,4],
  [3,3],
  [3,4],
  [4,4],
];
let computerDominos = [
  [0,3],
  [1,2],
  [2,2],
  [2,3],
  [0,4],
  [1,4],
  [3,4],
];
let playerDominoes = [
  [0,0],
  [0,2],
  [1,1],
  [1,3],
  [2,4],
  [3,3],
  [4,4],
];
let gameBoard = [[0,1]];

function invertDomino(domino) {
  return [domino[1], domino[0]];
}
function matchesLast(domino) {
  return domino[0] === gameBoard[gameBoard.length - 1][1];
}
function matchesFirst(domino) {
  return domino[1] === gameBoard[0][0];
}
function dominoesAreEqual(domino1, domino2) {
  return (domino1[0] === domino2[0] && domino1[1] === domino2[1])
    || (domino1[1] === domino2[0] && domino1[0] === domino2[1]);
}
function stringifyDominoes(dominoes) {
  return dominoes.reduce((str, domino) => {
    return str + domino[0] + ' ' + domino[1] + '|';
  }, '|');
}
function stringifyDominoPositions(dominoes) {
  return dominoes.reduce((str, domino, index) => {
    return str + ' (' + (index+1) + ')';
  }, '');
}
function stringifyDominoPositionsCS(dominoes) {
  return dominoes.reduce((str, domino, index) => {
    return str + '' + (index+1) + ((index < dominoes.length - 1) ? ', ' : ')');
  }, '(');
}

function nextTurn() {
  vorpal.log('> GAME BOARD');
  vorpal.log(stringifyDominoes(gameBoard));
  vorpal.log('> Your dominoes');
  vorpal.log(stringifyDominoes(playerDominoes));
  vorpal.log(stringifyDominoPositions(playerDominoes));
  vorpal.log('> Pick a domino ' + stringifyDominoPositionsCS(playerDominoes));
}

function validateInput(dominoIndex) {
  if (dominoIndex > playerDominoes.length - 1 || dominoIndex < 0) {
    vorpal.log('> Oops, please give a number between 1 and ' +playerDominoes.length);
    return false;
  }

  const domino = playerDominoes[dominoIndex];

  if (!matchesFirst(domino) && !matchesLast(domino)) {
    const invertedDomino = invertDomino(domino);
    if (!matchesFirst(invertedDomino) && !matchesLast(invertedDomino)) {
      vorpal.log('> Oops, domino doesn\'t match the start nor the end of the game board');
      return false;
    }
    return invertedDomino;
  }

  return domino;
}

function updateGameBoard(domino) {
  if (matchesFirst(domino)) {
    gameBoard = [domino, ...gameBoard];
  } else if (matchesLast(domino)) {
    gameBoard = [...gameBoard, domino];
  } else {
    // throw new Error('Invalid domino');
    return;
  }

  playerDominoes = playerDominoes.reduce((newHands, playerDomino) => {
    if (!dominoesAreEqual(playerDomino, domino)) {
      return [...newHands, playerDomino];
    }
    return newHands;
  }, []);

  computerDominos = computerDominos.reduce((newHands, computerDomino) => {
    if (!dominoesAreEqual(computerDomino, domino)) {
      return [...newHands, computerDomino];
    }
    return newHands;
  }, []);
}

function checkEndGame() {
  if (playerDominoes.length === 0) {
    vorpal.log('> You won!');
    vorpal.log('> Final Game Board');
    vorpal.log(stringifyDominoes(gameBoard));
    vorpal.log('> Computer dominoes');
    vorpal.log(stringifyDominoes(computerDominos));
    return true;
  }
  if (playerDominoes.length === 0) {
    vorpal.log('> You lose!');
    return true;
  }
  return false;
}

function computersTurn() {
  let selected = [-1, -1];
  // 1. Try to get rid of doubles (unless last of kind)

  // 2. Try to get rid of whichever domino kind occurs the most

  // 3. Find anything that matches

  computerDominos.find((domino) => {
    if (matchesFirst(domino) || matchesLast(domino)) {
      selected = domino;
      return true;
    }
    const inverted = invertDomino(domino);
    if (matchesFirst(inverted) || matchesLast(inverted)) {
      selected = inverted;
      return true;
    }
    return false;
  });

  updateGameBoard(selected);
}

vorpal
  .command('skip')
  .action(function(args, callback) {
    computersTurn();
    const computerEndGame = checkEndGame();
    if (!computerEndGame) {
      nextTurn();
    }
    callback();
  });

vorpal
  .command('play <dominoIndex>')
  .action(function(args, callback) {
    const dominoIndex = parseInt(args.dominoIndex, 10) - 1;

    const domino = validateInput(dominoIndex);

    if (domino) {
      updateGameBoard(domino);
      const userEndGame = checkEndGame();
      if (!userEndGame) {
        computersTurn();
        const computerEndGame = checkEndGame();
        if (!computerEndGame) {
          nextTurn();
        }
      }
    }

    callback();
  });


vorpal
  .delimiter('$')
  .show();


nextTurn();


