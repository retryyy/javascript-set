// helper
function sleep(ms) {
    return new Promise((accept) => {
        setTimeout(() => {
            accept();
        }, ms);
    });
}

// DOM
let welcome = document.querySelector('#welcome');
let sidebarClick = document.querySelector('#sidebarClick');
let sidebar = document.querySelector('#sidebar');
let menu = document.querySelector('#menu');
let menuClose = menu.querySelector('.close');
let start = menu.querySelector('#start');
let settings = menu.querySelector('#settings');
let playerName = menu.querySelector('#player-name');
let playerInput = playerName.querySelector('#player-name-input');
let proceed = playerName.querySelector('#proceed');
let stepper = document.querySelector('#stepper');
let logo = document.querySelector('#logo');
let game = document.querySelector('#game');
let layout = document.querySelector('#layout');
let players = layout.querySelector('#players');
let board = game.querySelector('#cards-board');
let boardContainer = board.querySelector('#board');
let cards = board.querySelectorAll('.card');
let timer = game.querySelector('#timer');

let gameOngoing = false;
let choosing = false;
let activePlayer;
let nrOfPlayers = 1;
let nrOfInstantiatedPlayers = 0;
let playersInfo = [];

let mode = "";

// load
loadPage();
async function loadPage() {
    welcome.classList.add('appear');

    let elements = document.body.getElementsByTagName('div');
    for (elem of elements) {
        elem.classList.add('hidden');
    }
    await sleep(000);

    sidebarClick.classList.add('opened');
    sidebar.classList.add('opened');
    sidebarClick.firstElementChild.classList.add('click');
    
    game.classList.toggle('hidden');
    menu.classList.remove('appear');
    layout.classList.remove('appear');
    logo.classList.add('appear');
    welcome.classList.add('disappear');
    resetMenu();
    settings.classList.add('appear');
    
    for (elem of elements) {
        elem.classList.remove('hidden');
    }
}

// timer ///////////////////////////////////////////////////////////////////////////////
let acted = true;
let sec = 10;
async function countDown() {
	refreshTimer();
	sec -= .01;
	if (sec >= 0) {
        if (!acted) {
            if (sec < 4) {
                timer.classList.add('last-secs');
            }
            setTimeout(countDown, 10);
        }
	} else {
        cards.forEach(card => card.classList.remove('active'));
        board.classList.remove('unlock');
        playersInfo[activePlayer].score -= 1;
        
        startNewRound();
    }
}

function refreshTimer() {
    timer.style.width = (sec * 100 / 10) + "%";
}

// game
players.addEventListener('click', (item) => {
    if (!choosing) {
        players.querySelectorAll('div').forEach(plate => {
            plate.classList.remove('lock');
        });
        board.classList.add('unlock');

        choosing = true;
        acted = false;
        setTimeout(countDown, 0);

        let td = item.target.parentElement;
        td.classList.toggle('active');

        activePlayer = td.parentElement.rowIndex;
    }
});

// cards
addCardEventListener(cards);
function addCardEventListener(cs) {
    cs.forEach(card => card.removeEventListener('click', cardEvent));
    cs.forEach(card => card.addEventListener('click', cardEvent));
}

function cardEvent() {
    if (choosing) {
        this.classList.toggle('active');
        exchange();
    }
}

async function exchange() {
    let tickedCards = document.querySelectorAll('.card.active');
    if (tickedCards.length == 3) {
        cards = board.querySelectorAll('.card');
        await checkSet(tickedCards);
        
        board.classList.remove('unlock');
        playersInfo[activePlayer].score += 1;

        startNewRound();
    }
}

async function startNewRound() {
    timer.classList.add('load');
    Array.from(players.querySelectorAll('tr')).forEach(player => player.classList.remove('active'));
    sec = 10;
    refreshTimer();
    refreshPlayersTable()
    timer.classList.remove('last-secs')

    await sleep(1000);

    timer.classList.remove('load');
    
    players.querySelectorAll('div').forEach(plate => {
        plate.classList.remove('lock');
    });

    choosing = false;
}

async function moveOut(tickedCards) {
    tickedCards.forEach(card => card.firstElementChild.src = "icons/2HrS.svg");
    let bounds = board.getBoundingClientRect();
    let half = (bounds.top + bounds.bottom) / 2;
    
    tickedCards.forEach(card => {
        let cHalf = (card.getBoundingClientRect().top + card.getBoundingClientRect().bottom) / 2;
        card.style.transform = `translate(${(half - cHalf)}px, ${document.documentElement.scrollWidth + board.getBoundingClientRect().width / 3}px) scale(3)`;
    });
    await sleep(500);
    tickedCards.forEach(card => card.classList.remove('fade'));
}

