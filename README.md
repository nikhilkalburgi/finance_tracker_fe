# Finance Tracker - Personal Finance Management Application

## Introduction

Finance Tracker is a comprehensive personal finance management application that helps users track their income, expenses, and budgets. The application provides an intuitive interface for managing financial transactions, setting budget goals, and visualizing spending patterns.

Built with React on the frontend and Django REST Framework on the backend, Finance Tracker offers a responsive and user-friendly experience across devices. The application uses modern web technologies and follows best practices for performance, security, and user experience.

Key features include:

- Transaction management (income and expenses)
- Budget planning and tracking
- Category organization
- Financial dashboard with visualizations
- Secure authentication

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Python (v3.8 or higher)
- pip (latest version)
- Django (v3.2 or higher)
- SQLite

## Installation

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/finance-tracker-be.git
   cd finance-tracker-be
   ```

2. Set up a Python virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```

3. Install backend dependencies:

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Configure the database in `settings.py` (default is SQLite, but PostgreSQL is recommended for production)

5. Apply migrations:

   ```bash
   python manage.py migrate
   ```

6. Create a test user:

   ```bash
   python manage.py create_test_user
   ```

7. Create a superuser:

   ```bash
   python manage.py createsuperuser
   ```

8. Start the Django development server:

   ```bash
   python manage.py runserver

   ```

   The backend API will be available at `http://localhost:8000/api`

   Note: The DRF API is hosted at `https://finance-tracker-be-1-87a42fd39153.herokuapp.com/api`

### Frontend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/finance-tracker-fe.git
   cd finance-tracker-fe
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Start the React development server:

   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`

## Test User Information

For testing purposes, you can use the following credentials:

- **Username**: testuser
- **Password**: password123

This test account comes pre-populated with sample transactions, budgets, and categories to help you explore the application's features.

## Key Technologies

### Frontend

- React
- React Router for navigation
- React Query for data fetching and caching
- Material-UI for UI components
- D3.js for data visualization
- Axios for HTTP requests
- Formik and Yup for form handling and validation

### Backend

- Django
- Django REST Framework
- JWT Authentication
- SQLite

## Development

### Available Scripts

In the frontend directory, you can run:

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production

In the backend directory, you can run:

- `python manage.py runserver`: Starts the development server
- `python manage.py test`: Runs tests
- `python manage.py makemigrations`: Creates new migrations
- `python manage.py migrate`: Applies migrations

## Acknowledgements

- [React](https://reactjs.org/)
- [Django](https://www.djangoproject.com/)
- [Material-UI](https://mui.com/)
- [React Query](https://tanstack.com/query/latest)
- [D3.js](https://d3js.org/)
