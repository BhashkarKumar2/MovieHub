require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require('jsonwebtoken'); // Import JWT
const bcrypt = require('bcrypt'); // Ensure bcrypt is installed
const { body, validationResult } = require('express-validator'); // Import express-validator
const User = require("./models/User"); // Import the User model
const Admin = require("./models/Admin"); // Import the Admin model
const Movie = require("./models/Movie"); // Import the Movie model

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => console.error(err));

// Registration Route
app.post("/register", async (req, res) => {
    const { role } = req.body; // Get the role from the request body
    if (!role) {
        return res.status(400).json({ message: "Role is required" });
    }

    const { username, password } = req.body; // Include username and password in destructuring
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user based on the role
    let newUser;
    if (role === 'admin') {
        newUser = new Admin({ username, password: hashedPassword, role });
    } else {
        newUser = new User({ username, password: hashedPassword, role: 'customer' });
    }
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
    const { username, password, role } = req.body; // Get username, password, and role from request body
    if (!username || !password || !role) {
        return res.status(400).json({ message: "Username, password, and role are required" });
    }

    let user;
    if (role === 'admin') {
        user = await Admin.findOne({ username });
    } else {
        user = await User.findOne({ username });
    }

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: "Login successful", token });
});

app.post("/movies", async (req, res) => {
    const newMovie = new Movie(req.body);
    await newMovie.save();
    res.status(201).json(newMovie);
});

app.get("/movies", async (req, res) => {
    const movies = await Movie.find().select('title genre year poster trailer');
    res.json(movies);
});

app.put("/movies/:id", async (req, res) => {
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedMovie);
});

app.delete("/movies/:id", async (req, res) => {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ message: "Movie deleted" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
