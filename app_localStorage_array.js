// //* USING ARRAY TO STORE DATA WITH SAME DATATYPES IN localStorage
// //*=============================================================================
// //* JavaScript code using only localStorage for adding, search, update, delete
// //*=============================================================================



const mainTodoElem = document.querySelector(".todo-lists-elem");
const inputValue = document.getElementById("inputValue");

//*----------------------------------------------------------------------------------
//* Retrieve the todo list from localStorage or create an empty array if none exists
//*----------------------------------------------------------------------------------
const getTodoListFromLocal = () => {
  const todoList = JSON.parse(localStorage.getItem("todoList")) || [];
  // console.log("Fetched items from localStorage:", todoList); //* Log fetched items
  return todoList;
};
let localTodoLists = getTodoListFromLocal();

//*--------------------------------------------------------
//* Sync local storage with the current state of todo list
//*--------------------------------------------------------
const addTodoListLocalStorage = (localTodoLists) => {
  localStorage.setItem("todoList", JSON.stringify(localTodoLists));
  console.log("Updated localStorage:", localTodoLists); //* Log updated local storage
};

//*---------------------------
//* Add todo item to the DOM
//*---------------------------
const addTodoDynamicElement = (content) => {
  const divElement = document.createElement("div");
  divElement.classList.add("main_todo_div");
  divElement.innerHTML = 
   `<li>${content}</li>
    <button class="updateBtn">Update</button>
    <button class="deleteBtn">Delete</button>`;
  mainTodoElem.append(divElement);
};

//*=======================================
//* Function to handle adding a todo item
//*=======================================
const addTodoList = (e) => {
  e.preventDefault();
  const inputValueTrimmed = inputValue.value.trim();
  //*--------------------------------------------------
  //* Reset the input field and remove warning message
  //*--------------------------------------------------
  inputValue.value = "";
  inputValue.placeholder = "Enter your task";
  inputValue.classList.remove("duplicate-warning");
  inputValue.style.backgroundColor = "";
  //*-----------------------------------
  //* Explicitly check for empty input
  //*-----------------------------------
  if (inputValueTrimmed === "") {
    console.warn("Warning: Input field is empty!");
    inputValue.placeholder = "Input Field cannot be empty!";
    inputValue.classList.add("duplicate-warning");
    inputValue.style.backgroundColor = "#ffcccc"; //* Highlight input field with LightRed
    return;
  }

  const parsedValue = isNaN(inputValueTrimmed) ? inputValueTrimmed : Number(inputValueTrimmed);
  //*-----------------------------------
  //* Check if the task already exists
  //*-----------------------------------
  if (!localTodoLists.some(item => item.toString() === parsedValue.toString())) {
    localTodoLists.push(parsedValue);
    addTodoListLocalStorage(localTodoLists);
    addTodoDynamicElement(parsedValue);
    console.log("Item added:", parsedValue);
    // console.log("Fetched item with localStorage:", localTodoLists); //* Log updated local storage



  } else {
    console.warn("Item already exists or input is invalid.");
    inputValue.placeholder = "Duplicate value! Try again.";
    inputValue.classList.add("duplicate-warning");
    inputValue.style.backgroundColor = "#ffcccc"; //* Highlight input field with LightRed
  }
};

//*======================================================
//* Display items from local storage when the page loads
//*======================================================
// const showTodoList = () => {
//   mainTodoElem.innerHTML = "";
//   localTodoLists.forEach(content => addTodoDynamicElement(content));
//   console.log("No items found in localStorage:", localTodoLists);
// };


const showTodoFromLocalStorage = () => {
  mainTodoElem.innerHTML = "";
  if (localTodoLists && localTodoLists.length > 0){
  localTodoLists.forEach((curElem) => addTodoDynamicElement(curElem));
    console.log("Fetched items from localStorage: ", localTodoLists);  //* Show items to log
} else {
  console.log("No items found in localStorage", localTodoLists)
}
};

//*===============================================
//* Remove a todo item from local storage and DOM
//*===============================================
const removeTodoElem = (e) => {
  const todoItem = e.target.parentElement.querySelector("li").innerText.trim();

  if (todoItem) {
    localTodoLists = localTodoLists.filter(todo => todo.toString() !== todoItem.toString());
    addTodoListLocalStorage(localTodoLists);
    e.target.parentElement.remove(); //* remove item from DOM
    console.log(`Item deleted: ${todoItem}`);
    // console.log("Fetched item with localStorage:", localTodoLists); //* Log updated local storage

  }
};



