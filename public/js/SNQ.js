let store = {
    "sources": [
        {
            "slug": "WelcomeTutorial",
            "authors": [
                "Joe Roper"
            ],
            "title": "Welcome to SNQ!",
            "collection": "",
            "retrievedFrom": "./Geometry/Trapezoid+Notes+PDF+Filled+in.pdf",
            "datePub": "",
            "dateRetrieved": "03-31-2021"
        }
    ],
    "notes": [
        {
            "slug": "Welcome",
            "type": "quote",
            "text": "Welcome\nTo open a set of cards, click on 'Choose File' beside 'Select a JSON file.'\nYou will need to select a file with a '.json' extension that is organized for this program.\nOr you can go another box lower and create your own.",
            "sourceSlugs": [
                "WelcomeTutorial"
            ],
            "image": "welcome.png",
            "caption": "Welcome to SNQ!"
        }
    ],
    "quizCards": [
        {
            "slug": "welcome",
            "type": "promptResponse",
            "image": "welcome.png",
            "prompt": "Welcome to SNQ!",
            "prefill": "Click 'Next' to continue",
            "responses": [
                "Click 'Next' to continue", "blah", "blah"
            ],
            "noteSlugs": [
                "Welcome"
            ]
        },
        {
            "slug": "openSet",
            "type": "promptResponse",
            "image": "welcome.png",
            "prompt": "To open a set of cards, click on 'Choose File' beside 'Select a JSON file.",
            "prefill": "Click 'Next' to continue",
            "responses": [
                "Click 'Next' to continue", "blah", "blah"
            ],
            "noteSlugs": [
                "Welcome"
            ]
        },
        {
            "slug": "selectFile",
            "type": "promptResponse",
            "image": "welcome.png",
            "prompt": "You will need to select a file with a '.json' extension that is organized for this program.\nOr you can go another box lower and create your own.",
            "prefill": "Click 'Next' to continue",
            "responses": [
                "Click 'Next' to continue", "blah", "blah"
            ],
            "noteSlugs": [
                "Welcome"
            ]
        }
    ],
    "quizQueue": [],
    "quizQueueDates": {
        "start": "2021-04-07"
    },
    "editQueue": [],
    "images": []
};

let setToStudy = store.quizQueue;

// Fisher-Yates algorithm
let shuffleArray = (array) => {
    let rtnArray = [...array];
    for (let i = rtnArray.length - 1; i >= 0; i--) {
        let randomIndex = Math.round(Math.random() * (array.length - 1));
        let temp = rtnArray[i];
        rtnArray[i] = rtnArray[randomIndex];
        rtnArray[randomIndex] = temp;
    }
    return rtnArray;
}
const arrayToLower = (array) => {
    if (!Array.isArray(array) && typeof array === 'string')
        return array.toLowerCase();
    if (!Array.isArray(array)) return array
    return array.map(x => {
        if (Array.isArray(x)) return arrayToLower(x);
        return x.toLowerCase();
    });
}

// The two matches__Order have a special twist:
// If an item in answers is itself an array,
// the array is taken to mean multiple acceptable responses in the responses items.
// This means multiple correct answers can be built into the answers array.
// NOTE: For comparing arrays of strings and numbers only. No object comparisons.
const matchesInOrder = (answers, responses) => {
    for (let i = 0; i < answers.length; i++) {
        if (Array.isArray(answers[i]) && !answers[i].includes(responses[i]))
            return false;
        if (!Array.isArray(answers[i]) && answers[i] !== responses[i])
            return false;
    }
    return true;
}

const matchesNoOrder = (answers, responses) => {
    if (answers.length !== responses.length) return false;
    for (let i = 0; i < answers.length; i++) {
        if (Array.isArray(answers[i]) && !responses.some(x => answers[i].includes(x)))
            return false;
        if (!Array.isArray(answers[i]) && !responses.includes(answers[i])) return false;
    }
    return true;
}

let isEmpty = (object, id = null, array = null) => {
    if (typeof object == 'number') return false;
    let record = object ? object : readItem(id, array);
    if (record === null) return true;
    if (Array.isArray(record))
        return record.every(x => isEmpty(x));
    if (typeof record == 'object') {
        let propToIgnore = ['id', 'slug', 'type']
        for (let prop in record) {
            if (propToIgnore.includes(prop) || isEmpty(record[prop])) continue;
            if (!isEmpty(record[prop])) return false;
        }
        return true;
    }
    if (record !== '') return false;
}

let createItem = (array) => {
    if (!Array.isArray(array)) {
        console.log('Cannot create item on something that is not an array', array);
        return;
    }
    let lastItem = array[array.length - 1];
    let newObj = null;
    if (Array.isArray(lastItem)) {
        newObj = [...lastItem];
        clearItem(newObj);
    };
    if (typeof lastItem === 'object' && !Array.isArray(lastItem)) {
        newObj = { ...lastItem };
        clearItem(newObj);
    }
    if (typeof lastItem === 'string') newObj = '';
    if (typeof lastItem === 'number') newObj = null;
    array.push(newObj);
    return newObj;
}