async function moveBack(tickedCards) {
    tickedCards.forEach(card => card.classList.add('trans'));
    for (let card of tickedCards) {
        card.style.transform = "translate(0px, 0px)";
        await sleep(200);
    };
    await sleep(1000);
    tickedCards.forEach(card => card.style.transform = "");
    tickedCards.forEach(card => card.classList.remove('trans'));
}

////////////////////////////////////////////////////////////////////////////////////////

// sidebar
sidebarClick.addEventListener('click', () => {
    if (gameOngoing) {
        sidebarClick.classList.toggle('opened');
        sidebar.classList.toggle('opened');
        sidebarClick.firstElementChild.classList.toggle('click');

        if (sidebar.classList.contains('opened')) {
            menu.classList.remove('appear');
            layout.classList.remove('appear');
            logo.classList.add('appear');
        } else {
            layout.classList.add('appear');
            logo.classList.remove('appear');
        }
    }  
});

// menu
sidebar.querySelector('#new').addEventListener('click', () => {
    menu.classList.toggle('appear');
    sidebarClick.classList.toggle('opened');
    sidebar.classList.toggle('opened');
    sidebarClick.firstElementChild.classList.remove('click');

    layout.classList.remove('appear');
    logo.classList.remove('appear');
});

// start
start.addEventListener('click', () => {
    nrOfPlayers = stepper.value;
    playerName.querySelector('label span').innerText = 1;
    players.style.height = `calc(100% * ${nrOfPlayers} / 10)`;
    players.innerHTML = "";
    settings.classList.remove('appear');
    playerName.classList.add('appear');
});

start.addEventListener('transitionend', () => playerInput.focus());

//proceed
proceed.addEventListener('click', () => {
    let name = playerInput.value;
    if (!isValidInput(name)) return;

    addPlayer(name);
    playerInput.value = "";
    nrOfInstantiatedPlayers++;

    if (nrOfInstantiatedPlayers == nrOfPlayers) {
        refreshPlayersTable();

        menu.classList.remove('appear');
        layout.classList.add('appear');
        resetMenu();
        settings.classList.add('appear');
        playerName.classList.remove('appear');

        gameOngoing = true;
        return;
    }
    playerName.querySelector('label span').innerText = nrOfInstantiatedPlayers + 1;
})

function addPlayer(name) {
    playersInfo[nrOfInstantiatedPlayers] = {'name': name, 'score': 0};
}

function refreshPlayersTable() {
    players.innerHTML = "";
    playersInfo.sort((a, b) => b.score - a.score);

    for (player of playersInfo) {
        let p = document.createElement('tr');
        p.innerHTML = '<td><div>' + player.name + '</div><div>'+ player.score + '</div></td>';
        p.setAttribute('id', player.name);
        players.appendChild(p);
    }
}

function isValidInput(input) {
    if (input.length <= 0) return false;
    for (player of playersInfo) {
        if (input == player.name) return false;
    }
    return true;
}

menuClose.addEventListener('click', async () => {
    logo.classList.add('appear');

    menu.classList.remove('appear');
    sidebarClick.classList.add('opened');
    sidebar.classList.add('opened');
    sidebarClick.firstElementChild.classList.add('click');

    await sleep(500);

    resetMenu();
    settings.classList.add('appear');
    playerName.classList.remove('appear');
})

function resetMenu() {
    stepper.value = 1;
    nrOfPlayers = 1;
    nrOfInstantiatedPlayers = 0;
    playerInput.value = "";
}

// spinner
var inc = document.getElementsByClassName("stepper");
for (i = 0; i < inc.length; i++) {
    var incI = inc[i].querySelector("input"),
        id = incI.getAttribute("id"),
        min = incI.getAttribute("min"),
        max = incI.getAttribute("max"),
        step = incI.getAttribute("step");
    document.getElementById(id).previousElementSibling.setAttribute('onclick', "stepperInput('" + id + "', -" + step + ", " + min + ")"); 
    document.getElementById(id).nextElementSibling.setAttribute('onclick', "stepperInput('" + id + "', " + step + ", " + max + ")"); 
}

function stepperInput(id, s, m) {
    var el = document.getElementById(id);
    if (s > 0 &&  parseInt(el.value) < m) {
        el.value = parseInt(el.value) + s;
    } else if (parseInt(el.value) > m) {
        el.value = parseInt(el.value) + s;
    }
}

