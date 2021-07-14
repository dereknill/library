let addBookButton = document.getElementById("add-button");
let addBookSubmitButton = document.getElementById("submitNewBook");
let cancelBookSubmitButton = document.getElementById("cancelNewBook");
let addBookDiv = document.getElementById("add-book");
let overlayBlur = document.getElementById("overlay-blur");
let addBookForm = document.getElementById("addBookForm");
let cardsContainer = document.getElementById("cardsContainer");
let statsNumBooks = document.getElementById("numBooks");
let statsNumBooksRead = document.getElementById("numBooksRead");
let statsNumBooksNotRead = document.getElementById("numBooksNotRead");
var titleInput = document.getElementById("inputBookName");
var authorInput = document.getElementById("inputAuthor");
var numPagesInput = document.getElementById("inputNumPages");
var hasReadInput = document.getElementById("hasReadRadioYes");
var storage = window.localStorage;
var uniqueID = 0;
let numBooks = 0;
let numBooksRead = 0;
let numBooksNotRead = 0;

addBookButton.addEventListener("click", openAddBookForm);
cancelBookSubmitButton.addEventListener("click", closeAddBookForm);

addBookForm.onsubmit = function () {
  addBookButtonHandler();
  return false;
};

let myLibrary = [];

getAndIncrementUniqueID();
reloadBooks();

function Book(id, title, author, numPages, hasRead) {
  this.id = id;
  this.title = title;
  this.author = author;
  this.numPages = numPages;
  this.hasRead = hasRead;
}

Book.prototype.toggleRead = function () {
  this.hasRead = !this.hasRead;
};

function addBookButtonHandler() {
  var title = titleInput.value;
  var author = authorInput.value;
  var numPages = numPagesInput.value;
  var hasRead = hasReadInput.checked;

  var newBook = new Book(uniqueID, title, author, numPages, hasRead);
  uniqueID++;
  saveLastUsedID();
  saveToLocalStorage(newBook);

  reloadBooks();
  closeAddBookForm();
}

function addBookToLibrary(book) {
  myLibrary.push(book);
  numBooks++;
  if (book.hasRead) {
    numBooksRead++;
  } else {
    numBooksNotRead++;
  }
}

function reloadBooks() {
  clearBooks();
  loadFromLocalStorage();
  setStats();
  sortLibrary();
  displayBooks();
}

function openAddBookForm() {
  if (addBookDiv.classList.contains("hide")) {
    addBookDiv.classList.remove("hide");
  }

  if (overlayBlur.classList.contains("hide")) {
    overlayBlur.classList.remove("hide");
  }
}

function closeAddBookForm() {
  if (!addBookDiv.classList.contains("hide")) {
    addBookDiv.classList.add("hide");
  }

  if (!overlayBlur.classList.contains("hide")) {
    overlayBlur.classList.add("hide");
  }

  titleInput.value = "";
  authorInput.value = "";
  numPagesInput.value = "";
}

function displayBooks() {
  for (let i = 0; i < myLibrary.length; i++) {
    var newCard = createCard(myLibrary[i]);
    newCard.dataset.id = myLibrary[i].id;
    newCard.dataset.index = i;
    cardsContainer.append(newCard);
  }
}