let readItem = (id, array) => {
    if (!Array.isArray(array)) return null;
    if (array == null || id == null) return null;

    return array.find(x => {
        if (x.slug && x.slug == id) return true;
        if (x.id && x.id === id) return true;
        if (typeof x != 'object' && x == id) return true;
        if (typeof x != 'object') return false;
        if (x == null) return false;
        if (!x.id) {
            for (let prop in x) {
                if (x[prop] == id) return true;
            }
        }
        return false;
    });
}

let updateItem = (id, array, updatedObject) => {
    let invalid = !Array.isArray(array) || id == null || updatedObject == null
    if (invalid) return null;
    let index = array.indexOf(readItem(id, array));
    return array.splice(index, 1, updatedObject);
}

let deleteItem = (id, array) => {
    let index = array.indexOf(readItem(id, array));
    return array.splice(index, 1);
}

let clearItem = (object) => {
    if (Array.isArray(object)) {
        object = [clearItem(object[object.length - 1])];
    }
    if (typeof object === 'string') object = '';
    if (typeof object === 'number') object = null;
    if (typeof object === 'object' && !Array.isArray(object)) {
        for (let prop in object) {
            object[prop] = clearItem(object[prop]);
        }
    }

    return object;
}

const quickHash = (string, limit = 1000) => {
    number = 0;
    for (let i in string) {
        number += string.charCodeAt(i)
    }
    return number % limit;
}

let daysSince = (date) => {
    let today = new Date();
    let dateOfInterest = new Date(date);
    return Math.round((today - dateOfInterest) / 86400000);
}

const slugBath = (store) => {
    changedSourceSlugs = [];
    changedNoteSlugs = [];
    changedCardSlugs = [];

    const saveSlugChanges = ({ object, slugSrc, slugChars=10, pushArray }) => {
        let old = object.slug;
        object.slug = slugMaker(object[slugSrc], slugChars);
        if (old !== object.slug) {
            pushArray.push({ old: old, new: object.slug });
        }
    }

    const switchOldForNew = (arrayOfChanges, arrayOfSlugs) => {
        arrayOfSlugs.forEach((x, index) => {
            let match = arrayOfChanges.find(item => item.old === x);
            if (match) arrayOfSlugs[index] = match.new;
        });
    }

    store.sources.forEach(source => {
        saveSlugChanges({
            object: source, slugSrc: 'title', slugChars: 10, pushArray: changedSourceSlugs
        });

    });

    store.notes.forEach(note => {
        saveSlugChanges({
            object: note, slugSrc: 'text', slugChars: 15, pushArray: changedNoteSlugs
        });

        switchOldForNew(changedSourceSlugs, note.sourceSlugs);
    });

    store.quizCards.forEach(card => {
        saveSlugChanges({
            object: card, slugSrc: 'prompt', slugChars: 15, pushArray: changedCardSlugs
        });

        switchOldForNew(changedNoteSlugs, card.noteSlugs);
    });

    store.quizQueue.forEach((queueCard, index) => {
        let change = changedCardSlugs.find(slug => slug.old === queueCard.slug);
        if (change) store.quizQueue[index].slug = change.new;
    });

    // Not fully incorporated into notes, but will be.
    store.notes.forEach(note => {
        if (!note.prerequisites) return;
        switchOldForNew(changedNoteSlugs, note.prerequisites);
    });
}

