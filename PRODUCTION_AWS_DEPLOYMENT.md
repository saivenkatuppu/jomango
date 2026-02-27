# JAMANGO - Production-Grade AWS Deployment Guide

This document serves as the official DevOps playbook for securely, reliably, and redundantly deploying the JAMANGO Full-Stack application on AWS using real production data. It details the exact services, structure, and steps to deploy the system manually.

---

## 1. Cloud Architecture & Services Overview

To handle production traffic, we transition from single-server architectures to a decoupled, scalable approach.

*   **DNS & Routing:** AWS Route 53
*   **Edge CDN (Frontend):** AWS CloudFront
*   **Static Asset Storage (Frontend):** AWS S3
*   **Compute (Backend):** Application Load Balancer (ALB) + EC2 Auto Scaling Group (Ubuntu Server 24.04 LTS)
*   **Media & Uploads:** AWS S3 (Separate Bucket for user-uploaded product images)
*   **Database:** MongoDB Atlas (Production Dedicated Tier - M10+ - VPC Peered)
*   **Security & SSL:** AWS Certificate Manager (ACM) & AWS WAF

---

## 2. Pre-Requisites & Domain Setup

### 2.1 Route 53 Hosted Zone
1. Go to AWS Route 53 and create a Hosted Zone for your domain (e.g., `jamango.com`).
2. Update your domain registrar's Name Servers to match the AWS values.

### 2.2 AWS Certificate Manager (ACM) SSL Setup
1. Request a public certificate for `jamango.com` and `*.jamango.com`.
2. **Important:** Request one certificate in `us-east-1` (required for CloudFront). Request another certificate in your primary region (e.g., `ap-south-1`) for your backend Load Balancer.
3. Validate both certificates directly via Route 53 DNS records.

---

## 3. Database Layer (MongoDB Atlas)

For production data integrity, do not host MongoDB locally on EC2.

1. **Deploy Dedicated Cluster:** Provision an M10 or higher dedicated cluster in MongoDB Atlas located in your primary AWS region (e.g., `ap-south-1`).
2. **Network Peering:** Navigate to Network Access in Atlas. Set up a VPC Peering connection directly to your AWS Default VPC. 
3. **Database Security:**
   * Whitelist only your AWS VPC CIDR block (do not use `0.0.0.0/0` in production).
   * Create a dedicated Database User with `readWriteAnyDatabase` privileges constrained only to the `jamango_db`.

---

## 4. Frontend Deployment (Serverless S3 + CloudFront)

By utilizing S3 and CloudFront, front-end delivery speed is maximized globally without the need for active compute instances.

### 4.1 S3 Bucket for Static Hosting
1. Create an S3 Bucket named `jamango-frontend-production`.
2. Edit "Block Public Access" settings and turn off blocking.
3. In Bucket Properties, enable **Static Website Hosting**.
   * Index document: `index.html`
   * Error document: `index.html` (crucial for Single Page Application routing in React/Vite).
4. Apply the following Bucket Policy to allow public reads:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [{
           "Sid": "PublicReadGetObject",
           "Effect": "Allow",
           "Principal": "*",
           "Action": "s3:GetObject",
           "Resource": "arn:aws:s3:::jamango-frontend-production/*"
       }]
   }
   ```

### 4.2 CloudFront Distribution
1. Create a Distribution with the S3 bucket's website endpoint as the Origin Domain.
2. Under "Viewer Protocol Policy", select **Redirect HTTP to HTTPS**.
3. Under "Alternate Domain Names (CNAME)", enter your domain (e.g., `www.jamango.com`, `jamango.com`).
4. Attach the custom SSL certificate created in `us-east-1`.
5. Under "Error Pages", create a custom error response mapping `404` errors to `/index.html` with an HTTP `200` response code.

### 4.3 Build & Push the Code
In your local terminal (ensure `VITE_API_BASE_URL` points to your future backend domain, e.g., `https://api.jamango.com/api`):

```bash
cd jamango-direct
npm run build
aws s3 sync dist/ s3://jamango-frontend-production --delete
aws cloudfront create-invalidation --distribution-id <YOUR_DIST_ID> --paths "/*"
```

---

## 5. Backend Deployment (EC2 + Load Balancer)

### 5.1 Launch and Configure the Golden EC2 Instance
1. Launch an EC2 instance: `t3.small` or `t3.medium`, Ubuntu 24.04 image.
2. SSH into the server and install Node.js (v20), PM2, and Nginx.
3. Clone the repository into `/var/www/jamango-backend`.
4. Run `npm install --omit=dev`.

### 5.2 Set Production Environment Variables
Create `/var/www/jamango-backend/.env` containing real production keys:
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<PROD_USER>:<PASSWORD>@<ATLAS_URL>/jamango_db
JWT_SECRET=<STRONG_CRYPTOGRAPHIC_KEY>
RAZORPAY_KEY_ID=<PROD_LIVE_KEY>
RAZORPAY_KEY_SECRET=<PROD_LIVE_SECRET>
AWS_S3_BUCKET_NAME=<MEDIA_UPLOAD_BUCKET_NAME>
AWS_REGION=<YOUR_REGION>
AWS_ACCESS_KEY_ID=<IAM_USER_ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<IAM_USER_SECRET_KEY>
```

### 5.3 Configure Nginx Reverse Proxy
Edit `/etc/nginx/sites-available/default`:
```nginx
server {
    listen 80;
    server_name api.jamango.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Ensures multer-s3 and node receive correct protocol identifiers
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Restart Nginx: `sudo systemctl restart nginx`
Start Backend: `pm2 start server.js --name "jamango-api" && pm2 save && pm2 startup`

### 5.4 Application Load Balancer Setup (ALB)
1. In EC2 Console, navigate to Load Balancers -> Create Application Load Balancer.
2. Configure listeners: Port 80 (Redirect to 443) and Port 443 (HTTPS).
3. Attach your regional ACM certificate to the HTTPS listener.
4. Route traffic to a Target Group containing your Golden EC2 instance (Port 80).

---

## 6. Route 53 Finalization
1. Go to Route 53.
2. Create an **A Record** for the root domain (`jamango.com`) -> Alias to CloudFront Distribution.
3. Create an **A Record** for `api.jamango.com` -> Alias to the Application Load Balancer.

## 7. Media & Product Photography S3 Config
Since your codebase has AWS SDK integration, create the media bucket:
1. Create a Bucket: `jamango-production-media`.
2. Disable "Block all public access" and map a generous Bucket Policy to allow public `s3:GetObject` on the bucket contents so customers can see product images.
3. Ensure the IAM user mapped to your backend `.env` file has the `AmazonS3FullAccess` or a strict inline policy specifically mapped to the `jamango-production-media` bucket.

### Your production system is now highly available, SSL-secured, logically segmented, and completely detached from localhost constraints.
