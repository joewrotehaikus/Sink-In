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

// Not implemented, but intended for use with sources references that require page numbers
// Some page numbers use Roman numerals
let isPagination = (pageNumber) => {
    const pagination = /^([0-9]+|[ivxlcdm]+)$/i;
    return pagination.test(pageNumber);
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
        if (x.id && x.id == id) return true;
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

let isEmpty = (object, id = null, array = null) => {
    if (typeof object == 'number') return false;
    let record = object ? object : readItem(id, array);
    if (record === null) return true;
    if (Array.isArray(record))
        return record.every(x => isEmpty(x));
    if (typeof record == 'object') {
        for (let prop in record) {
            if (prop === 'id') continue;
            if (prop === 'slug') continue;
            if (prop === 'type') continue;
            if (isEmpty(record[prop])) continue;
            if (!isEmpty(record[prop])) return false;
        }
        return true;
    }
    if (record !== '') return false;
}

let updateItem = (id, array, updatedObject = null) => {
    if (!Array.isArray(array)) return null;
    if (id == null) return null;

    let index = array.indexOf(readItem(id, array));
    if (updatedObject === null) {
        updatedObject = createItem(array);
        if (updatedObject.slug) updatedObject.slug = id;
        if (updatedObject.id) updatedObject.id = id;
        array.pop();
    } // no curr use case, consider escaping if null updatedObj

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

const quickHash = (string, limit = 1000) => {
    number = 0;
    for (let i in string) {
        number += string.charCodeAt(i)
    }
    return number % limit;
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
    return quizCards.filter(x => !isEmpty(x))
        .map(card => {
            return {
                "slug": card.slug,
                "studyDay": daysSince(store.quizQueueDates.start),
                "dayIncrease": 0
            };
        });
}

let daysSince = (date) => {
    let today = new Date();
    let dateOfInterest = new Date(date);
    return Math.round((today - dateOfInterest) / 86400000);
}

let toStudy = (studyCard) => {
    if (daysSince(store.quizQueueDates.start) >= studyCard.studyDay) return true;
    if (studyCard.period || studyCard.studyDay) alert('Set needs to be updated. quizQueue has invalid properties.');
}

let changeCardFrequency = (studyCard, isCorrect) => {
    studyCard.studyDay = isCorrect && studyCard.dayIncrease > 0 ?
        studyCard.studyDay + studyCard.dayIncrease
        : studyCard.studyDay;
    studyCard.dayIncrease = isCorrect ? studyCard.dayIncrease + 1
        : studyCard.dayIncrease > 0 ? 0 : studyCard.dayIncrease - 1;
    return studyCard;
}



/* HTML ELEMENTS */

let forCard = (card) => {
    let invalidCard = !card?.slug
        || !Array.isArray(card?.responses)
        || !Array.isArray(card?.noteSlugs);
    if (invalidCard) {
        console.log('Invalid quiz card:', card);
        return;
    }
    let rtnCard = document.querySelector('#quizCard').content.cloneNode(true);
    rtnCard.querySelector('.quizCard').id = card.slug;

    let figure = rtnCard.querySelector('figure');
    let caption = figure.querySelector('figcaption');
    let image = figure.querySelector('img');
    if (card.image) image.setAttribute('src', `../public/images/${card.image}`);
    if (card.caption) {
        caption.textContent = card.caption;
        image.setAttribute('alt', card.caption);
    }

    let prompt = rtnCard.querySelector('.prompt');
    prompt.textContent = card.prompt;
    prompt.setAttribute('for', card.slug);

    let response = rtnCard.querySelector('.response');
    card.responses.forEach(x => {
        respItem = document.createElement('p');
        respItem.textContent = x;
        response.appendChild(respItem);
    });

    let userInput = rtnCard.querySelector('.userInput');
    if (card.prefill) userInput.setAttribute('value', card.prefill);
    if (!card.prefill && card.inputInstruction)
        userInput.setAttribute('placeholder', card.inputInstruction);
    userInput.id = card.slug;

    let note = rtnCard.querySelector('.note');
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
    let noteDiv = rtnNote.querySelector('.note');
    noteDiv.id = note.slug;

    let figure = rtnNote.querySelector('figure');
    let caption = figure.querySelector('figcaption');
    let image = figure.querySelector('img');
    if (note.image) {
        image.setAttribute('src', `../public/images/${note.image}`);
        if (note.caption) {
            caption.textContent = note.caption;
            image.setAttribute('alt', note.caption);
        }
    }

    let text = rtnNote.querySelector('.text');
    text.textContent = note.text;
    if(note.type) text.classList.add(note.type);

    let sourceSlugs = rtnNote.querySelector('.sourceSlugs');
    note.sourceSlugs.forEach(x => {
        let src = readItem(x, store.sources);
        if (src) sourceSlugs.appendChild(forBibliography(src));
        if (!src) {
            console.log('This is a question type note.', note);
            let noSource = document.createElement('p');
            noSource.textContent = 'This note is not linked to a source.';
            sourceSlugs.appendChild(noSource);
        }
    });

    return rtnNote;
}

// This needs to be prettied up
let forBibliography = (source) => {
    let invalidSource = !source || !source.slug
        || !Array.isArray(source?.authors);
    if (invalidSource) {
        console.log('Invalid source:', source);
        return;
    }

    let rtnParagraph = document.querySelector('#source').content.cloneNode(true);
    let srcDiv = rtnParagraph.querySelector('.source');
    srcDiv.id = source.slug;

    let authors = rtnParagraph.querySelector('.authors');
    source.authors.forEach(x => {
        authors.textContent += `${x}, `;
    });

    let datePub = rtnParagraph.querySelector('.datePub');
    datePub.textContent = source.datePub ? source.datePub : 'n.d.';

    let title = rtnParagraph.querySelector('.title');
    title.textContent = source.title;

    let collection = rtnParagraph.querySelector('.collection');
    collection.textContent = source.collection;

    let dateRetrieved = rtnParagraph.querySelector('.dateRetrieved');
    dateRetrieved.textContent = source.dateRetrieved;

    let retrievedFrom = rtnParagraph.querySelector('.retrievedFrom');
    retrievedFrom.textContent = source.retrievedFrom;
    retrievedFrom.setAttribute('href', source.retrievedFrom);

    return rtnParagraph;
}

let arrayToUL = (array, className = null, options = null) => {
    if (!Array.isArray(array))
        return dispObject(array, className, options);

    let list = document.createElement('ul');
    if (className === 0 || className) list.classList.add(className);

    array.filter(x => !isEmpty(x)).forEach(x => {
        let listItem = document.createElement('li');
        if (className[className.length - 1] === 's')
            className = className.substring(0, className.length - 1);
        let display = dispObject(x, className, options);
        listItem.appendChild(display);
        list.appendChild(listItem);
    });

    return list;
}

// Many questions here:
// Can we get rid of options and defaultOptions?
// It was supposed to be forward thinking, but I think it just creates confusion
// We use to need displayWith prop in options, but now it's the only prop
let dispObject = (object, className = null, options = defaultOptions) => {
    if (object == null) return;
    if (options) {
        let rtnFunc = options.displayWith.find(x => x.className === className);
        if (rtnFunc) return rtnFunc.function(object, className);
    }

    if (Array.isArray(object)) return arrayToUL(object, className, options);

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

const inputsToObject = (editForm) => {
    let inputs = editForm.querySelectorAll('input, select');
    if (!inputs) {
        console.log('The edit form could not be used:', editForm);
        return;
    }

    let newObj = {};
    newObj.slug = editForm.id;
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

// This func can be more generalized if you pass in the array and use the switch to call it
const fillDatalist = (datalist) => {
    let arrayName, optText;
    switch (datalist.id) {
        case 'noteSlugList':
            arrayName = 'notes';
            optText = 'text';
            break;
        case 'sourceSlugList':
            arrayName = 'sources';
            optText = 'title';
            break;
        case 'images':
            arrayName = 'images';
            optText = '';
            break;
        default:
            console.log('Invalid datalist:', datalist);
            return;
    }
    clearElem(datalist);
    if (store[arrayName]) store[arrayName].forEach(x => {
        let opt = document.createElement('option');
        if (x.slug) opt.value = x.slug;
        if (!x.slug) opt.value = x;
        if (x[optText]) opt.textContent = x[optText];
        if (optText == '') opt.textContent = x.split('/')[x.split('/').length - 1];
        datalist.appendChild(opt);
    });
}


const compareInputToAnswer = (quizCard, userResponse) => {
    const arrayToLower = (array) => {
        if (!Array.isArray(array)) return array.toLowerCase();
        return array.map(x => {
            if (Array.isArray(x)) return arrayToLower(x);
            return x.toLowerCase();
        });
    }

    const matchesInOrder = (answers, responses) => {
        for (let i = 0; i < answers.length; i++) {
            if (Array.isArray(answers[i]) && !answers[i].includes(responses[i]))
                return false;
            if (typeof answers[i] === 'string' && answers[i] !== responses[i])
                return false;
        }
        return true;
    }

    const matchesNoOrder = (answers, responses) => {
        if (answers.length !== responses.length) return false;
        for (let i = 0; i < answers.length; i++) {
            if (Array.isArray(answers[i]) && !responses.some(x => answers[i].includes(x)))
                return false;
            if (!responses.includes(answers[i])) return false;
        }
        return true;
    }

    let correctAnswers = arrayToLower(quizCard.responses);
    let responses = arrayToLower(userResponse);

    if (typeof responses === 'string')
        return correctAnswers.includes(responses);
    if (quizCard.type === 'inOrder' || quizCard.type === 'fillBlank')
        return matchesInOrder(correctAnswers, responses);
    if (quizCard.type === 'noOrder')
        return matchesNoOrder(correctAnswers, responses);
}



/* USER INTERFACE */
const insert = document.querySelector('#insert');
const fileLoadOutput = document.querySelector('.fileLoadOutput');
const displayFile = document.querySelector('.displayFile');

// We're going to be eyeballing this soon
// If we keep, defaultOptions will be changed out with displayWith, so you don't have to go so deep
const defaultOptions = {
    displayWith: [
        {
            className: 'source',
            function: (source) => forBibliography(source)
        },
        {
            className: 'note',
            function: (note) => forNote(note)
        },
        {
            className: 'quizCard',
            function: (card) => forCard(card)
        }
    ]
}

let load = () => {
    // Setting everything up:
    // 1. Get the quizQueue ready
    document.querySelector('.saveBtn').disabled = true;
    if (isEmpty(store.quizQueue)) store.quizQueue = makeNewQuizQueue(store.quizCards);
    if (isEmpty(store.quizQueueDates)) store.quizQueueDates = {
        "start": new Date(),
        "lastStudy": new Date()
    };
    // 2. Load quizQueue into study set
    setToStudy = shuffleArray(store.quizQueue.filter(x => toStudy(x)));
    // 3. Load study set into the quiz, so the user can start quizzing!
    cardIntoQuiz(setToStudy[0]);
    console.log('File loaded!', store);
    let mainTemp = document.querySelector('#main');
    let mainClone;
    if (mainTemp) {
        mainClone = mainTemp.content.cloneNode(true);
    } else {
        console.log('There is an issue with the template in your HTML file. Please correct.');
        return;
    }
    let quizCards = mainClone.querySelector('.quizCards');
    let notes = mainClone.querySelector('.notes');
    let sources = mainClone.querySelector('.sources');

    quizCards.appendChild(dispObject(store.quizCards, 'quizCards'));
    notes.appendChild(dispObject(store.notes, 'notes'));
    sources.appendChild(dispObject(store.sources, 'sources'));

    displayFile.appendChild(mainClone);
}

let reload = (elem) => {
    clearElem(elem);
    load();
}

let clearElem = (element) => {
    if (!element) return;
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

let loadJSON = (files) => {
    let reader = new FileReader();
    reader.onload = () => {
        store = JSON.parse(reader.result);
        reload(displayFile);
    };
    reader.onerror = () => alert('Could not load file.');
    reader.readAsText(files[0]);
}

let recordIntoEditor = (record) => {
    let invalid = !record || !record.slug || !record.array;
    if (invalid) {
        console.log('Record not valid', record);
        return;
    }

    let mainEditor = document.querySelector('.editObj');
    mainEditor.classList.remove('add', 'source', 'note', 'quizCard');
    mainEditor.classList.add(record.array);
    let editForm = mainEditor.querySelector(`.${record.array}`);
    editForm.querySelectorAll('input, select').forEach(x => {
        x.value = '';
    });
    let object = readItem(record.slug, store[record.array + 's']);
    editForm.id = object.slug;

    for (let prop in object) {
        if (Array.isArray(object[prop])) {
            let list = editForm.querySelector(`#${prop}`);
            if (!list) console.log('List not found:', prop, object[prop]);
            let buttonLi = list.querySelector('button').parentElement;
            let inputLi = list.firstElementChild;
            clearElem(list);
            object[prop].forEach(x => {
                let inputLiClone = inputLi.cloneNode(true);
                inputLiClone.querySelector('input').value = x;
                list.appendChild(inputLiClone);
            });
            list.appendChild(buttonLi);
            continue;
        }
        let input = editForm.querySelector(`#${prop}`);
        if (input) input.value = object[prop];
        if (prop !== 'slug' && !input) console.log('Uh oh! Not found in HTML:', prop, object[prop])
        if (prop === 'image')
            editForm.querySelector('.imagePreview').setAttribute('src', `../public/images/${object[prop]}`);
    }
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
    let invalid = !studyCard
        || !studyCard.slug
        || Number.isNaN(studyCard.studyDay)
        || Number.isNaN(studyCard.dayIncrease)
    if (invalid) {
        console.log(studyCard ? 'Study card not valid' : 'All out of cards! Good work today!', studyCard);
        return;
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
            clearElem(quizSection.querySelector('#choiceList'));
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
        choices.forEach(x => {
            let opt = document.createElement('option');
            opt.textContent = x;
            opt.value = x;
            datalist.appendChild(opt);
        });
    }

    let quizSection = document.querySelector('.quiz');
    quizSection.id = studyCard.slug;
    let quizCard = readItem(studyCard.slug, store.quizCards);
    if (!quizCard) {
        console.log('Quiz Card not available or does not match ID:', studyCard);
        return;
    }

    let prompt = quizSection.querySelector('#prompt');
    if (quizCard.type === 'fillBlank') {
        prompt.textContent = 'Fill in the Blank:'
    } else {
        prompt.textContent = quizCard.prompt;
    }

    let checkBtn = quizSection.querySelector('#checkAnswer');
    checkBtn.disabled = false;

    quizSection.querySelector('#response').replaceWith(rebuildUserResponse(quizCard));
    let userResponse = quizSection.querySelector('#response');

    if (!isEmpty(quizCard.choices)) addChoices(quizCard.choices, userResponse);

    quizSection.querySelector('input, select').focus();

    let feedback = quizSection.querySelector('#feedback');
    feedback.textContent = 'Please answer';
    feedback.classList.remove('correct', 'incorrect');
    feedback.classList.add('not-answered');

    let figure = quizSection.querySelector('figure');
    let image = figure.querySelector('img');
    let caption = figure.querySelector('figcaption');
    caption.textContent = '';
    if (quizCard.image) {
        image.setAttribute('src', `../public/images/${quizCard.image}`);
        image.setAttribute('alt', quizCard.caption);
        caption.textContent = quizCard.caption;
    } else {
        image.removeAttribute('src');
        image.removeAttribute('alt');
        caption.textContent = '';
    }

    let numberRemaining = quizSection.querySelector('#numberRemaining');
    numberRemaining.textContent = setToStudy.filter(x => toStudy(x)).length;
}



//Button functions and their binders
let setToStudy = store.quizQueue;
if (!store.quizQueue) reload(displayFile);

document.querySelector('.quiz').addEventListener('keydown', e => {
    if (e.keyCode === 13) {
        document.querySelector('#checkAnswer').click();
    }
});

const saveRecord = (button, isNew = false) => {
    let mainEditor = button.parentElement;
    let recordType = mainEditor.classList[1];
    let arrayName = recordType + 's';
    let array = store[arrayName];

    let editForm = mainEditor.querySelector(`.${recordType}`);
    if (isNew) editForm.id = 'newSlug';
    let newObject = inputsToObject(editForm);
    console.log(newObject, 'Just called inputsToObject');

    const newStudyDay = (quizCard) => {
        queueObject = {
            slug: quizCard.slug,
            studyDay: quizCard.study ? parseInt(quizCard.studyDay) + daysSince(store.quizQueueDates.start) : daysSince(store.quizQueueDates.start),
            dayIncrease: 0
        };

        // delete when debugged
        if (queueObject.studyDay == null) {
            console.log('Something went wrong with', queueObject);
            queueObject.studyDay = daysSince(store.quizQueueDates.start);
        }

        readItem(quizCard.slug, store.quizQueue) ?
            updateItem(quizCard.slug, store.quizQueue, queueObject)
            : store.quizQueue.push(queueObject);

        delete quizCard.studyDay;
    }

    if (!store.images) store.images = [];
    let image = mainEditor.querySelector('#image');
    if (!store.images.includes(image.value)) store.images.push(image.value);

    if (newObject.slug === 'newSlug' || !newObject.slug) {
        if (recordType === 'quizCard') {
            newObject.slug = slugMaker(
                newObject.image ? newObject.prompt + newObject.image : newObject.prompt, 15
            );
        }
        if (recordType === 'note')
            newObject.slug = slugMaker(newObject.text, 15);
        if (recordType === 'source')
            newObject.slug = slugMaker(newObject.title, 10);
    }
    if (store.editQueue) deleteItem(newObject.slug, store.editQueue);
    if (recordType === 'quizCard') newStudyDay(newObject);
    readItem(newObject.slug, array) ?
        updateItem(newObject.slug, array, newObject) : array.push(newObject);
    console.log('Array updated:', array);
}

const addInput = (button) => {
    listItem = button.parentElement;
    list = button.parentElement.parentElement;
    // Or use insertBelow the previousSibling of the button list item
    let newInput = list.querySelector('input, select').cloneNode(true);
    newInput.value = null;
    let newListItem = document.createElement('li');
    newListItem.appendChild(button);
    list.appendChild(newListItem);
    listItem.appendChild(newInput);
}

const checkAnswer = (button) => {
    const answerWrongFeedback = (responseArray) => {
        return responseArray.length === 1 ?
            'Sorry, the correct response is ' + responseArray
            : 'Sorry, the correct responses are ' + responseArray
    }

    const answerRightFeedback = (dayIncrease) => {
        // This can give a little message to say how many times to get it right before it exits queue
        // Could also choose at random from a list of affirmations
    }

    let quizSection = document.querySelector('.quiz');
    let responseElem = quizSection.querySelector('#response');
    let response;
    if (responseElem.tagName === 'INPUT') {
        response = responseElem.value;
    }
    if (responseElem.tagName !== 'INPUT') {
        response = [];
        responseElem.querySelectorAll('input, select')
            .forEach(x => response.push(x.value));
    }
    let feedback = quizSection.querySelector('#feedback');
    let noteDiv = button.parentElement.querySelector('.note');
    if (responseElem.value == '') return;
    button.disabled = true;
    let slug = button.parentElement.id;
    let quizCard = readItem(slug, store.quizCards);
    let studyCard = readItem(slug, store.quizQueue);
    let isCorrect = compareInputToAnswer(quizCard, response);
    feedback.textContent = isCorrect ?
        'Great job!' : answerWrongFeedback(quizCard.responses);
    feedback.classList.remove('not-answered', isCorrect ? 'incorrect' : 'correct');
    feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
    updateItem(slug, store.quizQueue, changeCardFrequency(studyCard, isCorrect));
    quizCard.noteSlugs.forEach(x => {
        noteDiv.appendChild(forNote(readItem(x, store.notes)));
    });

    let numberRemaining = quizSection.querySelector('#numberRemaining');
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
    let slug = quizSection.id;
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

const editNext = (button) => {
    let mainEdit = document.querySelector('.editObj');
    if (store.editQueue.length === 0) {
        mainEdit.classList.remove('source', 'note', 'quizCard');
        mainEdit.classList.add('add');
        return;
    }

    let datalists = mainEdit.querySelectorAll('datalist');
    datalists.forEach(x => fillDatalist(x));
    let recordType = mainEdit.classList[1];
    let editForm = mainEdit.querySelector(`.${recordType}`);
    let index = store.editQueue.indexOf(readItem(editForm.id, store.editQueue));
    index += 1;
    if (index >= store.editQueue.length) index = 0;
    if (index < 0) index = store.editQueue.length - 1;
    recordIntoEditor(store.editQueue[index]);
}

const loadImgPrev = (input) => {
    let preview = input.parentElement.querySelector('.imagePreview');
    let caption = input.parentElement.querySelector('#caption').value;
    if (input.value) preview.setAttribute('src', `../public/images/${input.value}`);
    if (caption) preview.setAttribute('alt', caption);
    if (!input.value) preview.removeAttribute('src');
    if (!caption) preview.removeAttribute('alt');
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
        editNext(e.target);
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

    if (e.target.className === 'backToSelect') {
        document.querySelector('.saveBtn').disabled = true;
        let parent = e.target.parentElement;
        let whatEdit = parent.querySelector('#whatEdit');
        whatEdit.value = 'add';
        parent.classList.remove('source', 'note', 'quizCard');
        parent.classList.add('add');
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
        reload(displayFile);
    }

    if (e.target.className === 'slugBath') {
        slugBath(store);
        let jsonDisplay = document.querySelector('#jsonDisplay');
        jsonDisplay.textContent = JSON.stringify(store, null, 2);
        reload(displayFile);
    }

    if (e.target.className === 'reload') {
        reload(displayFile);
    }
});

// INPUT OR SELECT CHANGES
document.addEventListener('change', e => {
    if (e.target.className === 'toEdit') {
        let slug = e.target.parentElement.id;
        if (!slug) console.log('This element does not have your slug:', e.target);
        let objType = e.target.parentElement.className;
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
        let grandparent = e.target.parentElement.parentElement;
        grandparent.classList.remove('add');
        grandparent.classList.add(e.target.value);
        let datalists = grandparent.querySelector(`.${e.target.value}`).querySelectorAll('datalist');
        datalists.forEach(x => fillDatalist(x));
        let inputs = grandparent.querySelector(`.${e.target.value}`).querySelectorAll('input');
        let imagePreviews = grandparent.querySelectorAll('.imagePreview');
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

load();