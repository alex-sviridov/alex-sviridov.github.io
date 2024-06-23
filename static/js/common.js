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

function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    }

async function getWords(count=6,cardsSet='animal') {
    if (!cardsSet) {
        cardsSet = 'animal'
    }
    log('info',`get words of count ${count} cards set ${cardsSet}`);
    const response = await fetch('./data/words.json');
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
    let words = await response.json();
    words = words.filter(function(item){return item.type == cardsSet;})
    if (count>words.length) { count = words.length}
    shuffle(words);
    var result = words.slice(0,count);
    log('info','new words list',words);
    return result;
}