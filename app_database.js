// //*=================================================================================
// //* JavaScript code using only database for adding, search, update, delete  
// //*=================================================================================



const mainTodoElem = document.querySelector(".todo-lists-elem");
const inputValue = document.getElementById("inputValue");

//*------------------------------------------------------
//*** Dynamically add a todo item to the list in the DOM
//*------------------------------------------------------
const addTodoDynamicElement = (curElem) => {
    //*---------------------------------------------
    //* Check if the item already exists in the DOM
    //*---------------------------------------------
    const existingItems = Array.from(mainTodoElem.querySelectorAll("li")).map(item => item.innerText);
  
    if (existingItems.includes(curElem)) {
      // console.log("Duplicate item not added to DOM:", curElem);
      return; //* Stop execution if duplicate
    }
    //*---------------------------------
    //* If not duplicate, add the item
    //*---------------------------------
    const divElement = document.createElement("div");
    divElement.classList.add("main_todo_div");
    divElement.innerHTML = 
     `<li>${curElem}</li> 
      <button class="updateBtn">Update</button> 
      <button class="deleteBtn">Delete</button>`;
    mainTodoElem.append(divElement);
  };
  


//*======================
//* add item in database
//*======================
const addTodoList = async (e) => {
  e.preventDefault();
  const todoListValue = inputValue.value.trim();
  inputValue.value = "";
  

  if (todoListValue) {
    try {
      //*=======================
      //* Add item to database
      //*=======================
      const response = await fetch("http://localhost:3000/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item: todoListValue }),
      });

      if (response.ok) {
        console.log(`Item added to database: ${todoListValue}`);
        // console.log("Fetched items from database: "); 
        await showTodoFromDb()//*TEST

        addTodoDynamicElement(todoListValue); //* Add item to the UI

         //* Reset input field placeholder and background
         inputValue.setAttribute("placeholder", "Enter your task");
         inputValue.style.backgroundColor = ""; 
         
      } else if (response.status === 400) {
        //*--------------------
        //* If duplicate item
        //*--------------------
        const errorMessage = await response.text();
        console.warn(errorMessage); //* Log the error (e.g., "This item already exists in the list!"
        // alert("This item already exists in the list!"); //* Notify the user
        inputValue.placeholder = "Duplicate value! Try again."
        inputValue.style.backgroundColor = "#ffcccc";   //*Red background
      } else {
        console.error("Failed to add item, server returned:", response.status);
      }
    } catch (error) {
      console.error("Error adding item to database:", error);
    }
  } else {
    inputValue.setAttribute("placeholder", "Input field cannot be empty!");
    inputValue.style.backgroundColor = "#ffcccc";
    console.warn("Warning: Input field is empty!");
  }
};




//*=======================================================
//* Fetch data from database and display on page reload
//*=======================================================
const showTodoFromDb = async () => {
  try {
    const response = await fetch("http://localhost:3000/getAllItem");
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      mainTodoElem.innerHTML = ""; //* Clear existing DOM elements
      data.forEach((item) => addTodoDynamicElement(item.item));
      console.log("Fetched items from database:", data);
    } else {
      console.log("No items found in the database.",[]);
    }
  } catch (error) {
    console.error("Error fetching items from database:", error);
  }
};
                  






//*======================================
//* Remove a todo item from the database
//*======================================
const removeTodoElem = async (e) => {
  const todoToRemove = e.target;
  const todoListContent = todoToRemove.previousElementSibling.previousElementSibling.innerText;
  const parentElem = todoToRemove.parentElement;

  try {
    //*===================================
    //* Delete item from backend database
    //*===================================
    await fetch("http://localhost:3000/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item: todoListContent }),
    });
    parentElem.remove();
    console.log(`Item deleted from database: ${todoListContent}`);
    // console.log("Fetched items from database:");
    await showTodoFromDb() //*TEST
  } catch (error) {
    console.error("Error deleting item from database:", error);
  }
};

//*=====================================
//* Update a todo item in the database
//*=====================================
const updateTodoElem = async (e) => {
  const todoToUpdate = e.target;
  const todoItemElement = todoToUpdate.previousElementSibling;
  const todoListContent = todoItemElement.innerText;
  const updatedValue = prompt("Update your task:", todoListContent);

  if (updatedValue && updatedValue.trim() !== "") {
    try {
      //*====================================
      //* Send update to backend database
      //*====================================
      await fetch("http://localhost:3000/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldItem: todoListContent, newItem: updatedValue }),
      });
      console.log(`Item updated in database: ${todoListContent} to ${updatedValue}`);
      // console.log("Fetched items from database:");
      await showTodoFromDb() //*TEST
      todoItemElement.innerText = updatedValue; //* Update the UI
    } catch (error) {
      console.error("Error updating item in database:", error);
    }
  }
};


