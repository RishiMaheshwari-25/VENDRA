




VENDRA — Multi-Vendor E-Commerce Platform

<p align="center">
  <b>A Full-Stack Commerce Ecosystem Built with the MERN Stack</b>
</p>

<p align="center">
  <a href="https://vendra-woad.vercel.app">Live Demo</a> •
  <a href="https://github.com/RishiMaheshwari-25/VENDRA">GitHub Repository</a>
</p>

Overview

VENDRA is a full-stack, multi-vendor e-commerce platform built using the MERN stack, designed to provide a comprehensive online shopping and seller-management experience.

Unlike conventional e-commerce applications limited to product listings and shopping cart operations, VENDRA focuses on implementing real-world commerce workflows through separate buyer and seller ecosystems, role-based authorization, dynamic product and variant management, secure session handling, and integrated online payment processing.

The platform emphasizes scalable backend architecture, secure API operations, database consistency, and seamless frontend-backend communication.

Live Application

Live Website: https://vendra-woad.vercel.app

GitHub Repository: https://github.com/RishiMaheshwari-25/VENDRA

Key Features

1. Authentication, Authorization & Session Security

Separate buyer and seller experiences with role-specific functionality.

JWT-based authentication for secure user identity verification.

Role-Based Access Control (RBAC).

Protected frontend routes and backend authorization middleware.

Redis-based token blacklisting to invalidate authentication tokens during logout.

Prevents reuse of previously invalidated tokens when accessing protected resources.

2. Advanced Product & Variant Management

Dedicated seller dashboard for product management.

Product creation, updating, and deletion.

Dynamic product variants supporting attributes such as size, color, and product-specific specifications.

Structured product information including titles, descriptions, images, pricing, and attributes.

Seller-specific product operations with authorization checks.

3. Shopping Cart & Wishlist

Dynamic shopping cart management.

Add, remove, and update product quantities.

Wishlist functionality for saving products for future purchases.

Coordinated updates across related collections when products are deleted.

Maintains data consistency between products, cart items, and wishlist entries.

4. Razorpay Payment Integration

Integrated Razorpay payment gateway.

Backend payment order creation.

Payment signature verification to validate transactions.

Payment status management using verified transaction details.

Dedicated order-success experience displaying purchased products, order information, payment confirmation, and transaction summaries.

5. Backend Architecture & Data Management

RESTful API architecture using Node.js and Express.js.

MongoDB and Mongoose for database management and schema modeling.

Modular backend architecture with separate routes, controllers, models, and middleware.

Server-side validation and authorization.

Coordinated database updates across related collections.

Structured API communication between frontend and backend.

6. Frontend & State Management

React.js component-based architecture.

Redux for centralized application state management.

React Router for navigation and protected routing.

Structured API services for backend communication.

Separate buyer and seller interfaces.

Technology Stack

Category

Technologies

Frontend

React.js, JavaScript, SCSS

State Management

Redux

Routing

React Router

Backend

Node.js, Express.js

Database

MongoDB, Mongoose

Authentication

JWT

Authorization

Role-Based Access Control

Session Security

Redis

Payment Gateway

Razorpay

API Architecture

REST APIs

Deployment

Vercel, Render

Application Architecture

VENDRA follows a modular full-stack architecture that separates frontend presentation, backend business logic, authentication, and database operations.

              VENDRA APPLICATION
                      |
          +-----------+-----------+
          |                       |
      FRONTEND                 BACKEND
       React.js              Node.js
          |                 Express.js
          |                       |
     Redux Store             Middleware
          |                       |
     React Router       Authentication / RBAC
          |                       |
      API Services        Routes & Controllers
          |                       |
          +---------- API --------+
                                  |
                      +-----------+-----------+
                      |           |           |
                   MongoDB       Redis      Razorpay
                   Database      Token      Payments
                                Blacklist

Project Structure

The application uses a modular frontend-backend separation.

VENDRA/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── assets/
│   │   └── ...
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── README.md

Note: Directory names are illustrative; adjust them to match the actual repository structure.

Getting Started

Follow these instructions to run VENDRA locally.

Prerequisites

Make sure you have installed:

Node.js

npm

MongoDB (local instance or MongoDB Atlas)

Redis (local instance or cloud service)

Razorpay account for payment integration

1. Clone the Repository

git clone https://github.com/RishiMaheshwari-25/VENDRA.git

cd VENDRA

2. Backend Setup

Navigate to the backend directory:

cd backend

Install dependencies:

npm install

Create a .env file in the backend directory.

3. Environment Variables

Configure the required environment variables according to your backend configuration.

PORT=3000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

REDIS_URL=your_redis_connection_url

FRONTEND_URL=http://localhost:5173

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

Important: These are illustrative variable names. Match them with the actual names used in your application. Never commit .env files, database credentials, JWT secrets, or payment gateway secrets to GitHub.

4. Start Backend Server

npm run dev

The backend server will run on the configured port.

5. Frontend Setup

Open another terminal:

cd frontend

Install dependencies:

npm install

Configure the frontend API base URL to point to your local backend.

Start the development server:

npm run dev

The frontend will typically be available at:

http://localhost:5173

Payment Integration

VENDRA integrates Razorpay to handle online payments.

The payment workflow includes:

The buyer initiates the checkout process.

The backend creates a Razorpay payment order.

The frontend uses the returned order details to initiate payment.

Razorpay processes the payment.

The backend verifies the payment signature.

Verified payment details are used to manage payment status.

The buyer receives an order-success experience.

For development, Razorpay test credentials can be configured to test transactions without processing real payments.

Security Implementation

Security is an important part of VENDRA's backend architecture.

JWT-based user authentication.

Role-based authorization for buyer and seller operations.

Protected routes and authorization middleware.

Redis-based token blacklisting for logout and session invalidation.

Server-side input validation.

Backend payment signature verification.

Environment-based secret management.

CORS configuration for controlled frontend-backend communication.

Deployment

VENDRA uses separate frontend and backend deployments.

Component

Deployment Platform

Frontend

Vercel

Backend

Render

Database

MongoDB

Session Security

Redis

Payment Gateway

Razorpay

Deployment workflow:

Push the latest frontend and backend changes to GitHub.

Configure the backend environment variables on Render.

Configure the frontend environment variables on Vercel.

Set the production frontend URL in the backend CORS configuration.

Configure the frontend API base URL to point to the deployed backend.

Verify database connectivity, authentication, Redis connectivity, and payment integration.

Project Objective

The primary objective of VENDRA is to build a scalable, modular, and business-oriented commerce ecosystem that demonstrates practical full-stack engineering beyond conventional CRUD applications.

It focuses on real-world business logic, buyer-seller interactions, secure authentication, session invalidation, dynamic product management, database consistency, payment verification, and third-party service integration.

The project demonstrates the implementation of interconnected backend systems and complete commerce workflows using modern web technologies.

Author

Rishi Maheshwari

GitHub: https://github.com/RishiMaheshwari-25

LinkedIn: https://www.linkedin.com/in/rishi-maheshwari-295313322/

<p align="center">
  <b>VENDRA — Building a Complete Multi-Vendor Commerce Experience.</b>
</p>
