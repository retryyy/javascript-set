// scoreboard visibility
let board = document.querySelector('#cards-board');
let scoreboard = document.querySelector('#scoreboard');
document.addEventListener("keydown", (event) => {
    if (event.keyCode === 83) {
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

// cards
let cards = document.querySelectorAll('.card');
function tick() {
    this.classList.toggle('active');
    exchange();
}

function exchange() {
    let tickedCards = document.querySelectorAll('.card.active');
    if (tickedCards.length == 3) {
        setTimeout(() => {
            tickedCards.forEach(card => card.classList.add('fade'));
            setTimeout(() => {
                moveOut(tickedCards);
                setTimeout(() => {
                    moveBack(tickedCards);
                }, 1000);
            }, 1000);
        }, 1000);
    }
    console.log(tickedCards);
}

function moveOut(tickedCards) {
    tickedCards.forEach(card => card.firstElementChild.src = "icons/2HrS.svg");
    tickedCards.forEach(card => card.classList.remove('active'));
    tickedCards.forEach(card => card.classList.add('new'));
    tickedCards.forEach(card => card.classList.remove('fade'));
}

function moveBack(tickedCards) {
    tickedCards.forEach(card => card.classList.add('trans'));
    tickedCards.forEach(card => card.classList.remove('new'));
    setTimeout(() => {
        tickedCards.forEach(card => card.classList.remove('trans'));
    }, 1500);
}

cards.forEach(card => card.addEventListener('click', tick));


// sidebar
let sidebarClick = document.querySelector('#sidebarClick');
let sidebar = document.querySelector('#sidebar');
sidebarClick.addEventListener('click', () => {
    sidebarClick.classList.toggle('opened');
    sidebar.classList.toggle('opened');
    sidebarClick.firstElementChild.classList.toggle('click');
})
