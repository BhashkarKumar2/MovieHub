const express = require('express');
const Movie = require('../models/Movie');

const router = express.Router();

// Create a new movie
router.post("/", async (req, res) => {
    try {
        const newMovie = new Movie(req.body);
        await newMovie.save();
        res.status(201).json(newMovie);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get all movies
router.get("/", async (req, res) => {
    try {
        const movies = await Movie.find().select('title genre year poster trailer');
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Update a movie
router.put("/:id", async (req, res) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedMovie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        res.json(updatedMovie);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Delete a movie
router.delete("/:id", async (req, res) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if (!deletedMovie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        res.json({ message: "Movie deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
