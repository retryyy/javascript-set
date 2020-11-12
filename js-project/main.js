// helper
function sleep(ms) {
    return new Promise((accept) => {
        setTimeout(() => {
            accept();
        }, ms);
    });
}

// DOM
let sidebarClick = document.querySelector('#sidebarClick');
let sidebar = document.querySelector('#sidebar');
let logo = document.querySelector('#logo');
let board = document.querySelector('#cards-board');
let scoreboard = document.querySelector('#scoreboard');
let table = scoreboard.querySelector("table");
let cards = document.querySelectorAll('.card');

// scoreboard visibility
document.addEventListener("keydown", (event) => {
    if (event.keyCode === 83 && !sidebar.classList.contains('opened')) {
        scoreboard.classList.add('appear');
        board.classList.add('appear')
    }
});
document.addEventListener("keyup", (event) => {
    if (event.keyCode === 83) {
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
    sidebarClick.classList.toggle('opened');
    sidebar.classList.toggle('opened');
    sidebarClick.firstElementChild.classList.toggle('click');

    board.classList.toggle('shrink');
    board.classList.toggle('lock');
    logo.classList.toggle('appear');
})
