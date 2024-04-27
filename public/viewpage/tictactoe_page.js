import { routePath } from '../controller/route.js';
import * as Elements from './elements.js';
import { currentUser } from '../controller/firebase_auth.js';
import { unauthorizedAccess } from './unauthorized_access.js';
import { TicTacToeGame, marking } from '../modal/tictactoe_game.js';
import { info } from './util.js';
import { addTicTacToeGameHistory, getTicTacToeGameHistory } from '../controller/firestore_controller.js';
import { DEV } from '../modal/constants.js'

export function addEventListener() {

    Elements.menus.tictactoe.addEventListener('click', () => {
        // to prevent reload or to maintain singlepage application
        history.pushState(null, null, routePath.TICTACTOE); 
        tictactoe_page();
    });
}

let gameModal;
let screen = {
    turn: null,
    moves: null,
    buttons: null,
    images: null,
    newGameButton: null,
    historyButton: null,
    clearButton: null,
    statusMessage: null,
}

const imageSource = {
    X: 'images/X.png',
    U: 'images/U.png',
    O: 'images/O.png',
}

export async function tictactoe_page() {
    if(!currentUser) {
        Elements.root.innerHTML = unauthorizedAccess();
        return;
    }
    
    gameModal =  new TicTacToeGame();
    let html ;
    const response = await fetch('./viewpage/templates/tictactoe_page.html', {cache: 'no-store'});
    html = await response.text();
    Elements.root.innerHTML = html;

    getScreenElements();
    addGameEvents();
    updateScreen();

}

function addGameEvents() {
    for( let i=0; i<9;i++) {
        screen.buttons[i].addEventListener('click', buttonPressListener);
    }

    screen.newGameButton.addEventListener('click', () => {
        gameModal = new TicTacToeGame();
        updateScreen();
    });

    screen.historyButton.addEventListener('click', historyButtonEvent);
    screen.clearButton.addEventListener('click', () => {
        gameModal.status = '';
        updateScreen();
    });
}

async function buttonPressListener(event) {
    const buttonId = event.target.id;
    const pos = buttonId[buttonId.length -1];
    gameModal.board[pos] = gameModal.turn;
    gameModal.toggleTurns();
    gameModal.moves++;


    gameModal.setWinner();
    if(gameModal.winner != null) {
        if(gameModal.winner == marking.U) {
            gameModal.status = 'Game Over : DRAW';
        } else {
            gameModal.status = `
                Game Over - Winner: ${marking[gameModal.winner]} with
                    ${gameModal.moves} moves
                `;
        }
        updateScreen();
        const gamePlay = {
            email: currentUser.email,
            winner: gameModal.winner,
            moves: gameModal.moves,
            timestamp: Date.now(),
        }
        try {
            await addTicTacToeGameHistory(gamePlay);
            info('Game Over', gameModal.status);
        } catch (e) {
            info('Game Over', `Failed to save the game play history ${e}` );
            if(DEV) console.log('Game Over: failed to save', e);
        }
        info('Game Over', gameModal.status);
    } else {
    updateScreen();
    }
}


function getScreenElements() {
    screen.turn = document.getElementById('turn');
    screen.moves = document.getElementById('moves');
    screen.buttons = [];
    screen.images = [];
    for(let i=0;i<9;i++) {
        screen.buttons.push(document.getElementById(`button-${i}`));
        screen.images.push(document.getElementById(`image-${i}`));

    }
    screen.newGameButton = document.getElementById('button-new-game');
    screen.historyButton = document.getElementById('button-history');
    screen.clearButton = document.getElementById('button-clear');
    screen.statusMessage = document.getElementById('status-message');
}

function updateScreen() {
    //mapping from modal to screen
    screen.turn.src = imageSource[gameModal.turn];
    screen.moves.innerHTML = gameModal.moves;

    for( let i=0; i<9; i++) {
        screen.images[i].src = imageSource[gameModal.board[i]];
        screen.buttons[i].disabled = gameModal.board[i] != marking.U 
                || gameModal.winner != null;

    }

    screen.newGameButton.disabled = gameModal.winner == null;
    screen.statusMessage.innerHTML = gameModal.status;
}

async function historyButtonEvent() {
    let history;
    try {
        history = await getTicTacToeGameHistory(currentUser.email);
        let html= `
            <table class="table table-success table-striped">
            <tr><th>Winner</th><th>Moves</th><th>Date</th></tr>
            <body>
        `;
        for(let i=0;i< history.length;i++) {
            html +=`
            <tr>
                <td>
                    ${history[i].winner == marking.U ? 'Draw' : history[i].winner}
                </td>
                <td>
                    ${history[i].moves}
                </td>
                <td>
                    ${new Date(history[i].timestamp).toString()}
                </td>
            </tr>`;
        }

        html += '</body></table>';
        gameModal.status =html;
        updateScreen();
    } catch (e) {
       if(DEV) console.log('ERROR: History button', e);
       info('failed to get game history', JSON.stringify(e));
    }

}