const slugMaker = (string, limit = 10) => {
    const toAbreve = [
        { from: 'william', to: 'wm' },
        { from: 'assign', to: 'asgn' },
        { from: 'little', to: 'lil' },
        { from: 'probably', to: 'prbly' },
        { from: 'change', to: 'chg' },
        { from: 'of', to: 'o' },
        { from: 'how', to: 'hw' },
        { from: 'make', to: 'mk' },
        { from: 'should', to: 'shd' },
        { from: 'learn', to: 'lrn' },
        { from: 'review', to: 'rev' },
        { from: 'using', to: 'usg' }, 
        { from: 'element', to: 'elem' },
        { from: 'elements', to: 'elems' },
        { from: 'example', to: 'ex' },
        { from: 'calling', to: 'clg' },
        { from: 'call', to: 'cl' },
        { from: 'remove', to: 'rm' },
        { from: 'default', to: 'dflt' }
    ];
    const toExclude = ['a', 'an', 'are', 'be', 'can', 'introduction', 'intro', 'the', 'when', 'at', 'to', 'you', 'your', 'with', 'following', 'is', 'if', 'for', 'it', 's', 'consider', 'considered', 'both', 'use', 'used'];

    if (string === null || string === undefined) {
        console.log(`Received bad string: ${string} with limit ${limit}`);
        return 'Uh oh!';
    }

    let array = string.trim().toLowerCase().split(/[ '.,-:)(]/)
        .filter(x => toExclude.find(i => i === x) === undefined)
        .map((x, index) => {
            let checkAbreve = toAbreve.find(item => item.from === x);
            let rtn = checkAbreve ?
                checkAbreve.to : x;
            if (index > 0) rtn = rtn.charAt(0).toUpperCase() + rtn.slice(1);
            return rtn;
        });
    let rtnStr = array.join("").substring(0, limit) + '_' + quickHash(string);
    return rtnStr;
}

let makeNewQuizQueue = (quizCards) => {
    let studyDay = daysSince(store.quizQueueDates.start)
    return quizCards.filter(x => !isEmpty(x))
        .map(card => {
            return {
                "slug": card.slug,
                "studyDay": studyDay,
                "dayIncrease": 0
            };
        });
}

const compareInputToAnswer = (quizCard, userResponse) => {
    let correctAnswers = arrayToLower(quizCard.responses);
    let responses = arrayToLower(userResponse);

    if (typeof responses === 'string')
        return correctAnswers.includes(responses);
    if (quizCard.type === 'inOrder' || quizCard.type === 'fillBlank')
        return matchesInOrder(correctAnswers, responses);
    if (quizCard.type === 'noOrder')
        return matchesNoOrder(correctAnswers, responses);
}

let toStudy = (studyCard) => {
    if (daysSince(store.quizQueueDates.start) >= studyCard.studyDay) return true;
    if (studyCard.period || studyCard.dayNumber) alert('Set needs to be updated. quizQueue has invalid properties.');
}

let changeCardFrequency = (studyCard, isCorrect) => {
    studyCard.studyDay = isCorrect && studyCard.dayIncrease > 0 ?
        studyCard.studyDay + studyCard.dayIncrease
        : studyCard.studyDay;
    studyCard.dayIncrease = isCorrect ? studyCard.dayIncrease + 1
        : studyCard.dayIncrease > 0 ? 0 : studyCard.dayIncrease - 1;
    return studyCard;
}

const answersTilDone = (studyCard) => {
    let days = 0
    dummyCard = {
        studyDay: studyCard.studyDay,
        dayIncrease: studyCard.dayIncrease
    }
    while (toStudy(dummyCard)) {
        dummyCard = changeCardFrequency(dummyCard, true)
        days++
    }
    return days
}

const addSourceRefToNotes = (source) => {
    let sourceNote = {
        text: `Title: ${source.title}`,
        type: 'sourceRef',
        sourceSlugs: [source.slug]
    }
    sourceNote.slug = slugMaker(sourceNote.text, 15)
    store.notes.push(sourceNote)
}



/* HTML ELEMENTS */

const getElements = (element, ...selectors) => {
    return selectors.map(x => element.querySelector(x))
}

let clearElem = (element) => {
    if (!element) return;
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

const objectIntoElement = (object, elem) => {
    for (let prop in object) {
        if (!object[prop]) continue
        if (Array.isArray(object[prop])) {
            let list = elem.querySelector(`#${prop}`);
            rebuildInputList(list, object[prop])
            continue;
        }
        let input = elem.querySelector(`#${prop}`);
        if (input && input?.type !== 'date') input.value = object[prop];
        if (input?.type === 'date') {
            let date = new Date(object[prop])
            let year = date.getFullYear()
            let month = date.getMonth() + 1
            let day = date.getDate()
            input.value = `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day}`
        }
        if (prop !== 'slug' && !input) console.log('Uh oh! Not found in HTML:', prop, object[prop])
        if (prop === 'image')
            elem.querySelector('.imagePreview').setAttribute('src', `../public/images/${object[prop]}`);
    }
}

let recordIntoEditor = (record) => {
    let invalid = !record || !record.slug || !record.array;
    if (invalid) {
        console.log('Record not valid', record);
        return;
    }

    let object = readItem(record.slug, store[record.array + 's']);

    let mainEditor = document.querySelector('.editObj');
    mainEditor.classList.remove('add', 'source', 'note', 'quizCard');
    mainEditor.classList.add(record.array);

    let editForm = mainEditor.querySelector(`.${record.array}`);
    editForm.querySelectorAll('input, select').forEach(x => x.value = '');
    editForm.setAttribute('data-slug', object.slug)

    objectIntoElement(object, editForm)
}

let forCard = (card) => {
    let invalidCard = !card?.slug
        || !Array.isArray(card?.responses)
        || !Array.isArray(card?.noteSlugs);
    if (invalidCard) {
        console.log('Please Fix. Invalid quiz card:', card);
        if (card) store.editQueue.push({slug: card.slug, array: 'quizCard'})
        return;
    }
    let rtnCard = document.querySelector('#quizCard').content.cloneNode(true);
    rtnCard.querySelector('.quizCard').setAttribute('data-slug', card.slug)

    let [figure, prompt, response, userInput, note] = 
        getElements(rtnCard, 'figure', '.prompt', '.response', '.userInput', '.note');

    setFigure(figure, card)

    prompt.textContent = card.prompt;
    prompt.setAttribute('for', card.slug);

    card.responses.forEach(x => {
        respItem = document.createElement('p');
        respItem.textContent = x;
        response.appendChild(respItem);
    });

    if (card.prefill) userInput.setAttribute('value', card.prefill);
    if (!card.prefill && card.inputInstruction)
        userInput.setAttribute('placeholder', card.inputInstruction);
    
    userInput.setAttribute('data-slug', card.slug)

    card.noteSlugs.forEach(x => {
        let cardNote = readItem(x, store.notes);
        if (!cardNote) {
            console.log('Invalid note slug:', x);
            return;
        }
        note.appendChild(forNote(cardNote));
    });

    return rtnCard;
}

let forNote = (note) => {
    let invalidNote = !note.slug
        || !Array.isArray(note.sourceSlugs);
    if (invalidNote) {
        console.log('Invalid note:', note);
        return;
    }

    let rtnNote = document.querySelector('#note').content.cloneNode(true);
    let [noteDiv, figure, text, sourceSlugs] = getElements(rtnNote, '.note', 'figure', '.text', '.sourceSlugs')
    
    noteDiv.setAttribute('data-slug', note.slug)

    setFigure(figure, note)

    text.textContent = note.text;
    if(note.type) text.classList.add(note.type);

    note.sourceSlugs.forEach(x => {
        let src = readItem(x, store.sources);
        if (src) sourceSlugs.appendChild(forSource(src));
        if (!src) {
            console.log('This is a question type note.', note);
            let noSource = document.createElement('p');
            noSource.textContent = 'This note is not linked to a source.';
            sourceSlugs.appendChild(noSource);
        }
    });

    return rtnNote;
}

let forSource = (source) => {
    let invalidSource = !source || !source.slug
        || !Array.isArray(source?.authors);
    if (invalidSource) {
        console.log('Invalid source:', source);
        return;
    }

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    let publishedDate = new Date(source.datePub)
    let retrievedDate = new Date(source.dateRetrieved)
    const nonIndivAuthor = ['MDN Contributors', 'W3 Schools']

    let rtnParagraph = document.querySelector('#source').content.cloneNode(true);
    let [srcDiv, authors, datePub, title, collection, dateRetrieved, retrievedFrom] = 
        getElements(rtnParagraph, '.source', '.authors', '.datePub', '.title', '.collection', '.dateRetrieved', '.retrievedFrom')
    
    srcDiv.setAttribute('data-slug', source.slug)
    source.authors.forEach((x, index) => {
        if (index > 0 && source.authors.length > 2) authors.textContent += ', '
        if (index > 0 && source.authors.length === 2) authors.textContent += ' '
        if (index > 0 && index === source.authors.length - 1) authors.textContent += '& '
        if (nonIndivAuthor.includes(x) || x.split(' ').length === 1) { 
            authors.textContent += `${x}`; 
        } else {
            let nameArray = x.split(' ')
            let lastName = nameArray[nameArray.length - 1]
            let firstInitial = nameArray[0].slice(0, 1) + '.'
            let secondInitial = nameArray.length > 2 ? nameArray[1].slice(0, 1) + '.' : null
            authors.textContent += `${lastName}, ${firstInitial}`
            if (secondInitial) authors.textContent += ` ${secondInitial}`
        }        
    });
    datePub.textContent = source.datePub ? 
        `${publishedDate.getFullYear()}, ${months[publishedDate.getMonth()]} ${publishedDate.getDate()}` 
        : 'n.d.';
    title.textContent = source.title;
    if (source.collection) collection.textContent = `${source.collection}.`;
    dateRetrieved.textContent = source.dateRetrieved ?
        `${months[retrievedDate.getMonth()]} ${retrievedDate.getDate()}, ${retrievedDate.getFullYear()}` 
        : '';
    retrievedFrom.textContent = source.retrievedFrom;
    retrievedFrom.setAttribute('href', source.retrievedFrom);

    return rtnParagraph;
}

let arrayToUL = (array, className = null) => {
    if (!Array.isArray(array))
        return dispObject(array, className);

    let list = document.createElement('ul');
    if (className === 0 || className) list.classList.add(className);

    array.filter(x => !isEmpty(x)).forEach(x => {
        let listItem = document.createElement('li');
        if (className[className.length - 1] === 's')
            className = className.substring(0, className.length - 1);
        let display = dispObject(x, className);
        if (display) listItem.appendChild(display);
        list.appendChild(listItem);
    });

    return list;
}

let dispObject = (object, className = null) => {
    if (object == null) return;

    if (className === 'source') return forSource(object)
    if (className === 'note') return forNote(object)
    if (className === 'quizCard') return forCard(object)

    if (Array.isArray(object)) return arrayToUL(object, className);

    let display;
    if (typeof object != 'object') {
        display = document.createElement('p');
        if (className == 0 || className) display.classList.add(className);
        display.textContent = object;
        return display;
    }

    display = document.createElement('fieldset');
    if (className != null) {
        display.classList.add(className);
        let legend = document.createElement('legend');
        legend.textContent = className;
        display.appendChild(legend);
    }

    let items = [];
    for (let prop in object) {
        if (!isEmpty(object[prop]))
            items.push(dispObject(object[prop], prop));
    }
    items.forEach(x => display.appendChild(x));

    return display;
}

const setFigure = (figure, record) => {
    let image = figure.querySelector('img')
    if (!record.image) {
        image.removeAttribute('src')
        return 
    }
    let caption = figure.querySelector('figcaption')
    if (record.caption) caption.textContent = record.caption
    image.setAttribute('src', `../public/images/${record.image}`)
    image.setAttribute('alt', record.caption ? record.caption : '')
}

const fillDatalist = (datalist, array, optionText = null) => {
    clearElem(datalist);
    array.forEach(x => {
        let opt = document.createElement('option')
        opt.value = x.slug ? x.slug : x
        if (!optionText) opt.textContent = x
        if (optionText == 'FILENAME') opt.textContent = x.split('/')[x.split('/').length - 1]
        if (optionText && optionText != 'FILENAME') opt.textContent = x[optionText]
        datalist.appendChild(opt)
    })
}

const loadDatalistsIntoEditor = (datalists) => {
    datalists.forEach(x => {
        let array
        let optionText = null;
        
        if (x.id === 'sourceSlugList') {
            array = store.sources
            optionText = 'title'
        }
        if (x.id === 'noteSlugList') {
            array = store.notes
            optionText = 'text'
        }
        if (x.id === 'images') {
            array = store.images
            optionText = 'FILENAME'
        }
        fillDatalist(x, array, optionText)
    });
}

const inputsToObject = (editForm) => {
    let inputs = editForm.querySelectorAll('input, select');
    if (!inputs) {
        console.log('The edit form could not be used:', editForm);
        return;
    }

    let newObj = {};
    newObj.slug = editForm.getAttribute('data-slug');
    inputs.forEach(input => {
        if (!input.id) {
            let list = input.parentElement.parentElement;
            if (!list.id) {
                console.log('Missing ID for', list);
                return;
            }
            if (!newObj[list.id] && input.value) newObj[list.id] = [];
            if (input.value) newObj[list.id].push(input.value);
            return;
        }
        if (input.value) newObj[input.id] = input.value;
    });
    return newObj;
}





/* USER INTERFACE */
const displayFile = document.querySelector('.displayFile')

const setUpQuizQueue = (store) => {
    if (isEmpty(store.quizQueueDates)) store.quizQueueDates = {
        "start": new Date(),
        "lastStudy": new Date()
    };
    if (isEmpty(store.quizQueue)) store.quizQueue = makeNewQuizQueue(store.quizCards);
    
    setToStudy = shuffleArray(store.quizQueue.filter(x => toStudy(x)));
    cardIntoQuiz(setToStudy[0]);
}

const fillListsWithRecords = (theStore) => {
    clearElem(displayFile)
    let mainClone = document.querySelector('#main').content.cloneNode(true);
    
    mainClone.querySelector('.quizCards').appendChild(dispObject(theStore.quizCards, 'quizCards'));
    mainClone.querySelector('.notes').appendChild(dispObject(theStore.notes, 'notes'));
    mainClone.querySelector('.sources').appendChild(dispObject(theStore.sources, 'sources'));

    displayFile.appendChild(mainClone);
}

const load = () => {
    document.querySelector('.saveBtn').disabled = true;
    setUpQuizQueue(store)
    fillListsWithRecords(store)
    console.log('File loaded!', store);
}

const loadJSON = (files) => {
    let reader = new FileReader();
    reader.onload = () => {
        store = JSON.parse(reader.result)
        load()
    };
    reader.onerror = () => alert('Could not load file.');
    reader.readAsText(files[0]);
}

const loadImgPrev = (input) => {
    let preview = input.parentElement.querySelector('.imagePreview');
    let caption = input.parentElement.querySelector('#caption').value;
    if (input.value) preview.setAttribute('src', `../public/images/${input.value}`);
    if (caption) preview.setAttribute('alt', caption);
    if (!input.value) preview.removeAttribute('src');
    if (!caption) preview.removeAttribute('alt');
}

const fillBlank = (string, labelBy) => {
    let rtnParagraph = document.createElement('p');

    let rtnArray = string.split('__');
    rtnArray.forEach((x, index) => {
        let span = document.createElement('span');
        span.textContent = x;
        rtnParagraph.appendChild(span);
        if (index === rtnArray.length - 1) return; 
        let input = document.createElement('input');
        input.setAttribute('aria-labelledby', labelBy);
        input.type = 'text';
        rtnParagraph.appendChild(input);
    });

    return rtnParagraph;
}

let cardIntoQuiz = (studyCard) => {
    let invalid = !studyCard || !studyCard.slug
        || Number.isNaN(studyCard.studyDay) || Number.isNaN(studyCard.dayIncrease)
    if (invalid)
        console.log(studyCard ? 'Study card not valid' : 'All out of cards! Good work today!', studyCard);
    let quizCard = readItem(studyCard?.slug, store.quizCards);
    if (!quizCard && !invalid) console.log('Quiz Card not available or does not match ID:', studyCard);
    if (invalid || !quizCard) return;

    let quizSection = document.querySelector('.quiz');
    quizSection.setAttribute('data-slug', studyCard.slug)
    quizSection.querySelector('#response').replaceWith(rebuildUserResponse(quizCard));

    let [prompt, feedback, figure, numberRemaining, input, checkAnswer, userResponse] = 
        getElements(quizSection, '#prompt', '#feedback', 'figure', '#numberRemaining', 'input', '#checkAnswer', '#response')

    prompt.textContent = quizCard.type === 'fillBlank' ? 'Fill in the Blank:' : quizCard.prompt;
    checkAnswer.disabled = false;
    if (!isEmpty(quizCard.choices)) addChoices(quizCard.choices, userResponse);
    input.focus();

    feedback.textContent = 'Please answer'
    feedback.className = 'not-answered'

    setFigure(figure, quizCard)
    numberRemaining.textContent = setToStudy.filter(x => toStudy(x)).length;
}

const rebuildUserResponse = (quizCard) => {
    let resp;
    if (quizCard.type === 'inOrder' || quizCard.type === 'noOrder') {
        resp = document.createElement(quizCard.type === 'noOrder' ? 'ul' : 'ol');
        quizCard.responses.forEach(() => {
            let listItem = document.createElement('li');
            let inputItem = document.createElement('input');
            inputItem.setAttribute('aria-labelledby', 'prompt');
            if (quizCard.prefill) inputItem.value = quizCard.prefill;
            if (quizCard.inputInstruction && !quizCard.prefill)
                inputItem.setAttribute('placeholder', quizCard.inputInstruction);
            listItem.appendChild(inputItem);
            resp.appendChild(listItem);
        });
    }

    if (quizCard.type === 'promptResponse') {
        resp = document.createElement('input');
        if (quizCard.prefill) resp.value = quizCard.prefill;
        if (quizCard.inputInstruction && !quizCard.prefill)
            resp.setAttribute('placeholder', quizCard.inputInstruction);
    }

    if (quizCard.type === 'fillBlank') {
        resp = fillBlank(quizCard.prompt, 'response');
    }

    if (isEmpty(quizCard.choices)) {
        clearElem(document.querySelector('.quiz').querySelector('#choiceList'));
        resp.removeAttribute('list');
    } else {
        resp.setAttribute('list', 'choiceList');
    }
    
    resp.id = 'response';
    return resp;
}

const addChoices = (choices, userResponse) => {
    let datalist = quizSection.querySelector('#choiceList');
    if (userResponse.tagName === 'INPUT') userResponse.setAttribute('list', 'choiceList');
    if (userResponse.tagName !== 'INPUT') {
        userResponse.querySelectorAll('input').forEach(x => {
            x.setAttribute('list', 'choiceList');
        });
    }
    fillDatalist(datalist, choices)
}

const rebuildInputList = (list, array = null) => {
    let invalid = !list || (list.tagName !== 'UL' && list.tagName !== 'OL')
    if (invalid) {
        console.error('List invalid: ', list)
        return
    }
    let firstLI = list.firstElementChild
    let firstInput = firstLI.querySelector('input')
    if (!firstInput) return
    firstInput.removeAttribute('placeholder')
    firstInput.value = ""
    let buttonLI = list.querySelector('button').parentElement
    clearElem(list)
    if (!array) list.appendChild(firstLI)
    if (array) {
        array.forEach(x => {
            let inputLiClone = firstLI.cloneNode(true)
            inputLiClone.querySelector('input').value = x
            list.appendChild(inputLiClone)
        })
    }
    list.appendChild(buttonLI)
}



//Button functions and their binders
const saveRecord = (button, isNew = false) => {
    let mainEditor = document.querySelector('.editObj');
    let recordType = mainEditor.classList[1];
    let arrayName = recordType + 's';
    let array = store[arrayName];

    let [editForm, image] = getElements(mainEditor, `.${recordType}`, '#image')
    
    if (isNew) editForm.setAttribute('data-slug', 'newSlug')
    let newObject = inputsToObject(editForm);

    const newStudyDay = (quizCard) => {
        queueObject = {
            slug: quizCard.slug,
            studyDay: quizCard.study ? parseInt(quizCard.studyDay) + daysSince(store.quizQueueDates.start) : daysSince(store.quizQueueDates.start),
            dayIncrease: 0
        };

        readItem(quizCard.slug, store.quizQueue) ?
            updateItem(quizCard.slug, store.quizQueue, queueObject)
            : store.quizQueue.push(queueObject);

        delete quizCard.studyDay;
    }

    if (!store.images) store.images = [];
    if (!store.images.includes(image.value)) store.images.push(image.value);

    if (newObject.slug === 'newSlug' || !newObject.slug) {
        if (recordType === 'quizCard') {
            newObject.slug = slugMaker(
                newObject.image ? newObject.prompt + newObject.image : newObject.prompt, 15
            );
        }
        if (recordType === 'note')
            newObject.slug = slugMaker(newObject.text, 15);
        if (recordType === 'source') {
            newObject.slug = slugMaker(newObject.title, 10);
            addSourceRefToNotes(newObject)
        }
    }
    if (store.editQueue) deleteItem(newObject.slug, store.editQueue);
    if (recordType === 'quizCard') newStudyDay(newObject);
    readItem(newObject.slug, array) ?
        updateItem(newObject.slug, array, newObject) : array.push(newObject);
    
    let records = document.querySelectorAll(`[data-slug=${newObject.slug}]`)
    records.forEach(x => {
        console.log(x)
        if (x.classList.contains('quiz')) {
            cardIntoQuiz(newObject)
            x.querySelector('input.toEdit').checked = false
            return
        }
        if (x.classList.contains('userInput') || x.parentElement.classList.contains('editObj')) return
        x.replaceWith(dispObject(newObject, recordType))
    })
    if (!displayFile.querySelector(`[data-slug=${newObject.slug}]`)) {
        let listItem = document.createElement('li')
        let list = displayFile.querySelector(`ul.${arrayName}`)
        listItem.appendChild(dispObject(newObject, recordType))
        list.appendChild(listItem)
    }

    editForm.setAttribute('data-slug', 'newSlug')
}

const addInput = (button) => {
    listItem = button.parentElement;
    list = button.parentElement.parentElement;
    let newInput = list.querySelector('input, select').cloneNode(true);
    newInput.value = null;
    let newListItem = document.createElement('li');
    newListItem.appendChild(button);
    list.appendChild(newListItem);
    listItem.appendChild(newInput);
}

const checkAnswer = (button) => {
    const answerWrongFeedback = (responseArray, studyCard) => {
        let feedback = document.createElement('ul');
        feedback.textContent = responseArray.length === 1 ? 
            'Sorry, the correct response is ' : 'Sorry, the correct responses are ';
        responseArray.forEach(x => {
            let listItem = document.createElement('li')
            let answer = document.createElement('span')
            answer.className = 'correct'
            answer.textContent = x
            listItem.appendChild(answer)
            feedback.appendChild(listItem)
        })
        let getRight = document.createElement('li')
        getRight.textContent = `You will need to answer correctly ${answersTilDone(studyCard)} times.`
        if (studyCard.mnemonic) getRight.textContent += ` Remember: ${studyCard.mnemonic}`
        if (studyCard.dayIncrease <= -2 && !studyCard.mnemonic || studyCard.dayIncrease <= -4) {
            let mnemonic = document.getElementById('mnemonic').content.cloneNode(true)
            getRight.appendChild(mnemonic)
            getRight.setAttribute('data-slug', studyCard.slug)
        }
        feedback.appendChild(getRight)
        return feedback
    }

    const answerRightFeedback = (studyCard) => {
        let affirmations = ['Good job!', 'You\'re awesome!', 'Keep it up!', 'You make the world a smarter place!', 'I knew you could do it!']
        let affirmation = affirmations[Math.floor(Math.random() * affirmations.length)]
        let info = toStudy(studyCard) ? `Answer correctly ${answersTilDone(studyCard)} more times.` : 'You are done with this question today!'
        let feedback = document.createElement('p')
        feedback.textContent = `${affirmation} ${info}`
        return feedback
    }

    let quizSection = document.querySelector('.quiz');
    let [responseElem, feedback, numberRemaining] = getElements(quizSection, '#response', '#feedback', '#numberRemaining')
    //let responseElem = quizSection.querySelector('#response');
    let response;
    if (responseElem.tagName === 'INPUT') {
        response = responseElem.value;
    }
    if (responseElem.tagName !== 'INPUT') {
        response = [];
        responseElem.querySelectorAll('input, select')
            .forEach(x => response.push(x.value));
    }
    //let feedback = quizSection.querySelector('#feedback');
    let noteDiv = button.parentElement.querySelector('.note');
    if (responseElem.value == '') return;
    clearElem(feedback)
    button.disabled = true;
    let slug = button.parentElement.getAttribute('data-slug');
    let quizCard = readItem(slug, store.quizCards);
    let studyCard = readItem(slug, store.quizQueue);
    let isCorrect = compareInputToAnswer(quizCard, response);
    updateItem(slug, store.quizQueue, changeCardFrequency(studyCard, isCorrect));
    feedback.appendChild(isCorrect ?
        answerRightFeedback(studyCard) 
        : answerWrongFeedback(quizCard.responses, studyCard)
    )
    feedback.classList.remove('not-answered', isCorrect ? 'incorrect' : 'correct');
    feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
    quizCard.noteSlugs.forEach(x => {
        noteDiv.appendChild(forNote(readItem(x, store.notes)));
    });

    //let numberRemaining = quizSection.querySelector('#numberRemaining');
    numberRemaining.textContent = setToStudy.filter(x => toStudy(x)).length;
}

const changeStudyCard = (button, direction = 1) => {
    const answerProvided = (elem) => {
        if (elem.tagName === 'INPUT' && elem.value != '') return true;
        if (elem.tagName !== 'INPUT') {
            let didAnswer = true;
            elem.querySelectorAll('input').forEach(x => {
                if (x.value == '') didAnswer = false;
            });
            return didAnswer;
        }
        return false;
    }

    let quizSection = document.querySelector('.quiz');
    let userResponse = quizSection.querySelector('#response');
    let feedback = quizSection.querySelector('#feedback');
    let noteDiv = button.parentElement.querySelector('.note');
    if (!answerProvided(userResponse)) {
        feedback.textContent = 'But you have not given an answer!';
        return;
    }
    let slug = quizSection.getAttribute('data-slug');
    let index = setToStudy.indexOf(readItem(slug, setToStudy));
    index += direction;
    if (index >= setToStudy.length) {
        setToStudy = shuffleArray(
            store.quizQueue.filter(x => toStudy(x))
        );
        index = 0;
    }
    if (index < 0) {
        index = setToStudy.length - 1;
    }
    clearElem(noteDiv);
    cardIntoQuiz(setToStudy[index]);
}

const editNext = () => {
    let mainEdit = document.querySelector('.editObj');
    if (store.editQueue.length === 0) {
        mainEdit.classList.remove('source', 'note', 'quizCard');
        mainEdit.classList.add('add');
        return;
    }

    let datalists = mainEdit.querySelectorAll('datalist');
    loadDatalistsIntoEditor(datalists);
    let recordType = mainEdit.classList[1];
    let editForm = mainEdit.querySelector(`.${recordType}`);
    let index = store.editQueue.indexOf(readItem(editForm.getAttribute('data-slug'), store.editQueue));
    index += 1;
    if (index >= store.editQueue.length) index = 0;
    if (index < 0) index = store.editQueue.length - 1;
    recordIntoEditor(store.editQueue[index]);
}


// BUTTON CLICK EVENTS
document.addEventListener('click', e => {
    if (e.target.tagName != 'BUTTON') return;

    if (e.target.className === 'saveBtn') {
        document.querySelector('.saveBtn').disabled = true;
        saveRecord(e.target);
    }

    if (e.target.className === 'saveNew') {
        saveRecord(e.target, true);
    }

    if (e.target.className === 'addInput') {
        addInput(e.target);
    }

    if (e.target.className === 'editNext') {
        editNext();
    }

    if (e.target.id === 'checkAnswer') {
        checkAnswer(e.target);
    }

    if (e.target.id === 'next') {
        changeStudyCard(e.target);
    }

    if (e.target.id === 'previous') {
        changeStudyCard(e.target, -1);
    }

    if (e.target.className === 'mnem') {
        let slug = e.target.parentElement.getAttribute('data-slug')
        let input = e.target.parentElement.querySelector('#mnem')
        readItem(slug, store.quizQueue).mnemonic = input.value
    }

    if (e.target.className === 'backToSelect') {
        document.querySelector('.saveBtn').disabled = true;
        let mainEdit = document.querySelector('.editObj');
        let whatEdit = mainEdit.querySelector('#whatEdit');
        whatEdit.value = 'add';
        mainEdit.classList.remove('source', 'note', 'quizCard');
        mainEdit.classList.add('add');
    }

    if (e.target.className === 'jsonOutput') {
        let jsonDisplay = document.querySelector('#jsonDisplay');
        if (store.quizQueueDates) store.quizQueueDates.lastStudy = new Date();
        jsonDisplay.value = JSON.stringify(store, null, 2);
        jsonDisplay.parentElement.setAttribute('open', true);
    }

    if (e.target.className === 'createNew') {
        store = {
            sources: [],
            notes: [],
            quizCards: [],
            quizQueueDates: {
                start: new Date(),
                lastStudy: new Date()
            }
        };
        clearElem(displayFile)
        load()
    }

    if (e.target.className === 'slugBath') {
        slugBath(store);
        let jsonDisplay = document.querySelector('#jsonDisplay');
        jsonDisplay.textContent = JSON.stringify(store, null, 2);
    }

    if (e.target.className === 'reload') {
        clearElem(displayFile);
        load()
    }
});

// INPUT OR SELECT CHANGES
document.querySelector('.quiz').addEventListener('keydown', e => {
    if (e.keyCode === 13) {
        document.querySelector('#checkAnswer').click();
    }
});

document.addEventListener('change', e => {
    if (e.target.className === 'toEdit') {
        let slug = e.target.parentElement.getAttribute('data-slug');
        if (!slug) console.log('This element does not have your slug:', e.target);
        let objType = e.target.parentElement.className;
        if (objType === 'quiz') objType = 'quizCard'
        let validType = objType === 'source'
            || objType === 'note'
            || objType === 'quizCard';
        if (!validType) console.log('You have the wrong record type', objType, e.target.parentElement);
        if (!store.editQueue) store.editQueue = [];
        if (e.target.checked && !store.editQueue.includes({ slug: slug, array: objType })) {
            store.editQueue.push({ slug: slug, array: objType });
        } else {
            deleteItem(slug, store.editQueue);
        }
    }

    if (e.target.id === 'whatEdit') {
        let mainEditor = document.querySelector('.editObj');
        mainEditor.classList.remove('add', 'source', 'note', 'quizCard');
        mainEditor.classList.add(e.target.value);
        let editForm = mainEditor.querySelector(`.${e.target.value}`)
        let datalists = mainEditor.querySelectorAll('datalist');
        let inputLists = editForm.querySelectorAll('ul, ol');
        inputLists.forEach(x => rebuildInputList(x))
        loadDatalistsIntoEditor(datalists)
        let inputs = editForm.querySelectorAll('input');
        let imagePreviews = mainEditor.querySelectorAll('.imagePreview');
        imagePreviews.forEach(x => x.removeAttribute('src'));
        inputs.forEach(x => x.value = '');
    }

    if (e.target.id === 'image') {
        loadImgPrev(e.target);
    }

    if (e.target.id === 'fileSelect') {
        loadJSON(e.target.files);
    }
});

document.querySelector('.editObj').addEventListener('input', e => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') return;
    document.querySelector('.saveBtn').disabled = false;
});

// Start program!
load();