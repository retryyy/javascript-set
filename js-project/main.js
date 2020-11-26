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

let gameOver = false;
let gameOngoing = false;
let choosing = false;
let activePlayer;
let nrOfPlayers = 1;
let nrOfInstantiatedPlayers = 0;
let playersInfo = [];

let mode = "";

// deck
let color = 'g';
let number = [1, 2, 3];
let fill = ['O', 'S', 'H'];
let shape = ['S', 'P', 'D'];
let attributes = ['number', 'fill', 'shape'];

let cardArray = new Array();
let activeCardArray = new Array();
let sets;

createDeck();
function createDeck() {
    while (cardArray.length) cardArray.pop();

    let idx = 0;
    for (let n of number) {
        for (let f of fill) {
            for (let s of shape) {
                cardArray[idx++] = {number: n,  fill: f, color: color, shape: s}
            }
        }
    }
    for (let i = cardArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        const temp = cardArray[i];
        cardArray[i] = cardArray[j];
        cardArray[j] = temp;
    }
}

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
    if (!choosing && !gameOver) {
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
function refreshDOMCards() {
    cards = board.querySelectorAll('.card');
}
function addCardEventListener() {
    refreshDOMCards();
    cards.forEach(card => card.removeEventListener('click', cardEvent));
    cards.forEach(card => card.addEventListener('click', cardEvent));
}

function cardEvent() {
    if (choosing && !gameOver) {
        this.classList.toggle('active');
        exchange();
    }
}

async function exchange() {
    let tickedCards = document.querySelectorAll('.card.active');
    if (tickedCards.length == 3) {
        board.classList.remove('unlock');
        refreshDOMCards();
        await startNewRound();

        let res = await checkSet(tickedCards);
        res ? playersInfo[activePlayer].score += 1 : playersInfo[activePlayer].score -= 1;
        setSets();

        if (activeCardArray.length != 0) {
            while (sets.length == 0 && cardArray.length != 0) {
                await growTable();
                setSets();
            }
            choosing = false;
        } else {
            gameOver = true;
        }

        if (sets.length == 0) gameOver = true;
        if (gameOver) {
            await sleep(2000);
            console.log('over');
            return;
        }
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
    
    players.querySelectorAll('div').forEach(plate => plate.classList.remove('lock'));
}

async function moveOut(tickedCards) {
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

function replaceCards(removed) {
    for (let rem of removed) {
        let newCard = cardArray.pop();
        activeCardArray[rem] = newCard;
        cards[rem].firstElementChild.src = createCardName(newCard);
    }
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
proceed.addEventListener('click', async () => {
    let name = playerInput.value;
    if (!isValidInput(name)) return;

    addPlayer(name);
    playerInput.value = "";
    nrOfInstantiatedPlayers++;

    if (nrOfInstantiatedPlayers == nrOfPlayers) {
        await generateDeck();
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

async function generateDeck() {
    createDeck();
    while (activeCardArray.push(cardArray.pop()) != 12);

    for (let card of activeCardArray) {
        let cardFile = createCardName(card);
        let newCard = document.createElement('div');
        newCard.setAttribute('class', 'card');
        let newCardImg = document.createElement('img');
        newCardImg.setAttribute('src', cardFile);
        newCard.appendChild(newCardImg);
        boardContainer.appendChild(newCard);
    }
    addCardEventListener();

    setSets();
    while (sets.length == 0 && cardArray.length != 0) {
        await growTable();
        setSets();
    }
}

function createCardName(card) {
    return 'icons/' + card.number + card.fill + card.color + card.shape + '.svg';
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

    let a = JSON.stringify(sets);
    let b = JSON.stringify(removed);

    await sleep(1000);
    if (a.indexOf(b) != -1) {
        tickedCards.forEach(card => {
            card.classList.add('fade');
            card.classList.remove('active');
        });

        if (mode == "") {
            await sleep(1000);
            if (!isEmptyDeck()) {
                await moveOut(tickedCards);
                replaceCards(removed);
                await sleep(500);
                await moveBack(tickedCards);
            } else {
                removed.reverse().forEach(rem => activeCardArray[rem] = undefined);
            }
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
            
        await animation(needAnimFrom, needAnimTo);

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
        fadings.reverse().forEach(fade => {
            cards[fade].remove();
            activeCardArray.splice(fade, 1);
        });

        await sleep(500);
        boardContainer.classList.remove('transition-zero');

        return true;
    } else {
        tickedCards.forEach(card => card.classList.remove('active'));
        return false;
    }
}

function isEmptyDeck() {
    return cardArray.length == 0;
}

function setSets() {
    let list = [];
    let len = activeCardArray.length;
    for (let i = 0; i < len - 2; i++) {
        for (let j = i + 1; j < len - 1; j++) {
            for (let k = j + 1; k < len; k++) {
                if (activeCardArray[i] != undefined && activeCardArray[j] != undefined && activeCardArray[k] != undefined) {
                    let b = true;
                    for (attr of attributes) {
                        b = b && ((activeCardArray[i][attr] == activeCardArray[j][attr] 
                                    && activeCardArray[j][attr] == activeCardArray[k][attr]) ||
                                        (activeCardArray[i][attr] != activeCardArray[j][attr]
                                        && activeCardArray[j][attr] != activeCardArray[k][attr]
                                        && activeCardArray[i][attr] != activeCardArray[k][attr]));
                    }
                    if (b) list.push([i, j, k]);
                }
            }
        }
    }
    sets = list;
}

async function animation(from, to) {
    from.forEach(fr => cards[fr].classList.add('trans'));
    for (let i = 0; i < from.length; i++) {
        let cardFrom = cards[from[i]];
        let cardTo = cards[to[i]];

        cardTo.firstElementChild.src = cardFrom.firstElementChild.src;
        activeCardArray[to[i]] = activeCardArray[from[i]];

        cardTo.classList.add('hide');

        let yB = cardFrom.getBoundingClientRect().right - cardTo.getBoundingClientRect().right;
        let xB = cardTo.getBoundingClientRect().top - cardFrom.getBoundingClientRect().top;
        cardFrom.style.transform = `translate(${xB}px, ${yB}px)`;
    }
    await sleep(1000);
    from.forEach(fr => cards[fr].classList.remove('trans'));
    refreshDOMCards();
}

async function growTable() {
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
            let newActiveCard = cardArray.pop();
            activeCardArray.splice(fade, 0, newActiveCard);

            let newCard = document.createElement('div');
            newCard.setAttribute('class', 'card');
            let newCardImg = document.createElement('img');
            newCardImg.setAttribute('src', createCardName(newActiveCard));
            newCard.appendChild(newCardImg);

            newCard.classList.add('squeeze');
            newCard.classList.add('fade');
            boardContainer.insertBefore(newCard, boardContainer.children[fade]);
        }
        
        await sleep(500);
        addCardEventListener();
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
}
