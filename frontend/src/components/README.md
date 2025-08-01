# Frontend Components Structure

This document describes the organized structure of the React components in the frontend application.

## Directory Structure

```
src/components/
├── auth/                    # Authentication related components
│   ├── Login.js            # User login form
│   ├── Register.js         # User registration form
│   ├── GoogleSignInButton.js  # Google OAuth sign-in button
│   └── GoogleAuthSuccess.js   # Google OAuth success handler
│
├── movies/                  # Movie related components
│   ├── EnhancedMoviesPage.js  # Main movies page with TMDB integration
│   ├── MoviesPage.js          # Legacy movies page (MongoDB based)
│   ├── MovieCard.js           # Individual movie card component
│   ├── MovieDetailsPage.js    # Detailed movie information page
│   ├── MovieForm.js           # Add/Edit movie form (Admin only)
│   └── MovieInsightsModal.js  # AI insights modal for movies
│
├── user/                    # User-specific feature components
│   ├── WatchlistPage.js     # User's movie watchlist
│   └── PaymentPage.js       # Payment processing page
│
└── common/                  # Common/shared components
    └── WelcomePage.js       # Application welcome/landing page
```

## Component Categories

### Authentication (`auth/`)
- **Purpose**: Handle user authentication and OAuth flows
- **Dependencies**: AuthContext, Google OAuth services
- **Usage**: Login/register flows, Google authentication

### Movies (`movies/`)
- **Purpose**: Movie browsing, display, and management
- **Dependencies**: TMDB API, Gemini AI, AuthContext
- **Usage**: Main application functionality for movie discovery and management

### User Features (`user/`)
- **Purpose**: User-specific features and personal data management
- **Dependencies**: Local storage, movie APIs, AuthContext
- **Usage**: Personal features like watchlist and payments

### Common (`common/`)
- **Purpose**: Shared components used across the application
- **Dependencies**: Minimal, mostly presentational
- **Usage**: Landing pages, shared UI elements

## Import Paths

When importing components from different directories:

```javascript
// From App.js (src/ level)
import Login from './components/auth/Login';
import EnhancedMoviesPage from './components/movies/EnhancedMoviesPage';
import WatchlistPage from './components/user/WatchlistPage';
import WelcomePage from './components/common/WelcomePage';

// From component within same category (e.g., MovieCard.js in movies/)
import MovieInsightsModal from './MovieInsightsModal';

// From component to services/context (e.g., from auth/ or movies/)
import { useAuth } from '../../context/AuthContext';
import { movieApi } from '../../services/geminiMovieApi';
```

## Benefits of This Structure

1. **Better Organization**: Related components are grouped together
2. **Easier Navigation**: Developers can quickly find components by functionality
3. **Scalability**: Easy to add new components to appropriate categories
4. **Maintainability**: Clear separation of concerns
5. **Code Reusability**: Components within categories can easily import from each other

## Future Additions

When adding new components, consider these guidelines:
- **Authentication features** → `auth/`
- **Movie-related features** → `movies/`
- **User profile/data features** → `user/`
- **Shared/reusable UI** → `common/`
