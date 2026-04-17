// --- BACKEND SERVER FOR SEEKR / SYMPHONY ---
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'bmxTfy8j', // Your correct password is here!
    database: 'seekr_db'  // FIX 1: Pointing to your actual database name
});

db.connect((err) => {
    if (err) console.log("Database connection failed: ", err);
    else console.log("Connected to seekr_db MySQL Database!");
});

// --- ROUTES ---

// 1. User Registration Route
app.post('/register', (req, res) => {
    // Grab data sent from the HTML frontend
    const { fullName, email, password, role } = req.body;

    // FIX 2: Split "Full Name" into First and Last name for your database
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0]; // First word is first name
    const lastName = nameParts.slice(1).join(' ') || ''; // Everything else is last name

    // FIX 3: Capitalize the role to match your MySQL ENUM ('Member', 'Manager')
    const dbRole = role === 'manager' ? 'Manager' : 'Member';

    // Insert into your exact database columns
    const sql = "INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [firstName, lastName, email, password, dbRole], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: "Email already exists or error occurred." });
        }
        res.json({ success: true, message: "Account Created!" });
    });
});

// 2. User Login Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            // User found! 
            const user = results[0];
            // We send the role back in lowercase so the frontend routing works perfectly
            res.json({ success: true, role: user.role.toLowerCase() });
        } else {
            res.json({ success: false, message: "Invalid email or password." });
        }
    });
});

// Start Server
app.listen(3000, () => {
    console.log("Backend running on http://localhost:3000");
});