// //*========================================================================
// //* JavaScript code using only DOM for adding, search, update, delete  
// //*========================================================================




const mainTodoElem = document.querySelector(".todo-lists-elem");
const inputValue = document.getElementById("inputValue");

//*----------------------------------------------------
//* Array to hold the current state of the to-do list
//*----------------------------------------------------
let todoList = [];

//*======================================================
//* Dynamically add a todo item to the list in the DOM
//*======================================================
const addTodoDynamicElement = (curElem) => {
  const divElement = document.createElement("div");
  divElement.classList.add("main_todo_div");
  divElement.innerHTML = 
    `<li>${curElem}</li>
    <button class="updateBtn">Update</button>
    <button class="deleteBtn">Delete</button>`;
  mainTodoElem.append(divElement);
  
  
};

const showTodoList = () => {
  console.log(`Fetched with DOM:`, todoList);
};

showTodoList()

//*=============================
//* Function to add a todo item
//*=============================
const addTodoList = (e) => {
  e.preventDefault();
  const todoListValue = inputValue.value.trim();
  //*------------------
  //* Input validation
  //*------------------
  if (!todoListValue) {
    inputValue.value = "";
    inputValue.placeholder = "Input field cannot be empty!";
    inputValue.style.backgroundColor = "#ffcccc"; //* Red background
    console.warn("Warning: Input field is empty!");
    
    return;
  }
   //*--------------------------
  //* Prevent duplicate entries
  //*---------------------------
  if (todoList.includes(todoListValue)) {
    inputValue.value = "";
    inputValue.placeholder = "Duplicate value! Try again.";
    inputValue.style.backgroundColor = "#ffcccc"; //* Red background
    console.warn("Warning: Item already exists or input is invalid.");
    
    return;
  }
  //*=============================
  //* Add to list and update DOM
  //*=============================
  
  todoList.push(todoListValue);
  addTodoDynamicElement(todoListValue);
  console.log("Item added: " + todoListValue);
  console.log(`Fetched with DOM:`, todoList);
  
  
  
  //*---------------------
  //* Reset input field
  //*---------------------
  inputValue.value = "";
  inputValue.placeholder = "Enter your task";
  inputValue.style.backgroundColor = "";
};

//*==================================
//* Remove a todo item from the list
//*==================================
const removeTodoElem = (e) => {
  const parentElem = e.target.parentElement;
  const todoContent = parentElem.querySelector("li").innerText;
  //*===================
  //* Remove from array
  //*===================
  todoList = todoList.filter((item) => item !== todoContent);
  console.log(`Deleted item: ${todoContent}`);
  
  console.log(`Fetched with DOM:`, todoList);
  //*=================
  //* Remove from DOM
  //*=================
  parentElem.remove();
};
//*====================
//* Update a todo item
//*====================
const updateTodoElem = (e) => {
  const parentElem = e.target.parentElement;
  const todoItemElement = parentElem.querySelector("li");
  const oldValue = todoItemElement.innerText;
  const updatedValue = prompt("Update your task:", oldValue);
  

  if (updatedValue && updatedValue.trim() !== "") {
    const index = todoList.indexOf(oldValue);
    if (index > -1) {
      //*======================
      //* Update array and DOM
      //*======================
      todoList[index] = updatedValue;
      console.log(`Updated item: ${oldValue} to ${updatedValue}`);
      
      console.log(`Fetched with DOM:`, todoList);

      todoItemElement.innerText = updatedValue;

    }
  }
};

//*=========================
//* Search for a todo item
//*=========================
const searchTodoList = () => {
  const searchValue = inputValue.value.trim();
  //*-------------------
  //* Input validation
  //*-------------------
  if (!searchValue) {
    inputValue.value = "";
    inputValue.placeholder = "Please enter a task to search!";
    inputValue.style.backgroundColor = "#ffcccc"; //* Red background
    console.warn("Warning: Please enter a task to search!");
    
    return;
  }
  //*-------------------------
  //* Highlight search result
  //*-------------------------
  const items = document.querySelectorAll(".main_todo_div");
  let found = false;
  

  items.forEach((item) => {
    item.style.backgroundColor = ""; //* Reset background
    if (item.querySelector("li").innerText === searchValue) {
      found = true;
      
      //*------------------------
      //* Move found item to top
      //*------------------------
      mainTodoElem.prepend(item);
      item.style.backgroundColor = "#ffeb3b"; //* Highlight in yellow
      item.classList.add("highlighted"); //* Add class for reset behavior
      
    }
    
  });

  if (!found) {
    inputValue.value = "";
    inputValue.placeholder = `Item: "${searchValue}" not found`;
    inputValue.style.backgroundColor = "#ffcccc"; //* Red background
    console.log(`Item: ${searchValue} not found`);
    
  } else {
    inputValue.value = "";
    inputValue.placeholder = "Search item found!";
    inputValue.style.backgroundColor = "#caffbf"; //* Green background
    console.log(`Search result: ${searchValue}`);

  }
};
//*-------------------------------------
//* Reset item to its original position
//*-------------------------------------
const resetSearchResult = (e) => {
  const clickedElem = e.target.closest(".main_todo_div");

  if (clickedElem && clickedElem.classList.contains("highlighted")) {
    clickedElem.classList.remove("highlighted"); //* Remove highlight class
    clickedElem.style.backgroundColor = ""; //* Reset background
    //*---------------------------------------
    //* Rebuild the DOM in the original order
    //*---------------------------------------
    mainTodoElem.innerHTML = ""; //* Clear DOM
    todoList.forEach((curElem) => addTodoDynamicElement(curElem)); //* Add all items
  }
};

//*---------------------
//* Add event listeners
//*---------------------
mainTodoElem.addEventListener("click", (e) => {
  if (e.target.classList.contains("deleteBtn")) {
    removeTodoElem(e);
  } else if (e.target.classList.contains("updateBtn")) {
    updateTodoElem(e);
  } else if (e.target.tagName === "LI" || e.target.parentElement.classList.contains("highlighted")) {
    resetSearchResult(e);
  }
});

//*--------------------------------------------------------
//*** Event listener for resetting input field after click
//*--------------------------------------------------------
inputValue.addEventListener("click", () => {
  inputValue.placeholder = "Enter your task";
  inputValue.style.backgroundColor = "";
});


document.querySelector(".addBtn").addEventListener("click", addTodoList);
document.querySelector(".searchBtn").addEventListener("click", searchTodoList);


