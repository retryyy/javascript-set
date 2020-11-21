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
let cards = board.querySelectorAll('.card');
let timer = game.querySelector('#timer');

let gameOngoing = false;
let choosing = false;
let activePlayer;
let nrOfPlayers = 1;
let nrOfInstantiatedPlayers = 0;
let playersInfo = [];

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
function countDown() {
	refreshTimer();
	sec -= .01;
	if (sec >= 0 && !acted) {
        if (sec < 4) {
            timer.classList.add('last-secs');
        }
		setTimeout(countDown, 10);
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
cards.forEach(card => card.addEventListener('click', () => {
    if (choosing) {
        card.classList.toggle('active');
        exchange();
    }
}));

async function exchange() {
    let tickedCards = document.querySelectorAll('.card.active');
    if (tickedCards.length == 3) {
        board.classList.remove('unlock');
        console.log(activePlayer);
        playersInfo[activePlayer].score += 1;
        acted = true;
        
        await sleep(1000);
        tickedCards.forEach(card => card.classList.add('fade'));
        await sleep(1000);
        await moveOut(tickedCards);
        await sleep(1000);
        await moveBack(tickedCards);

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
}

function moveOut(tickedCards) {
    tickedCards.forEach(card => card.firstElementChild.src = "icons/2HrS.svg");
    tickedCards.forEach(card => card.classList.remove('active'));
    tickedCards.forEach(card => card.classList.remove('fade'));

    let bounds = board.getBoundingClientRect();
    let half = (bounds.top + bounds.bottom) / 2;
    
    tickedCards.forEach(card => {
        let cHalf = (card.getBoundingClientRect().top + card.getBoundingClientRect().bottom) / 2;
        card.style.transform = `translate(${(half - cHalf)}px, ${document.documentElement.scrollWidth + board.getBoundingClientRect().width / 3}px) scale(3)`;
    });
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

start.addEventListener('transitionend', () => {
    playerInput.focus();
});

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
    document.getElementById(id)
        .previousElementSibling.setAttribute('onclick', "stepperInput('" + id + "', -" + step + ", " + min + ")"); 
    document.getElementById(id)
        .nextElementSibling.setAttribute('onclick', "stepperInput('" + id + "', " + step + ", " + max + ")"); 
}

function stepperInput(id, s, m) {
    var el = document.getElementById(id);
    if (s > 0 &&  parseInt(el.value) < m) {
        el.value = parseInt(el.value) + s;
    } else if (parseInt(el.value) > m) {
        el.value = parseInt(el.value) + s;
    }
}
