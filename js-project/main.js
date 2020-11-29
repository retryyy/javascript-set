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
let assistBtn = layout.querySelector('#assist');
let assists = menu.querySelectorAll('input[name="toggle_option"]');
let grow = layout.querySelector('#grow');
let container = game.querySelector('#container');
let board = game.querySelector('#cards-board');
let boardContainer = board.querySelector('#board');
let cards = board.querySelectorAll('.card');
let timer = game.querySelector('#timer');

let gameOver = true;
let gameOngoing = false;
let choosing = false;
let lock = false;
let singlePlayer;
let activePlayer;
let nrOfPlayers = 1;
let nrOfInstantiatedPlayers = 0;
let playersInfo;

let mode = "";
let assistType;

// deck
let color = 'g';
let number = [1, 2, 3];
let fill = ['O', 'S', 'H'];
let shape = ['S', 'P', 'D'];
let attributes = ['number', 'fill', 'shape'];

let cardArray;
let activeCardArray;
let sets;

function createDeck() {
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
    await sleep(000);

    sidebarClick.classList.add('opened');
    sidebar.classList.add('opened');
    sidebarClick.firstElementChild.classList.add('click');
    
    logo.classList.add('appear');
    welcome.classList.add('disappear');
    await sleep(600);
    welcome.remove();

    resetMenu();
    settings.classList.add('appear');
}

// timer ///////////////////////////////////////////////////////////////////////////////
let acted = true;
let sec = 10;
async function countDown() {
	refreshTimer();
	sec -= .01;
	if (sec >= 0) {
        if (!acted) {
            if (sec < 4) timer.classList.add('last-secs');
            setTimeout(countDown, 10);
        }
	} else {
        cards.forEach(card => card.classList.remove('active'));
        board.classList.remove('unlock');
        playersInfo[activePlayer].score -= 1;
        
        await startNewRound();
    }
}

function refreshTimer() {
    timer.style.width = (sec * 100 / 10) + "%";
}

async function resetTimer() {
    timer.classList.add('load');
    sec = 10;
    refreshTimer();
    timer.classList.remove('last-secs');

    await sleep(1000);
    timer.classList.remove('load');
}

// game
players.addEventListener('click', (item) => {
    if (!choosing && !gameOver && !lock && !singlePlayer) {
        players.querySelectorAll('div').forEach(plate => plate.classList.remove('lock'));
        board.classList.add('unlock');

        choosing = true;
        lock = true;

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
        lock = true;
        this.classList.toggle('active');
        exchange();
    }
}

async function exchange() {
    let tickedCards = document.querySelectorAll('.card.active');
    if (tickedCards.length == 3) {
        board.classList.remove('unlock');

        acted = true;
        let res = await checkSet(tickedCards);
        res ? playersInfo[activePlayer].score += 1 : playersInfo[activePlayer].score -= 1;
        setSets();

        if (activeCardArray.length != 0) {
            while (sets.length == 0 && cardArray.length != 0) {
                await growTable();
                setSets();
            }
            if (sets.length == 0) gameOver = true;
        } else {
            gameOver = true;
        }

        if (gameOver) {
            gameOngoing = false;
            choosing = false;

            await winner();
            loadPage();
            await resetTimer()
            return;
        }
        await startNewRound();
        if (singlePlayer) board.classList.add('unlock');
    }
}

async function startNewRound() {
    refreshPlayersTable();
    if (singlePlayer) players.querySelector('td').classList.add('active');
    resetTimer();
    
    players.querySelectorAll('div').forEach(plate => plate.classList.remove('lock'));
    if (!singlePlayer) choosing = false;
    lock = false;
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

    gameOngoing = false;
    gameOver = true;
    playersInfo = [];
});

start.addEventListener('transitionend', () => {
    playerInput.focus();
    playerInput.value = 'PLAYER 1';
});

//proceed
proceed.addEventListener('click', async () => {
    let name = playerInput.value;
    if (!isValidInput(name)) return;

    playersInfo[nrOfInstantiatedPlayers] = {'name': name, 'score': 0};
    nrOfInstantiatedPlayers++;

    let preName = nrOfInstantiatedPlayers + 1;
    playerInput.value = "PLAYER " + preName;

    if (nrOfInstantiatedPlayers == nrOfPlayers) {
        await generateDeck();
        refreshPlayersTable();
        onePlayerGameplay();

        menu.classList.remove('appear');
        layout.classList.add('appear');
        resetMenu();
        settings.classList.add('appear');
        playerName.classList.remove('appear');
        setAssistType();

        gameOngoing = true;
        gameOver = false;

        return;
    }
    playerName.querySelector('label span').innerText = nrOfInstantiatedPlayers + 1;
})

