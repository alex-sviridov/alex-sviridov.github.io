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

function getWords(count=6) {
    log('info','get words of count',count);
    const words = [
        { image: './static/images/cat.jpg', title: 'Cat', audioSource: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/En-uk-a_cat.ogg', audioType: "audio/ogg"},
        { image: './static/images/dog.jpg', title: 'Dog', audioSource: 'https://upload.wikimedia.org/wikipedia/commons/4/47/En-uk-a_dog.ogg', audioType: "audio/ogg"},
        { image: './static/images/horse.jpg', title: 'Horse', audioSource: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/En-uk-a_horse.ogg', audioType: "audio/ogg"},
        { image: './static/images/cow.jpg', title: 'Cow', audioSource: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/En-uk-a_cow.ogg', audioType: "audio/ogg"},
        { image: './static/images/rabbit.jpg', title: 'Rabbit', audioSource: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/En-uk-a_rabbit.ogg', audioType: "audio/ogg"},
        { image: './static/images/bird.jpg', title: 'Bird', audioSource: 'https://upload.wikimedia.org/wikipedia/commons/8/83/En-uk-a_bird.ogg', audioType: "audio/ogg"},
        { image: './static/images/fish.jpg', title: 'Fish', audioSource: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/En-uk-fish.ogg', audioType: "audio/ogg"},
        { image: './static/images/chicken.jpg', title: 'Chicken', audioSource: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/En-uk-a_chicken.ogg', audioType: "audio/ogg"},
        { image: './static/images/sheep.jpg', title: 'Sheep', audioSource: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/En-uk-a_sheep.ogg', audioType: "audio/ogg"},
        { image: './static/images/duck.webp', title: 'Duck', audioSource: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/En-us-duck.ogg', audioType: "audio/ogg"},
        { image: './static/images/pig.jpg', title: 'Pig', audioSource: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Pronunciation_example_of_the_word_Pig_in_British_English.ogg', audioType: "audio/ogg"},
        { image: './static/images/lion.jpg', title: 'Lion', audioSource: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/En-us-lion.ogg', audioType: "audio/ogg"},
        { image: './static/images/elephant.webp', title: 'Elephant', audioSource: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/En-us-elephant.ogg', audioType: "audio/ogg"},
    ];
    if (count>words.length) { count = words.length}
    shuffle(words);
    var result = words.slice(0,count);
    log('info','new words list',words);
    return result;
}

function gameRestart() {
    log('info','starting a new game');
    if (cards) {
        cards.forEach((card) => cardToBack(card.id));
    }
    cards = getWords(6).flatMap(item => [item, item]);
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
        cardClone.querySelector('.card-title').textContent = card.title;
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