function createCard(book) {
  var newBook = document.createElement("div");
  var cardBody = document.createElement("div");
  var title = document.createElement("h4");
  var author = document.createElement("h6");
  var cardText = document.createElement("p");
  var numPagesText = document.createElement("div");
  var hasReadText = document.createElement("div");
  var hasReadForm = document.createElement("div");
  var hasReadFormLabel = document.createElement("label");
  var hasReadFormInput = document.createElement("input");
  var deleteButton = document.createElement("button");
  var bottomContainer = document.createElement("div");

  newBook.classList.add("card", "my-3", "mx-3");
  newBook.style.width = "18rem";

  cardBody.classList.add("card-body");
  title.classList.add("card-title");
  author.classList.add("card-subtitle", "mb-2", "text-muted");
  cardText.classList.add("card-text");
  numPagesText.classList.add("numPagesText");
  hasReadText.classList.add("hasReadText");
  hasReadForm.classList.add(
    "form-check",
    "form-switch",
    "d-flex",
    "justify-content-end",
    "flex-grow-1"
  );
  hasReadFormLabel.classList.add("form-check-label", "me-1");
  hasReadFormLabel.style.width = "150px";
  hasReadFormInput.classList.add("form-check-input");
  hasReadFormInput.type = "checkbox";
  hasReadFormInput.id = "hasReadSlider";
  deleteButton.classList.add("btn", "btn-danger");
  deleteButton.type = "button";
  bottomContainer.classList.add(
    "d-flex",
    "justify-content-between",
    "align-items-center"
  );

  title.innerHTML = book.title;
  author.innerHTML = `By: ${book.author}`;
  numPagesText.innerHTML = `Number of Pages: ${book.numPages}`;
  let hasReadString;
  if (book.hasRead) {
    hasReadString = "Read";
  } else {
    hasReadString = "NOT Read";
  }
  hasReadText.innerHTML = `Status: ${hasReadString}`;
  hasReadFormLabel.innerHTML = "Mark as read:";
  hasReadFormInput.checked = book.hasRead;
  hasReadFormInput.addEventListener("change", toggleReadHandler);
  deleteButton.innerHTML = "Delete";
  deleteButton.addEventListener("click", deleteButtonHandler);

  cardText.append(numPagesText);
  cardText.append(hasReadText);

  hasReadForm.append(hasReadFormLabel);
  hasReadForm.append(hasReadFormInput);

  bottomContainer.append(deleteButton);
  bottomContainer.append(hasReadForm);

  cardBody.append(title);
  cardBody.append(author);
  cardBody.append(cardText);
  cardBody.append(bottomContainer);

  newBook = setCardBackground(newBook, book.hasRead);
  newBook.append(cardBody);

  return newBook;
}

function clearBooks() {
  while (cardsContainer.firstChild) {
    cardsContainer.removeChild(cardsContainer.firstChild);
  }

  myLibrary = [];
  numBooksRead = 0;
  numBooks = 0;
  numBooksNotRead = 0;
}

function deleteButtonHandler() {
  storage.removeItem(this.parentElement.parentElement.parentElement.dataset.id);
  clearBooks();
  loadFromLocalStorage();
  displayBooks();
}

function toggleReadHandler() {
  var index =
    this.parentElement.parentElement.parentElement.parentElement.dataset.index;
  myLibrary[index].toggleRead();

  saveToLocalStorage(myLibrary[index]);
  reloadBooks();
}

function setCardBackground(card, hasRead) {
  if (hasRead) {
    if (card.classList.contains("card-not-read")) {
      card.classList.remove("card-not-read");
    }
  } else {
    if (!card.classList.contains("card-not-read")) {
      card.classList.add("card-not-read");
    }
  }

  return card;
}

function saveToLocalStorage(book) {
  storage.setItem(book.id, JSON.stringify(book));
}

function loadFromLocalStorage() {
  var booksInStorage = allStorage();
  for (let i = 0; i < booksInStorage.length; i++) {
    var book = JSON.parse(booksInStorage[i]);
    var newBook = new Book(
      book.id,
      book.title,
      book.author,
      book.numPages,
      book.hasRead
    );
    addBookToLibrary(newBook);
  }
}

function allStorage() {
  var values = [],
    keys = Object.keys(storage);

  for (let i = 1; i < keys.length; i++) {
    values.push(storage.getItem(keys[i]));
  }
  return values;
}

function sortLibrary() {
  myLibrary.sort((a, b) => a.id - b.id);
}

function getAndIncrementUniqueID() {
  var lastUsedID = parseInt(storage.getItem(0));
  if (lastUsedID < 1 || isNaN(lastUsedID)) {
    lastUsedID = 0;
    storage.setItem("0", lastUsedID);
  }
  uniqueID = lastUsedID + 1;
}

function saveLastUsedID() {
  storage.setItem("0", uniqueID);
}

function setStats() {
  statsNumBooks.innerHTML = numBooks;
  statsNumBooksRead.innerHTML = numBooksRead;
  statsNumBooksNotRead.innerHTML = numBooksNotRead;
}
