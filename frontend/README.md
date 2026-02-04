# Tiny Blog Frontend

A modern Vue.js 3 frontend for the Tiny Blog application.

## Features

- **Authentication**: Login/Register with JWT tokens
- **Blog Posts**: Create, read, update, delete posts
- **Responsive Design**: Works on all devices
- **Search**: Search posts by title, content, or tags
- **Rich Content**: HTML support in post content
- **Modern UI**: Clean, minimalist design

## Tech Stack

- Vue 3 (Composition API)
- Vue Router for navigation
- Axios for API calls
- Vite for development and building

## Getting Started

### Prerequisites

- Node.js 16+ installed
- Backend server running on port 3000

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## API Configuration

The frontend is configured to proxy API requests to the backend server running on http://localhost:3000. This is set up in `vite.config.js`.

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable Vue components
│   ├── views/         # Page components
│   ├── services/      # API service layer
│   ├── router/        # Vue Router configuration
│   └── assets/        # CSS and other assets
├── public/            # Static assets
└── index.html         # HTML template
```

## Authentication

The app uses JWT tokens stored in localStorage for authentication. Protected routes require a valid token.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build