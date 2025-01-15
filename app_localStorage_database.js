// //*=====================================================================================
// //* JavaScript code using database with localStorage for adding, search, update, delete
// //*=====================================================================================



const mainTodoElem = document.querySelector(".todo-lists-elem");
const inputValue = document.getElementById("inputValue");

//*=========================================================
//*** Get items from localStorage & store in localTodoLists
//*=========================================================
const getTodoListFromLocal = () => JSON.parse(localStorage.getItem("todoList")) || [];
let localTodoLists = getTodoListFromLocal();

//*===================================
//*** Sync local storage with backend
//*===================================
const addTodoListLocalStorage = (localTodoLists) => {
  localStorage.setItem("todoList", JSON.stringify(localTodoLists));
};

//*=======================================================
//*** Dynamically add a todo item to the list in the DOM
//*=======================================================
const addTodoDynamicElement = (curElem) => {
  const divElement = document.createElement("div");
  divElement.classList.add("main_todo_div");
  divElement.innerHTML = 
  `<li>${curElem}</li>
   <button class="updateBtn">Update</button>
   <button class="deleteBtn">Delete</button>`;
  mainTodoElem.append(divElement);
};

//*===============================
//*** Function to add a todo item
//*===============================
const addTodoList = async (e) => {
  e.preventDefault();
  const todoListValue = inputValue.value.trim();
  inputValue.value = "";

   //* Reset input field placeholder and background
   inputValue.setAttribute("placeholder", "Enter your task");
   inputValue.style.backgroundColor = ""; 
  
  if (!todoListValue) {
    inputValue.value = "";
    // displayWarning("Input Field cannot be empty!");
    inputValue.placeholder = "Input field cannot be empty! ";
    inputValue.style.backgroundColor = "#ffcccc"; //* Red background
    console.warn("Warning: Input field is empty!"); //* Log warning to console
    return;
  }

   

  if (localTodoLists.includes(todoListValue)) {
    inputValue.value = "";
    // displayWarning("Duplicate value! Try again.");
    inputValue.placeholder = "Duplicate value! Try again.";
    inputValue.style.backgroundColor = "#ffcccc"; //* Red background
    console.warn("Warning: This item already exists in the list!"); //* Log warning to console
    
    return;
  }

  //*===================================
  //* Send todo item to local storage
  //*===================================
  localTodoLists.push(todoListValue);
  addTodoListLocalStorage(localTodoLists);
  console.log(`Item added to localStorage: ${todoListValue}`);
  console.log("Fetched items from localStorage: ", localTodoLists); //* Show items to console
  
  addTodoDynamicElement(todoListValue);

  //*====================================
  //*** Send todo item to database
  //*====================================
  try {
    await fetch("http://localhost:3000/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ item: todoListValue })
    });
    console.log(`Item added to database: ${todoListValue}`);
    console.log("Fetched items from database: ", localTodoLists); //* Show items to console

  } catch (error) {
    console.error("Error adding item to database:", error);
  }
};

//*=========================================================
//*** Display items from local storage when the page loads
//*=========================================================
const showTodoFromLocalStorage = () => {
  mainTodoElem.innerHTML = "";
  if (localTodoLists && localTodoLists.length > 0){
  localTodoLists.forEach((curElem) => addTodoDynamicElement(curElem));
    console.log("Fetched items from localStorage: ", localTodoLists);  //* Show items to log
} else {
  console.log("No items found in localStorage", localTodoLists)
}
};
//*================================================================
//* Initially display items from localStorage when the page loads
//*================================================================
showTodoFromLocalStorage();

//*=======================================================
//*** Fetch data from database and display on page reload
//*=======================================================
const showTodoFromDb = async () => {
  try {
    const response = await fetch("http://localhost:3000/getAllItem");
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      mainTodoElem.innerHTML = ""; //* Clear existing DOM elements
      localTodoLists = []; //* Reset local storage list

      data.forEach((item) => {
        localTodoLists.push(item.item); //* Update local storage list
        addTodoDynamicElement(item.item); //* Add items to DOM
      });

      addTodoListLocalStorage(localTodoLists); //* Sync with local storage
      console.log("Fetched items from database:", localTodoLists);
    } else {
      console.log("No items found in database: ", localTodoLists);
    }
  } catch (error) {
    console.error("Error fetching items from database:", error);
  }
};

