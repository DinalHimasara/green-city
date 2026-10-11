::: {align="center"}
# 🌿 GREEN CITY

### Smart Waste Collection, Tracking and Management System

A digital waste-management platform connecting residents, drivers, and
administrators through mobile and web applications.

[![Project](https://img.shields.io/badge/Project-University%20Group%20Project-1B6E4A?style=for-the-badge)](https://github.com/DinalHimasara/green-city)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%7C%20Firebase-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
:::

------------------------------------------------------------------------

## 📖 About the Project

**Green City** is a Smart Waste Collection, Tracking and Management
System designed to improve municipal waste collection by connecting
residents, drivers, and administrators in one digital platform.

Traditional collection may rely on fixed routes and schedules regardless
of actual collection needs. This can cause unnecessary travel, delays,
and limited visibility into daily operations. Green City provides a
digital way for residents to submit requests and for administrators to
coordinate collection activities through a centralized dashboard.

## 🎯 Objectives

-   Make it easier for residents to report waste collection
    requirements.
-   Organize requests by waste category and location.
-   Support route planning and driver/vehicle assignment.
-   Manage collection schedules and statuses.
-   Provide centralized monitoring, analytics, and reports.
-   Connect mobile services and the web dashboard.

## ✨ Key Features

### 🏠 Resident Mobile Application

-   Register and log in.
-   Add residential location details.
-   Submit waste collection requests by category.
-   Check collection request status.

### 🚛 Driver Mobile Application

-   View assigned requests, schedules, and route information.
-   Access collection location details.
-   Update collection status.

### 🖥️ Admin Web Dashboard

-   Manage residents and drivers.
-   Manage collection vehicles.
-   Review and manage waste requests.
-   Create schedules and assign drivers and vehicles.
-   View collection activities, location information, analytics, and
    reports.
-   Manage system settings and notifications.

### 🗺️ Mapping and Integration

-   Display collection locations using OpenStreetMap-based services.
-   Support route planning and collection coordination.
-   Use Firebase Authentication and Firestore for mobile-oriented
    services and request data.
-   Synchronize relevant Firebase data with MongoDB through the backend
    synchronization service.

> **Scope note:** AI-based waste prediction and AI-based route
> optimization are possible future enhancements, not claims about the
> current implementation.

## 🧭 Main Workflow

1.  A resident logs in and provides location details.
2.  The resident selects a waste category and submits a collection
    request.
3.  The system makes the request available for administrative
    coordination.
4.  The administrator reviews the request and manages the driver,
    vehicle, schedule, and route information.
5.  The driver views the assignment and carries out collection.
6.  The driver updates the collection status.
7.  Collection records can be used for monitoring and reporting.

## 👥 User Roles

  -----------------------------------------------------------------------
  Role                                Responsibilities
  ----------------------------------- -----------------------------------
  **Resident**                        Manage account/location details,
                                      submit waste requests, and check
                                      request status.

  **Driver**                          View assigned requests, schedules
                                      and routes, and update collection
                                      status.

  **Administrator**                   Manage users, vehicles, requests,
                                      schedules, collections, settings,
                                      analytics, and reports.
  -----------------------------------------------------------------------

## 🗑️ Supported Waste Categories

-   Food Waste
-   Plastic Waste
-   Polythene Waste
-   Paper Waste
-   Glass Waste

## 🛠️ Technology Stack

  -----------------------------------------------------------------------
  Component                           Technologies
  ----------------------------------- -----------------------------------
  **Web Frontend**                    Next.js, React, TypeScript,
                                      Tailwind CSS

  **Backend**                         Node.js, Express.js

  **Main Database**                   MongoDB, Mongoose

  **Mobile Services and Data**        Firebase Authentication, Cloud
                                      Firestore

  **Authentication**                  JWT, bcrypt, Firebase
                                      Authentication

  **Maps and Routing**                OpenStreetMap, Leaflet / React
                                      Leaflet, OSRM-based routing where
                                      configured

  **Communication**                   REST APIs; Socket.IO where
                                      configured

  **Version Control**                 Git and GitHub

  **Web Deployment**                  Vercel where configured
  -----------------------------------------------------------------------

## 🏗️ System Architecture

``` text
Resident Mobile App                 Driver Mobile App
         |                                  |
         +------------- Firebase -----------+
                         |
                  Backend Sync Service
                         |
                  Node.js / Express API
                         |
                 MongoDB / Mongoose
                         |
                  Admin Web Dashboard
                         |
              Maps, Routes and Analytics
```

MongoDB is the main operational database for backend application
records. Firebase supports mobile authentication and Firestore-based
data. The backend synchronization service transfers relevant Firebase
data into MongoDB for use by the web system.

## 📂 Repository Structure

``` text
green-city/
├── backend/       # Express API, controllers, models, routes and Firebase sync
├── frontend/      # Next.js web application and admin dashboard
├── .gitignore
└── README.md
```

The mobile application is a connected part of the overall system and may
be maintained separately from this repository.

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) and npm
-   [Git](https://git-scm.com/)
-   A MongoDB database, such as MongoDB Atlas
-   A Firebase project with the required Authentication and Firestore
    configuration

### 1. Clone the Repository

``` bash
git clone https://github.com/DinalHimasara/green-city.git
cd green-city
```

### 2. Set Up the Backend

``` bash
cd backend
npm install
```

Create a local `backend/.env` file and configure the variable names
expected by your backend code. Example values:

``` env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
```

If the current code uses different environment variable names, use those
names consistently in the code and `.env` file. Configure Firebase Admin
SDK credentials securely as required by the backend. Never commit real
credentials or service-account JSON files.

Start the backend:

``` bash
npm run dev
```

The backend uses `http://localhost:5000` if configured with the default
port.

### 3. Set Up the Frontend

Open a second terminal at the repository root:

``` bash
cd frontend
npm install
npm run dev
```

Next.js commonly uses `http://localhost:3000`. Check the terminal output
if another port is selected. If the frontend requires a backend API URL,
configure the environment variable expected by the frontend code.

### 4. Run Both Applications

Keep the frontend and backend running in separate terminals. Confirm
that MongoDB and Firebase are configured before testing features that
depend on them.

## 🔐 Security Notes

-   Passwords for MongoDB user accounts are hashed using bcrypt.
-   JWTs are used for token-based backend authentication.
-   Role checks restrict administrative operations.
-   Firebase Authentication supports mobile-oriented authentication
    flows.
-   Never commit database passwords, JWT secrets, Firebase
    service-account credentials, or private keys.
-   Before production deployment, verify that secrets are outside source
    code, tokens have suitable expiration, CORS is restricted to trusted
    origins, and HTTPS is enabled.

## 🧪 Testing Checklist

Test the main workflows across the mobile app, backend, and dashboard:

-   Registration and login
-   Role-based access and protected operations
-   Waste request creation and status updates
-   Driver and vehicle assignment
-   Schedule management
-   Map/location display and route information
-   Firebase-to-MongoDB synchronization
-   Collection records, analytics, and reports

## 🔮 Future Enhancements

-   Push notifications for residents and drivers.
-   Historical-data-based waste collection demand prediction.
-   AI-assisted route optimization.
-   Expansion to additional districts.
-   Resident feedback and service ratings.
-   Further map and routing service integrations.

## 👨‍💻 Project Team --- Group 16

  -----------------------------------------------------------------------
  Registration Number     Team Member             Main Contribution
  ----------------------- ----------------------- -----------------------
  UWU/ICT/23/014          A.K.R.P.K. Perera       Frontend lead,
                                                  dashboard UI,
                                                  responsive design, API
                                                  integration

  UWU/ICT/23/046          M.H.D. Himasara         Backend lead, database
                                                  models, REST APIs,
                                                  authentication and
                                                  authorization

  UWU/ICT/23/047          M.G.N.N. Bandara        Mobile/web integration
                                                  and API integration

  UWU/ICT/23/049          N.H.S. Kanchana         Mobile application
                                                  development, UI, API
                                                  consumption and testing

  UWU/ICT/23/084          E.M.L.C. Ekanayake      Documentation, mobile
                                                  UI and development
                                                  support
  -----------------------------------------------------------------------

## 🎓 Academic Context

Green City is a university group project developed at **Uva Wellassa
University (UWU)**. It focuses on improving the coordination,
visibility, and efficiency of municipal waste collection through
connected mobile and web applications.

## 📄 License

This project was developed for academic purposes. No open-source license
is specified here; contact the project team before reusing or
redistributing the code.

------------------------------------------------------------------------

::: {align="center"}
**🌱 Green City --- Connecting Communities for Cleaner Cities**

[View the Repository](https://github.com/DinalHimasara/green-city)
:::