function onePlayerGameplay() {
    if (nrOfPlayers == 1) {
        singlePlayer = true;
        choosing = true;
        players.querySelector('td').classList.add('active');
        board.classList.add('unlock');
        activePlayer = 0;
    } else {
        singlePlayer = false;
        choosing = false;
    }
}

function setAssistType() {
    assists.forEach(e => {
        if (e.checked) {
            assistType = e.id;

            let btnText = assistBtn.querySelector('h1');
            if (assistType == 'no_assist') {
                assistBtn.style.visibility = 'hidden';
            } else if (assistType == 'number_assist') {
                btnText.innerText = 'IS THERE A SET?'
            } else if (assistType == 'show_assist') {
                btnText.innerText = 'WHERE IS A SET?'
            }
        }
    });
}

async function generateDeck() {
    cardArray = new Array();
    activeCardArray = new Array();

    cards.forEach(e => e.remove());
    refreshDOMCards();

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
    console.log(activeCardArray);
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
    let arr = Array.from(cards);
    let removed = [arr.indexOf(tickedCards[0]), arr.indexOf(tickedCards[1]), arr.indexOf(tickedCards[2])];

    let a = JSON.stringify(sets);
    let b = JSON.stringify(removed);

    if (a.indexOf(b) != -1) {
        await sleep(1000);
        tickedCards.forEach(card => card.classList.add('fade'));
        await sleep(1000);
        tickedCards.forEach(card => card.classList.remove('active'));

        if (mode == "") {
            if (cardArray.length != 0) {
                await moveOut(tickedCards);
                replaceCards(removed);
                await sleep(500);
                await moveBack(tickedCards);
            } else {
                removed.reverse().forEach(rem => activeCardArray[rem] = undefined);
            }
            return true;
        }

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
        refreshDOMCards();

        return true;
    } else {
        tickedCards.forEach(card => card.classList.add('wrong'));
        await sleep(4000);
        tickedCards.forEach(card => {
            card.classList.remove('active');
            card.classList.remove('wrong');
        });
        return false;
    }
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
        refreshDOMCards();
    }
}

assistBtn.addEventListener('click', async () => {
    if (assistType == 'number_assist') {
        if (!lock) {
            lock = true;
    
            let elem = document.createElement('div');
            elem.innerText = sets.length;
            elem.setAttribute('id', 'number-of-sets');
            board.appendChild(elem);
            await sleep(500);
    
            boardContainer.classList.add('hide');
            elem.classList.add('appear');
            await sleep(4000);
            boardContainer.classList.remove('hide');
            elem.classList.remove('appear');
    
            await sleep(1000);
            elem.remove();
    
            lock = false;
        }
    } else if (assistType == 'show_assist') {
        if (!lock && sets.length > 0) {
            lock = true;
            let set = sets[Math.floor(Math.random() * sets.length)];
    
            for (let i = 0; i < activeCardArray.length; i++) {
                if (!set.includes(i)) {
                    cards[i].firstElementChild.style.transition = 'opacity .4s';
                    cards[i].classList.add('example');
                };
            }
            await sleep(3000);
            for (let i = 0; i < activeCardArray.length; i++) {
                if (!set.includes(i)) {
                    cards[i].classList.remove('example');
                    cards[i].firstElementChild.style.transition = 'opacity 0';
                }
            }
            lock = false;
        }
    }
});

async function winner() {
    let elem = document.createElement('div');
    elem.innerText = playersInfo[0].name + ' won';
    elem.setAttribute('id', 'winner');
    container.appendChild(elem);

    await sleep(1000);
    layout.classList.remove('appear');
    elem.classList.add('appear');

    await sleep(3000);
    elem.classList.remove('appear');

    await sleep(1000);
    elem.remove();
}


grow.addEventListener('click', async () => {
    if (!lock) {
        lock = true;
        if (singlePlayer) board.classList.remove('unlock');
        board.classList.remove('unlock');
        await growTable();
        setSets();
        if (singlePlayer) board.classList.add('unlock');
        lock = false;
    }
})