//*=============================================
//* Update a todo item in local storage and DOM
//*=============================================
const updateTodoElem = (e) => {
  const parentElem = e.target.parentElement;
  const todoItemElement = parentElem.querySelector("li");
  const updatedValue = prompt("Update your task:", todoItemElement.innerText.trim());

  if (updatedValue && updatedValue.trim()) {
    const parsedUpdatedValue = isNaN(updatedValue) ? updatedValue.trim() : Number(updatedValue.trim());

    const todoIndex = localTodoLists.findIndex(todo => todo.toString() === todoItemElement.innerText.trim().toString());
    if (todoIndex !== -1) {
      localTodoLists[todoIndex] = parsedUpdatedValue;
      addTodoListLocalStorage(localTodoLists);
      todoItemElement.innerText = parsedUpdatedValue; //* update item in DOM
      console.log(`Item updated: ${todoItemElement.innerText} to ${parsedUpdatedValue}`); //*DOUBT
      // console.log("Fetched item with localStorage:", localTodoLists); //* Log updated local storage

    }
  }
};



//*====================================================================================
//*** Search and highlight a todo item (including '0') and reset styling when clicked
//*====================================================================================
let lastSearchedItem = null;

const searchTodoList = () => {
  const searchValue = inputValue.value.trim();
  const parsedSearchValue = isNaN(searchValue) ? searchValue : Number(searchValue);

  //*---------------------------------
  //* Explicit check for empty input
  //*---------------------------------
  if (searchValue === "") {
    console.warn("Warning: Please enter a task to search!");
    inputValue.placeholder = ("Please enter a task to search!");
    inputValue.classList.add("duplicate-warning");
    inputValue.style.backgroundColor = "#ffcccc"; //* Highlight input field with LightRed
    return;
  }

  const foundEntry = localTodoLists.find(todo => todo.toString() === parsedSearchValue.toString());

  if (foundEntry !== undefined) {
    //*---------------------------
    //* Highlight the found entry
    //*---------------------------
    mainTodoElem.innerHTML = "";
    //*---------------------------------
    //* Add the found entry at the top
    //*---------------------------------
    const divElement = document.createElement("div");
    divElement.classList.add("main_todo_div");
    divElement.innerHTML = `
      <li>${foundEntry}</li>
      <button class="updateBtn">Update</button>
      <button class="deleteBtn">Delete</button>
    `;
    divElement.style.backgroundColor = "#ffeb3b"; //* Highlight with yellow background the found entry div
    divElement.style.color = "#000"; //* Change text color
    mainTodoElem.append(divElement);
    //*--------------------------------------------------
    //* Add the rest of the items below the found entry
    //*--------------------------------------------------
    localTodoLists.forEach(content => {
      if (content !== foundEntry) {
        addTodoDynamicElement(content);
      }
    });

    lastSearchedItem = foundEntry;

    inputValue.value = "";
    inputValue.placeholder = "Search item found!";
    inputValue.classList.add("duplicate-warning");
    inputValue.style.backgroundColor = "#caffbf"; //* Light green background
    console.log(`Search result in localStorage:`, { value: foundEntry });
  } else {
    console.warn(`Warning: Item "${searchValue}" not found in localStorage.`);
    inputValue.value = "";  //* Clear the input field
    inputValue.placeholder = `Item "${searchValue}" not found.`;  //* Show message in input
    inputValue.classList.add("duplicate-warning");
    inputValue.style.backgroundColor = "#ffcccc";  //* Highlight input field with LightRed when not found
  }
};

//*----------------------------------------------------------------------------
//* Reset the styling of the found item and return it to its original position
//*----------------------------------------------------------------------------
const resetSearchResult = () => {
  if (lastSearchedItem !== null) {
    //*---------------------------------------
    //* Reset the list to its original order
    //*---------------------------------------
    mainTodoElem.innerHTML = "";

    localTodoLists.forEach((content, i) => {
      addTodoDynamicElement(content); //* Re-add items in their original order
    });
    //*------------------------------
    //* Clear the highlighting state
    //*------------------------------
    lastSearchedItem = null;

    console.log("Highlight reset. List returned to original order.");
  }
};

//*--------------------------------------------------------
//* Reset input field styles when clicked after a warning
//*--------------------------------------------------------
inputValue.addEventListener("click", () => {
  inputValue.placeholder = "Enter your task";
  inputValue.classList.remove("duplicate-warning");
  inputValue.style.backgroundColor = ""; //* Reset background color
});

//*-----------------------------
//* Event listeners for buttons
//*-----------------------------
mainTodoElem.addEventListener("click", (e) => {
  if (e.target.classList.contains("deleteBtn")) {
    removeTodoElem(e);
  } else if (e.target.classList.contains("updateBtn")) {
    updateTodoElem(e);
  } else if (e.target.closest(".main_todo_div")) {
    resetSearchResult(); //* Reset highlighting when a todo div is clicked
  }
});

document.querySelector(".addBtn").addEventListener("click", (e) => addTodoList(e));
document.querySelector(".searchBtn").addEventListener("click", searchTodoList);

//*=====================================
//* Display todo items on initial load
//*=====================================
showTodoFromLocalStorage();