//*-----------------------------------------------------------
//* Function to highlight and move searched item to the top
//*-----------------------------------------------------------
let originalPosition = null; //* To store the original position of the searched item
let originalList = []; //* To store the original list order

//*----------------------------------------------------------
//* Function to highlight and move searched item to the top
//*----------------------------------------------------------
const highlightSearchResult = (item) => {
  //*---------------------------------------------------
  //* Store original list items for reset functionality
  //*---------------------------------------------------
  if (originalList.length === 0) {
    originalList = Array.from(mainTodoElem.querySelectorAll(".main_todo_div"));
  }
  //*-------------------------------------
  //* Find the index of the searched item
  //*-------------------------------------
  const matchingItem = Array.from(mainTodoElem.querySelectorAll("li")).find(li => li.innerText === item);
  if (matchingItem) {
    originalPosition = matchingItem.parentElement; //* Save the original position
    //*----------------------------------------------------
    //* Highlight the searched item and move it to the top
    //*----------------------------------------------------
    matchingItem.parentElement.style.backgroundColor = "#ffeb3b"; //* Highlight background
    mainTodoElem.prepend(matchingItem.parentElement); //* Move to the top

    console.log(`Item "${item}" moved to the top and highlighted.`);
  }
};

//*--------------------------------------------------
//* Function to reset the list and remove highlight
//*--------------------------------------------------
const resetSearchResult = () => {
  if (originalList.length > 0) {
    mainTodoElem.innerHTML = ""; //* Clear the DOM
    originalList.forEach((elem) => {
      elem.style.backgroundColor = ""; //* Remove highlight
      mainTodoElem.append(elem); //* Restore original order
    });
    console.log("List reset to original order.");
    originalList = []; //* Clear the saved original list
    originalPosition = null; //* Clear the saved original position
  }
};

//*=====================================
//* Search for an item in the database
//*=====================================
const searchTodoList = async () => {
  const searchValue = inputValue.value.trim();
  //*-------------------------
  //* Check if input is empty
  //*-------------------------
  if (!searchValue) { 
    //*----------------------------------------------
    //* Add a message in input field for search item
    //*----------------------------------------------
    inputValue.setAttribute("placeholder", "Please enter a task to search!");
    inputValue.style.backgroundColor = "#ffcccc"; //* Highlight background
    console.warn("Warning: Please enter a task to search!"); //* Log warning
    return; //* Stop further execution
  }

  try {
    const response = await fetch(`http://localhost:3000/search?item=${searchValue}`);
    const result = await response.json();

    if (result.item) {
      //*-------------------------------------------------
      //* Highlight and move the searched item to the top
      //*-------------------------------------------------
      highlightSearchResult(result.item);
      //*----------------------------------------------
      //* Clear input value and show success message
      //*----------------------------------------------
      inputValue.value = ""; //* Clear input field
      inputValue.style.backgroundColor = "#caffbf"; //* Highlight background (success)
      inputValue.setAttribute("placeholder", "Search Item Found!"); //* Display success message
      console.warn("Warning: Search value found in database!"); //* Log warning

      console.log(`Search Item found in database: ${result.item}`);
    } else {
      //*----------------------------------------------
      //* Clear input value and show unsuccess message
      //*----------------------------------------------
      inputValue.value = ""; //* Clear input field
      inputValue.style.backgroundColor = "#ffcccc"; //* Highlight background
      inputValue.setAttribute("placeholder", `Item "${searchValue}" not found`); //* Display message
      console.warn(`Warning: Item "${searchValue}" not found`); //* Log warning

      console.log(`Item "${searchValue}" not found in database.`);
    }
  } catch (error) {
    console.error("Error searching item in database:", error);
  }
};

//*----------------------------------------------------------
//*** Event listener to reset the highlighted item on click
//*----------------------------------------------------------
mainTodoElem.addEventListener("click", (e) => {
  if (e.target.tagName === "LI" && e.target.parentElement === originalPosition) {
    resetSearchResult();
  } else if (e.target.classList.contains("deleteBtn")) {
    removeTodoElem(e);
  } else if (e.target.classList.contains("updateBtn")) {
    updateTodoElem(e);
  }
});


//*--------------------------------------------------------
//*** Event listener for resetting input field after click
//*--------------------------------------------------------
inputValue.addEventListener("click", () => {
  inputValue.style.backgroundColor = ""; //* Reset background color
  inputValue.setAttribute("placeholder", "Enter your task"); //* Reset placeholder
});


document.querySelector(".addBtn").addEventListener("click", (e) => addTodoList(e));
document.querySelector(".searchBtn").addEventListener("click", searchTodoList);


//*=====================================
//* Display todo items on initial load
//*=====================================
showTodoFromDb();

