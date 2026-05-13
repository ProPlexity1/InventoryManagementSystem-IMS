# 📦 Inventory Management System (IMS) – SaaS Platform

![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)
![.NET](https://img.shields.io/badge/.NET-Backend-512BD4?style=for-the-badge&logo=dotnet)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-316192?style=for-the-badge&logo=postgresql)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A modern **full-stack Inventory Management SaaS platform** built with **React**, **.NET (Web API)**, and **PostgreSQL**, featuring secure JWT authentication and a scalable architecture for managing products, stock flow, and inventory operations.

---

## 🚀 Live System Overview

This project is a **real-world SaaS-style inventory system** designed to manage:

- Product inventory
- Stock in / stock out operations
- User authentication & authorization
- Role-based access control (if applicable)
- Centralized dashboard for management

---

## 🏗️ Architecture

- **Frontend:** React (SPA dashboard UI)
- **Backend:** .NET Core Web API (business logic + authentication)
- **Database:** PostgreSQL (relational data storage)
- **Authentication:** JWT-based secure authentication system

---

## ✨ Features

### 🔐 Authentication System
- User registration & login
- JWT-based authentication
- Secure protected routes
- Token-based session handling

### 📦 Inventory Management
- Add / update / delete products
- Stock in / stock out tracking
- Product categorization (if implemented)
- Real-time inventory updates

### 📊 Dashboard
- Inventory overview
- Product statistics
- Stock tracking insights
- Clean admin-style UI

### 👤 User Management
- Role-based access (Admin/User if implemented)
- Secure API access control

---

## 🧰 Tech Stack

### Frontend
- React.js
- Axios (API communication)
- Tailwind CSS / CSS (UI styling)
- React Router

### Backend
- ASP.NET Core Web API
- Entity Framework Core
- JWT Authentication
- RESTful API design

### Database
- PostgreSQL
- Relational schema design
- EF Core migrations

### Deployment
- Frontend: Vercel
- Backend: Railway
- Database: Railway PostgreSQL

---

## 🔐 Authentication Flow
User Login → JWT Generated (.NET API)
↓
Token Stored in Client
↓
Protected API Requests (Authorization Header)
↓
Backend Validates Token → Grants Access


---

## 📂 Project Structure

### Backend (.NET)
Controllers/
Models/
Services/
Data/
Middleware/

### Frontend (React)
src/
components/
pages/
services/
context/