async function checkSet(tickedCards) {
    acted = true;
    let arr = Array.from(cards);
    let removed = [arr.indexOf(tickedCards[0]), arr.indexOf(tickedCards[1]), arr.indexOf(tickedCards[2])];

    await sleep(1000);
    tickedCards.forEach(card => {
        card.classList.add('fade');
        card.classList.remove('active');
    });

    if (mode == "") {
        await sleep(1000);
        await moveOut(tickedCards);
        await sleep(500);
        await moveBack(tickedCards);
        return true;
    }

    await sleep(1000);
    let fadings;
    let oldMode = mode;
    if (mode == 'twenty-one') {
        fadings = [6, 13, 20];
        mode = 'eighteen'
    } else if (mode == 'eighteen') {
        fadings = [5, 11, 17];
        mode = 'fifteen'
    } else if (mode == 'fifteen') {
        fadings = [4, 9, 14];
        mode = "";
    }

    let needAnimTo = removed.filter(card => !fadings.includes(card));
    let needAnimFrom = fadings.filter(card => !removed.includes(card));
        
    for (let i = 0; i < needAnimFrom.length; i++) animation(needAnimFrom[i], needAnimTo[i]);

    await sleep(2000);
    needAnimTo.forEach(needTo => {
        cards[needTo].classList.remove('fade');
        cards[needTo].classList.remove('hide');
    });

    await sleep(500);
    needAnimFrom.forEach(needFrom => cards[needFrom].style.opacity = 0);
    boardContainer.classList.add('shrink');
    board.classList.remove(oldMode);
    if (mode != "") board.classList.add(mode);
    cards.forEach(card => {
        card.classList.remove(oldMode);
        if (mode != "") card.classList.add(mode);
    })
    fadings.forEach(fade => cards[fade].style.width = '0%');

    await sleep(500);
    boardContainer.classList.add('transition-zero');
    boardContainer.classList.remove('shrink');
    fadings.forEach(fade => cards[fade].remove());

    await sleep(500);
    boardContainer.classList.remove('transition-zero');

    return false;
}

async function animation(from, to) {
    let cardFrom = cards[from];
    let cardTo = cards[to];

    cardFrom.firstElementChild.src = "icons/2HrS.svg";
    cardTo.firstElementChild.src = "icons/2HrS.svg";
    cardTo.classList.add('hide');

    await sleep(1000);
    let yB = cardFrom.getBoundingClientRect().right - cardTo.getBoundingClientRect().right;
    let xB = cardTo.getBoundingClientRect().top - cardFrom.getBoundingClientRect().top;
    cardFrom.style.transform = `translate(${xB}px, ${yB}px)`;
}

document.querySelector('#btnStart').addEventListener('click', async () => {
    let oldMode = mode;
    if (mode == '') {
        fadings = [4, 9, 14];
        mode = 'fifteen'
    } else if (mode == 'fifteen') {
        fadings = [5, 11, 17];
        mode = 'eighteen';
    } else if (mode == 'eighteen') {
        fadings = [6, 13, 20];
        mode = 'twenty-one'
    }

    if (oldMode != "twenty-one") {
        boardContainer.classList.add('transition-zero');
        boardContainer.classList.add('shrink');

        for (fade of fadings) {
            let newCard = document.createElement('div');
            newCard.setAttribute('class', 'card');
            let newCardImg = document.createElement('img');
            newCardImg.setAttribute('src', 'icons/2HrS.svg');
            newCard.appendChild(newCardImg);

            newCard.classList.add('squeeze');
            newCard.classList.add('fade');
            boardContainer.insertBefore(newCard, boardContainer.children[fade]);
        }

        await sleep(500);
        cards = board.querySelectorAll('.card');
        addCardEventListener(cards);
        cards.forEach(card => {
            if (oldMode != '') card.classList.remove(oldMode);
            card.classList.add(mode);
        })

        if (oldMode != "") board.classList.remove(oldMode);
        board.classList.add(mode);
        
        boardContainer.classList.remove('shrink');
        fadings.forEach(fade => cards[fade].classList.remove('squeeze'));
        let newCards = [cards[fadings[0]], cards[fadings[1]], cards[fadings[2]]];

        await moveOut(newCards);
        await sleep(500);
        await moveBack(newCards);
        
        boardContainer.classList.remove('transition-zero');
    }
});
