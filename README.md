# Senior Capstone Project
This is a full-stack web application built for a senior capstone project. It consists of a React frontend and a Node.js/Express backend, featuring automated data scraping and database management.
## Project Structure
The project is divided into two main directories:
- **frontend/**: A React application built with Vite.
- **backend/myapp/**: A Node.js Express application handling API requests and background jobs.
## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
## Setup & Installation
### 1. Clone the repository
```bash
git clone <repository-url>
cd teoberbic.senior.capstone
```
### 2. Environment Configuration
Create a `.env` file in the root directory (or ensure it exists) with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/sscd
DB_NAME=sscd
# Add other necessary environment variables here
```
### 3. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend/myapp
npm install
```
### 4. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd ../../frontend
npm install
```
## Running the Application
### Backend
To start the backend server with hot-reloading (using nodemon):
```bash
cd backend/myapp
npm run dev
```
The server typically runs on `http://localhost:3000` (check `bin/www` or console output to confirm port).
### Frontend
To start the frontend development server:
```bash
cd frontend
npm run dev
```
The application will be available at the URL provided in the terminal (usually `http://localhost:5173`).
## Features & Scripts
### Data Scraping
The backend includes a cron job for scraping brand data.
- **Automatic:** Runs daily at midnight.
- **Manual:** You can trigger the scraper manually by running:
  ```bash
  cd backend/myapp
  npm run cron
  ```
### API Routes
- `/brands`: Endpoints for brand data.
- `/users`: Endpoints for user management.
- `/`: Index/Health check.
## Technologies Used
- **Frontend:** React, Vite, ESLint
- **Backend:** Node.js, Express, Mongoose, Node-Cron
- **Database:** MongoDB