//*===============================================
//* Call the function when the page loads
//*===============================================
showTodoFromDb(); 


//*=========================================================
//* Remove a todo item from both local storage and database
//*=========================================================
const removeTodoElem = async (e) => {
  const todoToRemove = e.target;
  const todoListContent = todoToRemove.previousElementSibling.previousElementSibling.innerText;
  const parentElem = todoToRemove.parentElement;

  //*==========================
  //*Remove from localStorage
  //*==========================
  localTodoLists = localTodoLists.filter((curTodo) => curTodo !== todoListContent);
  addTodoListLocalStorage(localTodoLists);
  //*=========================
  //* remove item from DOM
  //*=========================
  parentElem.remove(); //* remove item from DOM
  console.log(`Item deleted from localStorage: ${todoListContent}`);
  console.log("Fetched items from localStorage: ", localTodoLists); //* Show items to console



  //*======================================
  //* Delete item from backend database
  //*======================================
  try {
    await fetch("http://localhost:3000/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ item: todoListContent })
    });
    console.log(`Item deleted from database: ${todoListContent}`);
    console.log("Fetched items from database: ", localTodoLists); //* Show items to console

  } catch (error) {
    console.error("Error deleting item from database:", error);
  }
};


//*========================================================
//* Update a todo item in both local storage and database
//*========================================================
const updateTodoElem = async (e) => {
  const todoToUpdate = e.target;
  const todoItemElement = todoToUpdate.previousElementSibling;
  const todoListContent = todoItemElement.innerText;
  const updatedValue = prompt("Update your task:", todoListContent);

  if (updatedValue && updatedValue.trim() !== "") {
    const index = localTodoLists.indexOf(todoListContent);
    if (index > -1) {
      //*=====================
      //* update item in DOM
      //*=====================
      // localTodoLists[index] = updatedValue; //* update item in DOM
      todoItemElement.innerText = updatedValue;
      //*================================== 
      //* update item in localStorage
      //*==================================
      addTodoListLocalStorage(localTodoLists); //* update item in localStorage 
      console.log(`Item updated in localStorage: ${todoListContent} to ${updatedValue}`);
      console.log("Fetched items from localStorage: ", localTodoLists); //* Show items to console


      //*===================================
      //* Send update to backend database
      //*===================================
      try {
        await fetch("http://localhost:3000/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ oldItem: todoListContent, newItem: updatedValue })
        });
        console.log(`Item updated in database: ${todoListContent} to ${updatedValue}`);
        console.log("Fetched items from database: ", localTodoLists); //* Show items to console

        todoItemElement.innerText = updatedValue; //* Update the UI
      } catch (error) {
        console.error("Error updating item in database:", error);
      }
    }
  }
};


//*==============================================================
//* Function to display the search result at the top of the list
//*==============================================================
const displaySearchResult = (item) => {
  mainTodoElem.innerHTML = ""; //* Clear the existing list before showing search result
  addTodoDynamicElement(item); //* Add the searched item at the top
  //*----------------------------------
  //* Highlight the search result item
  //*----------------------------------
  const items = document.querySelectorAll(".main_todo_div li");
  items.forEach((li) => {
    if (li.innerText === item) {
      li.parentElement.style.backgroundColor = "#ffeb3b"; //* Highlight search result
      li.setAttribute("data-search-highlighted", "true"); //* Mark the item as highlighted
    }
  });
  //*-----------------------------------------
  //* Then add the rest of the items below it
  //*-----------------------------------------
  localTodoLists.forEach((curElem) => {
    if (curElem !== item) {
      addTodoDynamicElement(curElem); //* Add other items below
    }
  });
};

