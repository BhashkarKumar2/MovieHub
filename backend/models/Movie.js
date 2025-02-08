const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  year: { type: Number, required: true },
  poster: { type: String, required: true },
  trailer: { type: String, required: true },
}, { collection: 'movies' }); // Specify the collection name here

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
