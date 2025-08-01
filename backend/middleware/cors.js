// cprs.js
const cors = require("cors");

const corsOptions = {
    origin: ["http://localhost:3000"], // Allow your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // If using cookies or sessions
    allowedHeaders: ["Content-Type", "Authorization"], // Add this if using tokens or special headers
};

module.exports = cors(corsOptions);