//*--------------------------------------------------
//* Function to reset the list to its original state
//*--------------------------------------------------
const resetSearchResult = () => {
  //*-------------------------------------------------
  //* Clear highlights and rebuild the original list
  //*-------------------------------------------------
  mainTodoElem.innerHTML = ""; //* Clear the DOM
  localTodoLists.forEach((curElem) => addTodoDynamicElement(curElem)); //* Rebuild the original list
  console.log("resetSearchResult: List returned to original order.");
};







//*===================
//* Search function
//*===================
const searchTodoList = async () => {
  const searchValue = inputValue.value.trim();

  //*------------------------------------------
  //* Display warning if search field is empty
  //*------------------------------------------
  if (!searchValue) {
    inputValue.value = "";
    inputValue.placeholder = "Please enter a task to search!";
    inputValue.style.backgroundColor = "#ffcccc"; //* Red background
    console.warn("Warning: Please enter a task to search!"); //* Log warning to console
    return;
  }

  //*--------------------------------------------------
  //* Clear previous search results (reset highlight)
  //*--------------------------------------------------
  const items = document.querySelectorAll(".main_todo_div");
  items.forEach((item) => (item.style.backgroundColor = "")); //* Reset highlight

  let foundLocally = false;
  let foundInDb = false;
  let localResult = [];
  let dbResult = null;

  //*=======================
  //* Search in LocalStorage
  //*=======================
  if (localTodoLists.includes(searchValue)) {
    foundLocally = true;
    localResult.push(searchValue);
    console.log(`Item found in LocalStorage: ${searchValue}`);
  }

  //*==============================================
  //* Search in the Database
  //*==============================================
  try {
    const response = await fetch(`http://localhost:3000/search?item=${searchValue}`);
    const result = await response.json();

    if (result.item) {
      foundInDb = true;
      dbResult = result.item;
      console.log(`Item found in Database: ${searchValue}`);
    }
  } catch (error) {
    console.error("Error searching item in database:", error);
  }

  //*======================
  //* Combine Results
  //*======================
  if (foundLocally || foundInDb) {
    //* Display LocalStorage Result
    if (foundLocally) {
      console.log("Results from LocalStorage:", localResult);
      displaySearchResult(localResult[0]); //* Display the first found result from LocalStorage
    }

    //* Display Database Result
     if (foundInDb) {
      console.log("Result from Database:", dbResult);
      
      //* Add to LocalStorage list only if not already present
      if (!localTodoLists.includes(dbResult)) {
        localTodoLists.unshift(dbResult); //* Add to Local list
        addTodoListLocalStorage(localTodoLists); //* Update LocalStorage
      }

      displaySearchResult(dbResult); //* Display the result from Database
    }

    //* Highlight the input field for successful search
    inputValue.value = ""; //* Clear input field
    inputValue.placeholder = "Search item found!";
    inputValue.style.backgroundColor = "#caffbf"; //* Light green background
  } else {
    //* No Results Found
    inputValue.value = "";
    inputValue.placeholder = `Item "${searchValue}" not found!`;
    inputValue.style.backgroundColor = "#ffcccc"; //* Red background
    console.warn(`Warning: Item "${searchValue}" not found in LocalStorage or Database.`);
  }
};


//*--------------------------------------------------------
//*** Event listener for resetting input field after click
//*--------------------------------------------------------
inputValue.addEventListener("click", () => {
  inputValue.placeholder = "Enter your task"; //* Reset placeholder
  inputValue.style.backgroundColor = ""; //* Reset background color
  
});


//*----------------------------------------------------------------
//*** Event listener for delete btn, update btn, resetSearchResult
//*----------------------------------------------------------------
mainTodoElem.addEventListener("click", (e) => {
  if (e.target.classList.contains("deleteBtn")) {
    removeTodoElem(e);
  } else if (e.target.classList.contains("updateBtn")) {
    updateTodoElem(e);
  } else if (e.target.tagName === "LI") {
    const isHighlighted = e.target.getAttribute("data-search-highlighted");
    if (isHighlighted === "true") {
      //* If the clicked item was highlighted, reset the list
    resetSearchResult(); //* Reset the list to its original state
  }
}
});

