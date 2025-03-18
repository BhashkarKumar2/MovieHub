# Movie Management Application

## Overview
This project is a Movie Management Application that allows users to view, add, update, and delete movies. It provides a user-friendly interface for managing movie data and includes user authentication for secure access.

## Technologies Used
- **Frontend**: React, Axios, React Router
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Styling**: CSS, Tailwind CSS

## Features
- User registration and login
- View a list of movies
- Add new movies
- Update existing movies
- Delete movies
- Responsive design

## Getting Started

### Prerequisites
- Node.js and npm installed on your machine
- MongoDB database set up

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd movievercel2
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `backend` directory and add your MongoDB connection string:
     ```
     MONGO_URI=<your-mongodb-connection-string>
     JWT_SECRET=<your-jwt-secret>
     ```

4. Start the backend server:
   ```bash
   npm start
   ```

5. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

6. Start the frontend application:
   ```bash
   npm start
   ```

### Usage
- Navigate to `http://localhost:3000` in your browser to access the application.
- Use the registration and login features to access the movie management functionalities.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License
This project is licensed under the MIT License.

## Acknowledgments
- Thanks to the contributors and the open-source community for their support and resources.
