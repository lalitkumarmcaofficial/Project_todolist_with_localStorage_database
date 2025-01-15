// //* USING OBJECT TO STORE DATA WITH SAME DATATYPES IN localStorage
// //*=============================================================================
// //* JavaScript code using only localStorage for adding, search, update, delete
// //*=============================================================================


const mainTodoElem = document.querySelector(".todo-lists-elem");
const inputValue = document.getElementById("inputValue");

let lastSearchedItem = null; //* Track the last searched item

//*-------------------------------------------------------------------------------------
//*** Retrieve the todo list from localStorage or create an empty object if none exists
//*-------------------------------------------------------------------------------------
const getTodoListFromLocal = () => {
  const todoList = JSON.parse(localStorage.getItem("todoList")) || {};
  console.log("Fetched items from localStorage:", todoList); //* Log fetched items
  return todoList;
};
let localTodoLists = getTodoListFromLocal();

//*-----------------------------------------------------------
//*** Sync local storage with the current state of todo list
//*-----------------------------------------------------------
const addTodoListLocalStorage = (localTodoLists) => {
  localStorage.setItem("todoList", JSON.stringify(localTodoLists));
  console.log("Updated localStorage:", localTodoLists); //* Log updated local storage
};

//*-------------------------------------------
//* Generate a unique ID for each todo item
//*-------------------------------------------
const generateUniqueId = () => `todo_${Date.now()}`;

//*============================
//*** Add todo item to the DOM
//*============================
const addTodoDynamicElement = (id, content) => {
  const divElement = document.createElement("div");
  divElement.classList.add("main_todo_div");
  divElement.setAttribute("data-id", id);
  divElement.innerHTML = 
    `<li>${content}</li>
    <button class="updateBtn">Update</button>
    <button class="deleteBtn">Delete</button>`;
  mainTodoElem.append(divElement);
};


//*=========================================
//*** Function to handle adding a todo item
//*=========================================
const addTodoList = (e) => {
  e.preventDefault();
  const inputValueTrimmed = inputValue.value.trim();
  //*----------------------------------------------------
  //*** Reset the input field and remove warning message
  //*----------------------------------------------------
  inputValue.value = ""; //* Clear input field
  inputValue.placeholder = "Enter your task"; //* Reset placeholder
  inputValue.classList.remove("warning"); //* Remove warning class
  inputValue.style.backgroundColor = ""; //* Reset background color

  if (!inputValueTrimmed) {
    console.warn("Warning: Input field is empty!"); //* Log warning message
    inputValue.placeholder = "Input Field cannot be empty!"; //* Display warning in placeholder
    inputValue.classList.add("warning"); //* Add warning styling
    inputValue.style.backgroundColor = "#ffcccc"; //* Highlight input field with LightRed
    return;
  }

  const parsedValue = isNaN(inputValueTrimmed) ? inputValueTrimmed : Number(inputValueTrimmed);
  const id = generateUniqueId();

  if (!Object.values(localTodoLists).includes(parsedValue)) {
    localTodoLists[id] = parsedValue;
    addTodoListLocalStorage(localTodoLists); //* Sync with local storage
    addTodoDynamicElement(id, parsedValue); //* Add to DOM
    console.log("Item added:", { id, value: parsedValue });
    
    // console.log("Updated localTodoLists after adding:", localTodoLists);
  } else {
    console.warn("Item already exists or input is invalid.");
    inputValue.placeholder = "Duplicate value! Try again."; //* Screen message for duplicate value
    inputValue.classList.add("warning"); //* Add warning styling
    inputValue.style.backgroundColor = "#ffcccc"; //* Highlight input field for duplicate with LightRed
  }
};

//*========================================================
//*** Display items from local storage when the page loads
//*========================================================
const showTodoListFromLocalStorage = () => {
  mainTodoElem.innerHTML = "";
  Object.entries(localTodoLists).forEach(([id, content]) => addTodoDynamicElement(id, content));
  // console.log("Initial display of items from local storage:", localTodoLists);
};

