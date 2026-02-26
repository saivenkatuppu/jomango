# JAMANGO Deployment Guide

## Overview
This guide covers how to deploy the **JAMANGO** platform. We will host the **Backend** on **Render** (or Railway/Heroku) and the **Frontend** on **Vercel**.

---

## Part 1: Backend Deployment (Render)
Hosted on a free tier service like Render.

### 1. Database Setup (MongoDB Atlas)
*   Ensure you have your **MongoDB Connection String** ready.
*   Go to **Network Access** in MongoDB Atlas and click **Add IP Address**.
*   Select **Allow Access from Anywhere** (0.0.0.0/0) to ensure Render can connect.

### 2. Deploy to Render
1.  Push your latest code to GitHub.
2.  Log within [Render.com](https://render.com/).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository (`jamango-version1`).
5.  **Settings**:
    *   **Root Directory**: `jamango-backend` (Important!)
    *   **Runtime**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
6.  **Environment Variables** (Add these):
    *   `MONGO_URI`: `mongodb+srv://...` (Your connection string)
    *   `JWT_SECRET`: `something_secret`
    *   `RAZORPAY_KEY_ID`: `rzp_test_...`
    *   `RAZORPAY_KEY_SECRET`: `...`
    *   `NODE_ENV`: `production`
    *   `AWS_S3_BUCKET_NAME`: `your-bucket-name`
    *   `AWS_REGION`: `ap-south-1`
    *   `AWS_ACCESS_KEY_ID`: `...`
    *   `AWS_SECRET_ACCESS_KEY`: `...`
7.  Click **Create Web Service**.
8.  **Wait**: Once deployed, copy the **URL** (e.g., `https://jamango-backend.onrender.com`). You will need this for the frontend.

---

## Part 2: Frontend Deployment (Vercel)
Hosted on Vercel for best performance.

### 1. Deploy
1.  Log in to [Vercel.com](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configure Project**:
    *   **Root Directory**: Click Edit -> Select `jamango-direct`.
    *   **Framework Preset**: Vite (should detect automatically).
    *   **Build Command**: `npm run build`.
    *   **Output Directory**: `dist`.
5.  **Environment Variables**:
    *   `VITE_API_BASE_URL`: The Backend URL from Part 1 **plus /api** (e.g., `https://jamango-backend.onrender.com/api`).
    *   `VITE_RAZORPAY_KEY_ID`: `rzp_test_...` (Same as backend).
6.  Click **Deploy**.

---

## Part 3: Verification
1.  Open your new Vercel URL (e.g., `https://jamango-frontend.vercel.app`).
2.  Check the **Network Tab** in Developer Tools.
3.  Ensure requests are going to your Render URL (not localhost).
4.  Test the **Checkout Flow** with a test Razorpay card.

---

## 🔒 Post-Deployment Security
Once deployed, remember to:
1.  Update the User roles in MongoDB directly if you need an Admin (set `isAdmin: true`).
2.  Generate a strong `JWT_SECRET` for production.
