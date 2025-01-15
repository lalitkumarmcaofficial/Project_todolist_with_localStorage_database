
//* Javascript code to create a connection with mysql database
//* and user can add, delete, update, search for an item in database.

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');

const app = express();




//* Parse JSON and form data
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//* Serve static files from the "frontend" folder
app.use(express.static(path.join(__dirname, '../frontend')));

//*** Set up MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", //* Use your MySQL username
  password: "LKR2000", //* Use your MySQL password
  database: "todo_list_db", //* Use your MySQL database name
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});




//*** Add a new item
app.post("/add", (req, res) => {
  const { item } = req.body;

  //* Check if the item already exists
  const checkQuery = "SELECT * FROM todo_list WHERE item = ?";
  db.query(checkQuery, [item], (err, results) => {
    if (err) {
      console.error("Error checking item:", err);
      return res.status(500).send("Error checking item");
    }

    if (results.length > 0) {
      //* If item already exists
      return res.status(400).send("This item already exists in the list!");
    }

    //* If item does not exist, insert it
    const insertQuery = "INSERT INTO todo_list (item) VALUES (?)";
    db.query(insertQuery, [item], (err) => {
      if (err) {
        console.error("Error adding item:", err);
        return res.status(500).send("Error adding item");
      }
      res.status(200).send("Item added successfully");
    });
  });
});



//*** Delete an item
app.delete("/delete", (req, res) => {
  const { item } = req.body;
  db.query("DELETE FROM todo_list WHERE item = ?", [item], (err, results) => {
    if (err) {
      console.error("Error deleting item:", err);
      res.status(500).send("Error deleting item");
    } else if (results.affectedRows === 0) {
      res.status(404).send("Item not found.");
    } else {
      res.status(200).send("Item deleted successfully");
    }
  });
});




//*** Update an item
app.put("/update", (req, res) => {
  const { oldItem, newItem } = req.body;
  db.query("UPDATE todo_list SET item = ? WHERE item = ?", [newItem, oldItem], (err, results) => {
    if (err) {
      console.error("Error updating item:", err);
      res.status(500).send("Error updating item");
    } else if (results.affectedRows === 0) {
      res.status(404).send("Item not found.");
    } else {
      res.status(200).send("Item updated successfully");
    }
  });
});




//*** Search for an item
app.get('/search', (req, res) => {
  const searchTerm = req.query.item;
  // Query the database for the item
  db.query('SELECT * FROM todo_list WHERE item = ?', [searchTerm], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error searching item", error: err });
    }
    if (results.length > 0) {
      return res.json({ item: results[0].item }); // Return the found item
    } else {
      return res.json({ item: null }); // No item found
    }
  });
});




//*** Fetch all items from the database
app.get("/getAllItem", (req, res) => {
  db.query("SELECT item FROM todo_list", (err, results) => {
    if (err) {
      console.error("Error fetching items from database:", err);
      res.status(500).send("Error fetching items");
    } else {
      res.status(200).json(results); // Return all items as JSON
    }
  });
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


