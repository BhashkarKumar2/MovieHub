# Google OAuth Setup Guide

This guide will help you configure Google OAuth authentication for your Movie List application.

## Prerequisites

- Google Account
- Google Cloud Console access
- Your application should be running on `http://localhost:3000` (frontend) and `http://localhost:5000` (backend)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown at the top
3. Click "New Project"
4. Enter project name: "Movie List App" (or your preferred name)
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on "Google+ API" and click "Enable"
4. Also enable "Google OAuth2 API" if available

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required information:
   - **App name**: Movie List App
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On "Scopes" page, click "Save and Continue" (default scopes are fine)
7. On "Test users" page, add your email as a test user
8. Click "Save and Continue"

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Set the name: "Movie List Web Client"
5. Add Authorized JavaScript origins:
   ```
   http://localhost:3000
   ```
6. Add Authorized redirect URIs:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
7. Click "Create"
8. Copy the **Client ID** and **Client Secret**

## Step 5: Configure Environment Variables

### Backend Configuration

1. Create a `.env` file in the `backend` directory (copy from `.env.example`):
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Open `backend/.env` and add your Google OAuth credentials:
   ```bash
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```

### Frontend Configuration

1. Create a `.env` file in the `frontend` directory (copy from `.env.example`):
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Open `frontend/.env` and add your Google Client ID:
   ```bash
   # Google OAuth Configuration
   REACT_APP_GOOGLE_CLIENT_ID=your-client-id-here
   ```

## Step 6: Install Required Dependencies

Make sure you have the required OAuth packages installed:

### Backend
```bash
cd backend
npm install passport passport-google-oauth20 express-session
```

### Frontend
```bash
cd frontend
npm install @google-cloud/local-auth googleapis
```

## Step 7: Test the Configuration

1. Start both servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

2. Go to `http://localhost:3000`
3. Click "Sign in with Google"
4. You should be redirected to Google's OAuth consent screen
5. After approval, you should be redirected back to your app and logged in

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**
   - Make sure your redirect URI in Google Console exactly matches: `http://localhost:5000/api/auth/google/callback`
   - Check for trailing slashes or typos

2. **"This app isn't verified" warning**
   - This is normal for development. Click "Advanced" > "Go to Movie List App (unsafe)"
   - For production, you'll need to verify your app with Google

3. **"No token found in URL" error**
   - Check that both frontend and backend environment files are configured
   - Verify that the backend server is running on port 5000
   - Check browser console for any JavaScript errors

4. **Environment variables not loading**
   - Make sure `.env` files are in the correct directories
   - Restart both servers after changing environment variables
   - Check that variable names start with `REACT_APP_` for frontend variables

### Debug Steps:

1. Check browser console for errors
2. Check backend console for OAuth-related logs
3. Verify environment variables are loaded:
   ```javascript
   // In backend, add temporary console.log
   console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);
   ```

4. Test the OAuth flow step by step:
   - Backend route: `http://localhost:5000/api/auth/google`
   - Callback route: `http://localhost:5000/api/auth/google/callback`

## Security Notes

- Never commit `.env` files to version control
- Use different OAuth credentials for development and production
- Regularly rotate your client secrets
- For production, add your actual domain to authorized origins and redirect URIs

## Production Deployment

When deploying to production:

1. Update authorized origins to include your production domain
2. Update redirect URIs to use your production backend URL
3. Update environment variables with production values
4. Consider using a more secure session store (Redis, MongoDB)

## Need Help?

If you encounter issues:
1. Check the [Google OAuth 2.0 documentation](https://developers.google.com/identity/protocols/oauth2)
2. Review the [passport-google-oauth20 documentation](https://www.passportjs.org/packages/passport-google-oauth20/)
3. Check your browser's developer tools for network errors
4. Verify all URLs and credentials are correctly configured
