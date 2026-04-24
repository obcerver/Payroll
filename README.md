# Payroll System

A professional payroll management system built with Laravel (Backend) and React (Frontend).

## Prerequisites

- PHP >= 8.2
- Composer
- Node.js & NPM
- MySQL 

## Project Setup

Follow these steps to get the project running locally:

### 1. Backend Setup (Laravel)

```bash
# Install PHP dependencies
composer install

# Create environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

> [!IMPORTANT]
> Configure your database connection in the `.env` file before proceeding to the next step.

### 2. Frontend Setup (React)

```bash
# Install root dependencies
npm install

# Install React dependencies
cd react
npm install
cd ..
```

### 3. Database Migration & Seeding

Run the following command to create the database tables and populate them with test data:

```bash
php artisan migrate --seed
```

## Default Login Credentials

Once the database is seeded, you can use the following credentials to access the system:

- **Email:** `test@example.com`
- **Password:** `password`

## Running the Application

You can start both the backend and frontend development servers concurrently from the root directory:

```bash
npm run dev
```

The application will typically be accessible at:
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8000](http://localhost:8000)

## Assumptions & Decisions Made

### Authentication
- **JWT-Based Auth**: Implemented token-based authentication (JWT) for the API. This was chosen over traditional session-based cookies to better support the decoupled nature of the React frontend and ensure stateless communication between the client and server.
- **Route Guarding**: All API endpoints (except login) are protected by authentication middleware to ensure data security.

### Reporting & Exports
- **PDF Generation**: Used `laravel-dompdf` to generate professional-grade payslips. The design language of the PDF was tailored to match the clean aesthetic of the web application.
- **CSV Export**: Implemented server-side streaming for CSV exports. This allows for efficient downloading of payroll history without consuming excessive server memory.

### Pagination
- **Server-Side Pagination**: Implemented server-side pagination for the Employee list and Payroll History. This ensures the application remains fast and responsive as the dataset grows (e.g., thousands of employees or years of records).