document.querySelector(".addBtn").addEventListener("click", (e) => addTodoList(e));
document.querySelector(".searchBtn").addEventListener("click", searchTodoList);























































//* ok code final




// const mainTodoElem = document.querySelector(".todo-lists-elem");
// const inputValue = document.getElementById("inputValue");

// //*=========================================================
// //*** Get items from localStorage & store in localTodoLists
// //*=========================================================
// const getTodoListFromLocal = () => JSON.parse(localStorage.getItem("todoList")) || [];
// let localTodoLists = getTodoListFromLocal();

// // //*===================================
// // //*** Sync local storage with backend
// // //*===================================
// const addTodoListLocalStorage = (localTodoLists) => {
//   localStorage.setItem("todoList", JSON.stringify(localTodoLists));
//   // console.log("Updated LocalStorage:", localTodoLists);
// };






// //*=======================================================
// //*** Dynamically add a todo item to the list in the DOM
// //*=======================================================
// const addTodoList = async (e) => {
//   e.preventDefault();
//   const todoListValue = inputValue.value.trim();
//   inputValue.value = "";

//   inputValue.setAttribute("placeholder", "Enter your task");
//   inputValue.style.backgroundColor = "";

//   if (!todoListValue) {
//     inputValue.placeholder = "Input field cannot be empty!";
//     inputValue.style.backgroundColor = "#ffcccc";
//     console.warn("Warning: Input field is empty!");
    
//     return;
//   }

//   if (localTodoLists.includes(todoListValue)) {
//     inputValue.placeholder = "Duplicate value! Try again!";
//     inputValue.style.backgroundColor = "#ffcccc";
//     console.warn("Warning: Duplicate value! Try again!");

//     return;
//   }

//   //* Add to LocalStorage
//   localTodoLists.push(todoListValue);
//   addTodoListLocalStorage(localTodoLists);
//   console.log("Items added to localStorage: ", todoListValue);
//   console.log("Fetched items from localStorage: ", localTodoLists);
  
  

//   //* Add the new item to DOM
//   addTodoDynamicElement(todoListValue);

//   //* Add to Backend (server-side)
//   try {
//     await fetch("http://localhost:3000/add", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ item: todoListValue }),
//     });
//     console.log("Items added to database: ", todoListValue);
//     console.log("Fetched items from database: ", localTodoLists);
//   } catch (error) {
//     console.error("Error adding item to backend:", error);
//   }
// };

// // Function to dynamically add todo item to DOM
// const addTodoDynamicElement = (curElem) => {
//   const divElement = document.createElement("div");
//   divElement.classList.add("main_todo_div");
//   divElement.innerHTML = `
//     <li>${curElem}</li>
//     <button class="updateBtn">Update</button>
//     <button class="deleteBtn">Delete</button>
//   `;
//   mainTodoElem.append(divElement);
// };



// //*=========================================================
// //*** Remove a todo item from LocalStorage, Backend & DOM
// //*=========================================================
// const removeTodoElem = async (e) => {
//   const parentElem = e.target.parentElement;
//   const todoListContent = parentElem.querySelector("li").innerText;

//   //* Remove from LocalStorage
//   localTodoLists = localTodoLists.filter((item) => item !== todoListContent);
//   addTodoListLocalStorage(localTodoLists);
//   console.log("Item deleted from localStorage: ", todoListContent);
//   console.log("Fetched items from localStorage: ", localTodoLists);
  
  

//   //* Remove from Backend
//   try {
//     await fetch("http://localhost:3000/delete", {
//       method: "DELETE",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ item: todoListContent }),
//     });
//     console.log("Item deleted from backend: ", todoListContent );
//     console.log("Fetched items from backend: ", localTodoLists );
    
    
//   } catch (error) {
//     console.error("Error deleting item from backend:", error);
//   }

