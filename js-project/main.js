// scoreboard visibility
let board = document.querySelector('.cards-board');
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
}
cards.forEach(card => card.addEventListener('click', tick));


