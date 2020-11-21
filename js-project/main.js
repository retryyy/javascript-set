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
let scoreboard = document.querySelector('#scoreboard');
let table = scoreboard.querySelector("table");

let gameOngoing = false;
let choosing = false;

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
    settings.classList.add('appear');
    
    for (elem of elements) {
        elem.classList.remove('hidden');
    }
}

// scoreboard visibility
document.addEventListener("keydown", (event) => {
    if (event.keyCode === 83 && !sidebar.classList.contains('opened') && !menu.classList.contains('appear')) {
        scoreboard.classList.add('appear');
        layout.classList.remove('appear');
    }
});
document.addEventListener("keyup", (event) => {
    if (event.keyCode === 83 && !sidebar.classList.contains('opened') && !menu.classList.contains('appear')) {
        scoreboard.classList.remove('appear');
        layout.classList.add('appear');
    }
});

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
        players.style.pointerEvents = 'none'; // disable players
        board.classList.add('unlock'); // enable board

        choosing = true;
        acted = false;
        setTimeout(countDown, 0);

        let tr = item.target.parentElement;
        tr.classList.toggle('active');
        console.log(tr.rowIndex);
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
        acted = true;
        
        await sleep(1000);
        tickedCards.forEach(card => card.classList.add('fade'));
        await sleep(1000);
        await moveOut(tickedCards);
        await sleep(1000);
        await moveBack(tickedCards);

        timer.classList.add('load');
        Array.from(players.querySelectorAll('tr')).forEach(player => {
            player.classList.remove('active');
        });
        sec = 10;
        refreshTimer();
        timer.classList.remove('last-secs')

        await sleep(1000);

        timer.classList.remove('load');
        players.style.pointerEvents = 'auto';
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

    console.log();
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

start.addEventListener('click', () => {
    playerName.querySelector('label span').innerText = 1;
    table.style.height = `calc(100% * ${stepper.value} / 10)`;
    players.style.height = `calc(100% * ${stepper.value} / 10)`;
    players.innerHTML = "";
    settings.classList.remove('appear');
    playerName.classList.add('appear');
});

start.addEventListener('transitionend', () => {
    playerInput.focus();
});

proceed.addEventListener('click', () => {
    if (!isValidInput(playerInput.value)) return;
    
    let p = document.createElement('tr');
    p.innerHTML = '<td>' + playerInput.value + '</td>';
    p.setAttribute('id', playerInput.value);
    players.appendChild(p);
    playerInput.value = "";

    let e = playerName.querySelector('label span').innerText;
    let value = parseInt(e);

    if (value == stepper.value) {
        menu.classList.remove('appear');
        layout.classList.add('appear');
        settings.classList.add('appear');
        playerName.classList.remove('appear');

        gameOngoing = true;
        return;
    }
    value++;
    playerName.querySelector('label span').innerText = value;
});

function isValidInput(input) {
    if (input.length <= 0) return false;
    let playersData = players.querySelectorAll('td');
    for (player of playersData) {
        if (input == player.innerText) return false;
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

    playerInput.value = "";
    settings.classList.add('appear');
    playerName.classList.remove('appear');
});

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

