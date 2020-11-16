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
let logo = document.querySelector('#logo');
let game = document.querySelector('#game');
let layout = document.querySelector('#layout');
let board = game.querySelector('#cards-board');
let cards = board.querySelectorAll('.card');
let timer = game.querySelector('#timer');
let scoreboard = document.querySelector('#scoreboard');
let table = scoreboard.querySelector("table");

let gameOngoing = false;

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
    
    menu.classList.remove('appear');
    logo.classList.add('appear');
    welcome.classList.add('disappear');
    
    for (elem of elements) {
        elem.classList.remove('hidden');
    }
}

// scoreboard visibility
document.addEventListener("keydown", (event) => {
    if (event.keyCode === 83 && !sidebar.classList.contains('opened') && !menu.classList.contains('appear')) {
        scoreboard.classList.add('appear');
        game.classList.remove('appear');
    }
});
document.addEventListener("keyup", (event) => {
    if (event.keyCode === 83 && !sidebar.classList.contains('opened')) {
        scoreboard.classList.remove('appear');
        game.classList.add('appear');
    }
});

// scoreboard fill
let players = 10;
table.style.height = `calc(100% * ${players} / 10)`;

// cards
function tick() {
    this.classList.toggle('active');
    exchange();
}

async function exchange() {
    let tickedCards = document.querySelectorAll('.card.active');
    if (tickedCards.length == 3) {
        board.classList.add('lock');
        await sleep(1000);
        tickedCards.forEach(card => card.classList.add('fade'));
        await sleep(1000);
        await moveOut(tickedCards);
        await sleep(1000);
        await moveBack(tickedCards);
        board.classList.remove('lock');
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
        card.style.transform = `translate(${(half - cHalf)}px, ${document.documentElement.scrollWidth}px) scale(1.5)`;
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

cards.forEach(card => card.addEventListener('click', tick));

// sidebar
sidebarClick.addEventListener('click', () => {
    if (gameOngoing) {
        sidebarClick.classList.toggle('opened');
        sidebar.classList.toggle('opened');
        sidebarClick.firstElementChild.classList.toggle('click');


        if (sidebar.classList.contains('opened')) {
            menu.classList.remove('appear');
            game.classList.remove('appear');
            logo.classList.add('appear');
        } else {
            game.classList.add('appear');
            logo.classList.remove('appear');
        }
    }  
})

// menu
sidebar.querySelector('#new').addEventListener('click', () => {
    menu.classList.toggle('appear');
    sidebarClick.classList.toggle('opened');
    sidebar.classList.toggle('opened');
    sidebarClick.firstElementChild.classList.remove('click');

    game.classList.remove('appear');
    logo.classList.remove('appear');
});

start.addEventListener('click', () => {
    menu.classList.remove('appear');
    game.classList.add('appear');
    gameOngoing = true;
});

menuClose.addEventListener('click', () => {
    logo.classList.add('appear');

    menu.classList.remove('appear');
    sidebarClick.classList.add('opened');
    sidebar.classList.add('opened');
    sidebarClick.firstElementChild.classList.add('click');
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

// timer
document.querySelector('#btnStart').addEventListener('click', countDown, false);

let sec = 10;
const maxSec = 10;
function countDown() {
	timer.style.width = (sec * 100 / maxSec) + "%";
	sec--;
	if (sec >= 0) {
		setTimeout(countDown, 1000);
	}
}
