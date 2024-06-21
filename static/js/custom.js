var cards = []

function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }

function log(level, message, context = {}) {
    if (!DEBUG && level != 'error' && level != 'warn') {
     return false;
    }
    let timestamp = new Date().toISOString();
    let contextString = JSON.stringify(context);
    //Using stack trace to get caller fuinction
    let err = new Error();
    let callerLine = err.stack.split('\n')[1].split('@')[0];
    let caller = callerLine ? callerLine : 'anonymous';
    console[level](`[${timestamp}] [${level.toUpperCase()}] [func: ${caller}] ${message} ${contextString}`);
}

function cardClick(cardId) {
    log('info','clicked',cardId)
    //Check if two cards are already flipped. If so - unflip all cards
    flippedCardsNum = cards.filter(function(item){return item.front;}).length; 
    if (flippedCardsNum > 1) {
        cards.filter(function(item){return item.front;}).forEach((card) => cardToBack(card.id));
    } else {
        cardToFront(cardId);
        if (flippedCardsNum == 1) {
            cardCheckParity();
        }
    }
};

function cardToFront(cardId) {
    card = cards.find(x => x.id === cardId);
    if (!card.front) {
        log('info','flipping card to front',card)
        card.front = true;
        cartObject = document.getElementById(cardId);
        cartObject.classList.add('deactivated');
        flipCardObject = cartObject.getElementsByClassName("card-flip")[0];
        flipCardObject.classList.add('flipped');
        audio = cartObject.getElementsByTagName("audio")[0];
        audio.play(); 
    }
}

function cardToBack(cardId) {
    card = cards.find(x => x.id === cardId);
    log('info','flipping card to back',card)
    card.front = false;
    cartObject = document.getElementById(cardId);
    cartObject.classList.remove('deactivated');
    flipCardObject = cartObject.getElementsByClassName("card-flip")[0];
    flipCardObject.classList.remove('flipped');
}

function cardCheckParity() {
    let card1 = cards.filter(function(item){return item.front;})[0];
    let card2 = cards.filter(function(item){return item.front;})[1];
    log('info','checking cards parity',{'card1':card1,'card2':card2})
    if (card1.title === card2.title) {
        cardSolve(card1);
        cardSolve(card2);
    }
}

function cardSolve(card) {
    log('info','setting card as solved',card)
    card.solved = true;
    cardObject = document.getElementById(card.id);
    cardObject.classList.add('solved');
    cardObject.removeAttribute('onclick');
    cardToBack(card.id);
    checkFinished();
}

function checkFinished() {
    unsolvedCardsLen = cards.filter(function(item){return !item.solved;}).length; 
    if (unsolvedCardsLen == 0) {
        gameWin();
    }
}

function gameWin() {
    log('info','game won');
    const winModal = new bootstrap.Modal(document.getElementById('winModal'));
    winModal.show();
}

function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    }

async function getWords(count=6) {
    log('info','get words of count',count);
    const response = await fetch('./data/words.json');
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
    const words = await response.json();
    if (count>words.length) { count = words.length}
    shuffle(words);
    var result = words.slice(0,count);
    log('info','new words list',words);
    return result;
}

async function gameRestart() {
    log('info','starting a new game');
    if (cards) {
        cards.forEach((card) => cardToBack(card.id));
    }
    cards = await getWords(6);
    cards = cards.flatMap(item => [item, item])
    cards = cards.map((item,index) => ({...item, id: "card"+(index+1), solved: false, front: false}));
    shuffle(cards);
    log('info','new cards list',cards);
    const cardRow = document.getElementById('table');
    cardRow.innerHTML = ""; 
    const cardTemplate = document.getElementById('card-template'); 
    cards.forEach(card => {
        log('info','add card to the table',card);
        const cardClone = cardTemplate.cloneNode(true);
        cardClone.classList.remove('d-none');
        cardClone.querySelector('.front-image').src = card.image;
        cardClone.querySelector('.card-title').textContent = card.en;
        cardRow.appendChild(cardClone);
        cardClone.getElementsByClassName("card-container")[0].id = card.id;
        cardClone.getElementsByTagName("source")[0].src = card.audioSource;
        cardClone.getElementsByTagName("source")[0].type = card.audioType;
        cardClone.removeAttribute('id');
        if (card.front) { cardFlip(card.id); }
    });    
    log('info','Game restarted',cards);
}

document.addEventListener('DOMContentLoaded', function() {
    gameRestart();
});