//   //* Remove from DOM
//   parentElem.remove();
// };

// //*=======================================================
// //*** Update a todo item in LocalStorage, Backend & DOM
// //*=======================================================
// const updateTodoElem = async (e) => {
//   const todoItemElement = e.target.previousElementSibling;
//   const oldValue = todoItemElement.innerText;
//   const newValue = prompt("Update your task:", oldValue);

//   if (newValue && newValue.trim() !== "") {
//     //* Update in LocalStorage
//     const index = localTodoLists.indexOf(oldValue);
//     if (index > -1) {
//       localTodoLists[index] = newValue;
//       addTodoListLocalStorage(localTodoLists);
//       console.log("Item updated in localStorage: ", oldValue + " to " + newValue);
//       console.log("Fetched items from localStorage: ", localTodoLists);
      
      
//     }

//     //* Update in Backend
//     try {
//       await fetch("http://localhost:3000/update", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ oldItem: oldValue, newItem: newValue }),
//       });
//       console.log("Item updated in database: ", oldValue + " to " + newValue);
//       console.log("Fetched items from database: ", localTodoLists);
//     } catch (error) {
//       console.error("Error updating item in backend:", error);
//     }

//     //* Update in DOM
//     todoItemElement.innerText = newValue;
//   }
// };

// //*=========================================================
// //*** Fetch data from localStorage and update DOM
// //*=========================================================
// const showTodoFromLocalStorage = () => {
//   const localTodoLists = getTodoListFromLocal(); // LocalStorage से डेटा प्राप्त करें
//   if (localTodoLists.length === 0) {
//     console.log("No data found in LocalStorage: ", localTodoLists);
//   } else {
//     console.log("Fetched items from LocalStorage:", localTodoLists);
//     mainTodoElem.innerHTML = ""; // Clear the existing list in DOM
//     localTodoLists.forEach((item) => {
//       addTodoDynamicElement(item); // DOM में सभी आइटम्स को दिखाएं
//     });
//   }
// };




// //*=========================================================
// //*** Fetch data from Backend and update DOM and LocalStorage
// //*=========================================================
// const showTodoFromDb = async () => {
//   try {
//     const response = await fetch("http://localhost:3000/getAllItem");
//     const data = await response.json();

//     if (Array.isArray(data) && data.length > 0) {
//       console.log("Fetched items from Backend:", data);
//       mainTodoElem.innerHTML = ""; // Clear the existing list in DOM
//       localTodoLists = data.map((item) => item.item); // Update localTodoLists with fetched items
//       addTodoListLocalStorage(localTodoLists); // Sync data to localStorage

//       // Add each item to the DOM
//       localTodoLists.forEach((item) => {
//         addTodoDynamicElement(item);
//       });
//     } else {
//       console.log("No data found in Database: ", data);
//     }
//   } catch (error) {
//     console.error("Error fetching items from backend:", error);
//   }
// };



// //*==============================================================
// //* Function to display the search result at the top of the list
// //*==============================================================
// const displaySearchResult = (item) => {
//   mainTodoElem.innerHTML = ""; //* Clear the existing list before showing search result
  
//   //* Add the searched item at the top
//   addTodoDynamicElement(item);

//   //* Highlight the search result item
//   const items = document.querySelectorAll(".main_todo_div li");
//   items.forEach((li) => {
//     if (li.innerText === item) {
//       li.parentElement.style.backgroundColor = "#ffeb3b"; //* Highlight search result
//       li.setAttribute("data-search-highlighted", "true"); //* Mark the item as highlighted
//     }
//   });

//   //* Add the rest of the items below the search result
//   localTodoLists.forEach((curElem) => {
//     if (curElem !== item) {
//       addTodoDynamicElement(curElem); //* Add other items below
//     }
//   });
// };


