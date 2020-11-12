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
let board = document.querySelector('#cards-board');
let cards = document.querySelectorAll('.card');
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
    await sleep(0);

    sidebarClick.classList.add('opened');
    sidebar.classList.add('opened');
    sidebarClick.firstElementChild.classList.add('click');
    
    menu.classList.remove('appear');
    logo.classList.add('appear');
    welcome.classList.remove('appear');
    
    for (elem of elements) {
        elem.classList.remove('hidden');
    }
    menu.classList.toggle('appear');
}

// scoreboard visibility
document.addEventListener("keydown", (event) => {
    if (event.keyCode === 83 && !sidebar.classList.contains('opened') && !menu.classList.contains('appear')) {
        scoreboard.classList.add('appear');
        board.classList.remove('appear')
    }
});
document.addEventListener("keyup", (event) => {
    if (event.keyCode === 83 && !sidebar.classList.contains('opened')) {
        scoreboard.classList.remove('appear');
        board.classList.remove('appear');
    }
});

// scoreboard fill
let players = 10;
table.style.height = ["calc(100% *", players, "/ 10)"].join(" ");

// cards
function tick() {
    this.classList.toggle('active');
    exchange();
}

async function exchange() {
    let tickedCards = document.querySelectorAll('.card.active');
    if (tickedCards.length == 3) {
        board.classList.toggle('lock');
        
        await sleep(1000);
        tickedCards.forEach(card => card.classList.add('fade'));
        await sleep(1000);
        moveOut(tickedCards);
        await sleep(1000);
        await moveBack(tickedCards);
        board.classList.toggle('lock');
    }
}

function moveOut(tickedCards) {
    tickedCards.forEach(card => card.firstElementChild.src = "icons/2HrS.svg");
    tickedCards.forEach(card => card.classList.remove('active'));
    tickedCards.forEach(card => card.classList.add('new'));
    tickedCards.forEach(card => card.classList.remove('fade'));
}

async function moveBack(tickedCards) {
    tickedCards.forEach(card => card.classList.add('trans'));
    tickedCards.forEach(card => card.classList.remove('new'));
    await sleep(1500);
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
            board.classList.remove('appear');
            logo.classList.add('appear');
        } else {
            board.classList.add('appear');
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

    board.classList.remove('appear');
    logo.classList.remove('appear');
});

start.addEventListener('click', () => {
    menu.classList.remove('appear');
    board.classList.add('appear');
    gameOngoing = true;
});

menuClose.addEventListener('click', () => {
    logo.classList.add('appear');

    menu.classList.remove('appear');
    sidebarClick.classList.add('opened');
    sidebar.classList.add('opened');
    sidebarClick.firstElementChild.classList.add('click');
});