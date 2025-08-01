const express = require('express');
const Movie = require('../models/Movie');

const router = express.Router();

// Add a review to a movie
router.post("/:id/review", async (req, res) => {
    try {
        const { user, rating, comment } = req.body;
        if (!user || !rating || !comment) {
            return res.status(400).json({ message: "User, rating, and comment are required" });
        }

        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        // Add review to the movie
        movie.reviews.push({ user, rating, comment });
        await movie.save();

        res.status(201).json({ message: "Review added successfully", reviews: movie.reviews });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get reviews for a specific movie
router.get("/:id/reviews", async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id).select("reviews");
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.json(movie.reviews);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Update a review
router.put("/:id/review/:reviewId", async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        const review = movie.reviews.id(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (rating) review.rating = rating;
        if (comment) review.comment = comment;

        await movie.save();

        res.json({ message: "Review updated successfully", review });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Delete a review
router.delete("/:id/review/:reviewId", async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        movie.reviews = movie.reviews.filter(review => review._id.toString() !== req.params.reviewId);
        await movie.save();

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