//*===========================================
//*** Handle search and highlight a todo item
//*===========================================
const searchTodoList = () => {
  const searchValue = inputValue.value.trim();
  //*--------------------------
  //* Reset input field state
  //*--------------------------
  inputValue.classList.remove("warning");
  inputValue.style.backgroundColor = "";
  inputValue.placeholder = "Enter your task";

  if (!searchValue) {
    console.warn("Warning: Please enter a task to search!"); //* Log warning
    inputValue.placeholder = "Please enter a task to search!"; //* Display warning
    inputValue.classList.add("warning");
    inputValue.style.backgroundColor = "#ffcccc"; //* Highlight input field with LightRed
    return;
  }

  const parsedSearchValue = isNaN(searchValue) ? searchValue : Number(searchValue);
  const foundEntry = Object.entries(localTodoLists).find(([id, value]) => value === parsedSearchValue);

  if (foundEntry) {
    const [id, item] = foundEntry;
    mainTodoElem.innerHTML = ""; //* Clear the list first to highlight
    addTodoDynamicElement(id, item); //* Add the found item first

    const searchResult = document.querySelector(`[data-id="${id}"]`);
    searchResult.style.backgroundColor = "#ffeb3b";
    searchResult.style.color = "#000";
    //*-----------------------------------------
    //* Update input field to indicate success
    //*-----------------------------------------
    inputValue.value = "";
    inputValue.placeholder = "Search item found!";
    inputValue.style.backgroundColor = "#caffbf"; //* Light green background
    //*-------------------------------------------
    //* Add other items below the highlighted one
    //*-------------------------------------------
    Object.entries(localTodoLists).forEach(([curId, curElem]) => {
      if (curId !== id) addTodoDynamicElement(curId, curElem);
    });

    //*------------------------------
    //* Track the last searched item
    //*------------------------------
    lastSearchedItem = id;

    console.log(`Search result in localStorage:`, { id, value: item });
  } else {
    console.warn(`Warning: Item "${searchValue}" not found in localStorage.`);
    inputValue.value = ""; //* Clear input field
    inputValue.placeholder = `Item "${searchValue}" not found.`; //* Display warning
    inputValue.classList.add("warning");
    inputValue.style.backgroundColor = "#ffcccc"; //* Highlight input field
  }
};

//*=======================================================================
//* Handle click on highlighted item to reset position and remove styling
//*=======================================================================
mainTodoElem.addEventListener("click", (e) => {
  const clickedElem = e.target.closest(".main_todo_div");
  if (!clickedElem) return; //* Ignore clicks outside todo elements

  const todoId = clickedElem.getAttribute("data-id");

  if (lastSearchedItem === todoId) {
    //*--------------------------------------
    //* Reset the list to its original order
    //*--------------------------------------
    mainTodoElem.innerHTML = ""; //* Clear the current list
    Object.entries(localTodoLists).forEach(([id, value]) => {
      addTodoDynamicElement(id, value); //* Re-add items in their original order
    });
    //*-----------------------------------
    //* Clear highlight tracking variable
    //*-----------------------------------
    lastSearchedItem = null;

    console.log("List reset to its original order after clicking the found item.");
  }
});



//*==================================================
//*** Handle delete todo item in localStorage & DOM
//*==================================================
const removeTodoElem = (e) => {
  const todoElem = e.target.closest(".main_todo_div");
  const todoId = todoElem.getAttribute("data-id");
  //*===================
  //* Remove from DOM
  //*===================
  todoElem.remove();
  //*==========================
  //* Remove from localStorage
  //*==========================
  delete localTodoLists[todoId];
  addTodoListLocalStorage(localTodoLists);
  console.log("Item deleted:", todoId);
  // console.log("Updated localTodoLists after deletion:", localTodoLists);
};



//*==================================================
//*** Handle update todo item in localStorage & DOM
//*==================================================
const updateTodoElem = (e) => {
  const todoElem = e.target.closest(".main_todo_div");
  const todoId = todoElem.getAttribute("data-id");
  const currentContent = localTodoLists[todoId];
  //*-----------------------------
  //* Prompt user for new content
  //*-----------------------------
  const newContent = prompt("Update your task:", currentContent);

  if (newContent !== null && newContent.trim() !== "") {
    const parsedNewContent = isNaN(newContent.trim()) ? newContent.trim() : Number(newContent.trim());
    //*---------------------------------
    //* Update the localStorage and DOM
    //*---------------------------------
    localTodoLists[todoId] = parsedNewContent;
    addTodoListLocalStorage(localTodoLists);

    todoElem.querySelector("li").textContent = parsedNewContent;
    console.log("Item updated:", { todoId, newContent: parsedNewContent });
    // console.log("Updated localTodoLists after update:", localTodoLists);
  } else {
    console.warn("Warning: No content entered for update.");
  }
};

//*--------------------------------------------------
//*** Reset input field when clicked after a warning
//*--------------------------------------------------
inputValue.addEventListener("click", () => {
  inputValue.classList.remove("warning"); //* Remove warning class
  inputValue.style.backgroundColor = ""; //* Reset background color
  inputValue.placeholder = "Enter your task"; //* Reset placeholder
  inputValue.value = ""; //* Clear input field
});

//*-------------------------------
//* Event listeners for buttons
//*-------------------------------
mainTodoElem.addEventListener("click", (e) => {
  if (e.target.classList.contains("deleteBtn")) {
    removeTodoElem(e);
  } else if (e.target.classList.contains("updateBtn")) {
    updateTodoElem(e);
  }
});



document.querySelector(".addBtn").addEventListener("click", (e) => addTodoList(e));
document.querySelector(".searchBtn").addEventListener("click", searchTodoList);

//*====================================
//* Display todo items on initial load
//*====================================
showTodoListFromLocalStorage();





















