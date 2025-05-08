# URL Analyzer - Client

A React-based web application that allows users to analyze URLs and get AI-generated summaries of web content.

## Features

- Clean, responsive user interface
- URL input validation
- Real-time analysis of web content
- Display of analysis history
- Integration with URL Analyzer API

## Technologies Used

- React.js
- TypeScript
- Axios for API requests
- CSS for styling
- Vercel for deployment

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd url-analyzer/client
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following content:

```
REACT_APP_API_URL=https://urlanalyzer-server.vercel.app
```

### Running Locally

```bash
npm start
# or
yarn start
```

This will start the development server at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
# or
yarn build
```

This will create a production-ready build in the `build` folder.

## Deployment

The client is deployed on Vercel. To deploy your own instance:

1. Install Vercel CLI

```bash
npm install -g vercel
```

2. Deploy to Vercel

```bash
vercel --prod
```

## Project Structure

- `src/` - Source code
  - `App.tsx` - Main application component
  - `components/` - Reusable UI components
  - `styles/` - CSS styles
  - `types/` - TypeScript type definitions
- `public/` - Static assets
- `build/` - Production build (generated)

## Environment Variables

- `REACT_APP_API_URL` - URL of the URL Analyzer API server

## License

[MIT](LICENSE)