// //*--------------------------------------------------
// //* Reset search result to the original order
// //*--------------------------------------------------
// const resetSearchResult = () => {
//   console.log("Highlight reset. List returned to original order.");

  
//   //* Clear the DOM and rebuild the original list
//   mainTodoElem.innerHTML = ""; //* Clear the DOM
//   localTodoLists.forEach((curElem) => addTodoDynamicElement(curElem)); //* Rebuild the original list

//   inputValue.value = ""; //* Clear input field
//   inputValue.placeholder = "Enter your task"; //* Reset placeholder
//   inputValue.style.backgroundColor = ""; //* Reset background color
// };





// //*=========================================================
// //*** Search a todo item in LocalStorage and Backend
// //*=========================================================
// const searchTodoList = async () => {
//   const searchValue = inputValue.value.trim();

//   if (!searchValue) {
//     inputValue.placeholder = "Please enter a task to search!";
//     inputValue.style.backgroundColor = "#ffcccc";
//     console.warn("Warning: Please enter a task to search!");
//     return;
//   }

//   //* Clear the input field and display a message
//   inputValue.value = "";  // Clear input field

//   let itemFoundInLocalStorage = false;
//   let itemFoundInBackend = false;

//   //* Search in LocalStorage
//   if (localTodoLists.includes(searchValue)) {
//     console.log(`Search Result (LocalStorage): Found "${searchValue}"`);
//     inputValue.placeholder = "Search Item found in LocalStorage!";  // Message for found item
//     inputValue.style.backgroundColor = "#caffbf";  // Green background for success

//     //* Display the search result in DOM
//     displaySearchResult(searchValue);
//     itemFoundInLocalStorage = true;  // Item found in localStorage

//     // Listen for click on the search result to reset the list
//     document.querySelector('.main_todo_div li').addEventListener('click', resetSearchResult);
//   }

//   //* Search in Backend if not found in LocalStorage
//   try {
//     const response = await fetch(`http://localhost:3000/search?item=${searchValue}`);
//     const result = await response.json();

//     if (result.item) {
//       console.log(`Search Result (Backend): Found "${result.item}"`);
//       if (!localTodoLists.includes(result.item)) {
//         localTodoLists.push(result.item);
//         addTodoListLocalStorage(localTodoLists);
//       }

//       //* Display the search result in DOM
//       if (!itemFoundInLocalStorage) {
//         displaySearchResult(result.item);
//       }

//       inputValue.placeholder = "Item found in Backend!";  // Message for found item
//       inputValue.style.backgroundColor = "#caffbf";  // Green background for success
//       itemFoundInBackend = true;  // Item found in backend

//       // Listen for click on the search result to reset the list
//       document.querySelector('.main_todo_div li').addEventListener('click', resetSearchResult);
//     } else {
//       console.warn(`Warning: Item "${searchValue}" not found in backend.`);
//     }
//   } catch (error) {
//     console.error("Error searching item in backend:", error);
//   }

//   // If item is not found in both LocalStorage and Backend, show message
//   if (!itemFoundInLocalStorage && !itemFoundInBackend) {
//     console.warn(`Warning: Item "${searchValue}" not found in localStorage.`);
//     inputValue.placeholder = `Item "${searchValue}" not found.`;  // Message for item not found
//     inputValue.style.backgroundColor = "#ffcccc";  // Red background for error
//   }
// };


// //*=======================================================
// //*** Event Listeners
// //*=======================================================
// document.querySelector(".addBtn").addEventListener("click", addTodoList);
// document.querySelector(".searchBtn").addEventListener("click", searchTodoList);
// mainTodoElem.addEventListener("click", (e) => {
//   if (e.target.classList.contains("deleteBtn")) removeTodoElem(e);
//   else if (e.target.classList.contains("updateBtn")) updateTodoElem(e);
// });
// inputValue.addEventListener("click", () => {
//   inputValue.placeholder = "Enter your task";
//   inputValue.style.backgroundColor = "";
// });

// //* Fetch Initial Data from LocalStorage and Backend
// showTodoFromLocalStorage(); // Load from localStorage
// showTodoFromDb(); // Load from backend














































