# GitHub StackBuilders API

A REST API server that retrieves data from GitHub's StackBuilders organization using GitHub's public REST API.

## Features

- Get repositories with more than a specified number of stars
- Get the latest updated repositories
- Calculate the sum of all repository stars
- **NEW**: Get top 5 repositories with most stars
- **NEW**: Get all repositories alphabetically (excluding those starting with 'h')
- Built with TypeScript and Fastify

## Installation

```bash
npm install
```

## How to Run the App

### Development Mode
```bash
npm run dev
```
This will start the server in development mode using `tsx` at `http://localhost:3000`

### Production Mode
1. Build the project:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

## How to Run Tests

### Run all tests:
```bash
npm test
```

### Run tests with coverage:
```bash
npm run test:coverage
```

The tests use fixture data and don't make real API calls to GitHub.

## API Endpoints

The server runs on `http://localhost:3000` and provides the following endpoints:

### Base Endpoints

- **GET /** - API documentation and available endpoints
- **GET /health** - Health check endpoint

### Organization Repository Endpoints

Replace `:org` with any GitHub organization name (e.g., `stackbuilders`):

#### Get Repositories by Stars
```
GET /org/:org/repos?minStars=5
```
- Returns repositories with more than `minStars` stars
- Default `minStars`: 5
- Example: `/org/stackbuilders/repos?minStars=10`

#### Get Latest Updated Repositories
```
GET /org/:org/latest?limit=5
```
- Returns the most recently updated repositories
- Default `limit`: 5
- Example: `/org/stackbuilders/latest?limit=10`

#### Get Sum of Repository Stars
```
GET /org/:org/star-sum
```
- Returns the total sum of stars for all repositories in the organization
- Example: `/org/stackbuilders/star-sum`

#### **NEW**: Get Top Repositories by Stars
```
GET /org/:org/top-stars?limit=5
```
- Returns the top repositories sorted by star count in descending order
- Default `limit`: 5
- Example: `/org/stackbuilders/top-stars?limit=10`

#### **NEW**: Get Repositories Alphabetically (Excluding 'h')
```
GET /org/:org/alphabetical
```
- Returns all repositories sorted alphabetically
- Excludes repositories whose names start with 'h' (case insensitive)
- Example: `/org/stackbuilders/alphabetical`

## Example Usage

```bash
# Get StackBuilders repos with more than 5 stars
curl http://localhost:3000/org/stackbuilders/repos

# Get latest 3 updated repositories
curl http://localhost:3000/org/stackbuilders/latest?limit=3

# Get total stars for all repositories
curl http://localhost:3000/org/stackbuilders/star-sum

# NEW: Get top 5 repositories by stars
curl http://localhost:3000/org/stackbuilders/top-stars

# NEW: Get repositories alphabetically (excluding those starting with 'h')
curl http://localhost:3000/org/stackbuilders/alphabetical
```

## Project Structure

```
src/
├── app.ts          # Main application with route definitions
├── server.ts       # Server startup
├── github.ts       # GitHub API integration
└── core/
    ├── types.ts    # TypeScript type definitions
    └── transforms.ts # Pure transformation functions
tests/              # Unit tests
fixtures/           # Test data fixtures
```

## Technologies Used

- **TypeScript** - Type-safe JavaScript
- **Fastify** - Fast and low overhead web framework
- **Vitest** - Testing framework
- **Undici** - HTTP client for GitHub API calls

## New Features Added

### 1. Top 5 Repositories by Stars
The `/org/:org/top-stars` endpoint returns repositories sorted by star count in descending order. You can specify a custom limit with the `limit` query parameter.

### 2. Alphabetical Repository List (Excluding 'h')
The `/org/:org/alphabetical` endpoint returns all repositories sorted alphabetically, but excludes any repository whose name starts with the letter 'h' (case insensitive). This demonstrates advanced filtering and sorting capabilities.
