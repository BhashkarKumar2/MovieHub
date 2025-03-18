const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
 

  title: { type: String, required: true },
  genre: { type: String, required: true },
  year: { type: Number, required: true },
  poster: { type: String, required: true },
  trailer: { type: String, required: true },
  reviews: [
    {
      user: { type: String, required: true }, // User who posted the review
      rating: { type: Number, required: true, min: 1, max: 5 }, // Rating between 1 to 5
      comment: { type: String, required: true }, // User comment
      date: { type: Date, default: Date.now }, // Timestamp of the review
    }
  ],
}, { collection: 'movies' }); // Specify the collection name here

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
