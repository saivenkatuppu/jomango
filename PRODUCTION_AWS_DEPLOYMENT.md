# JAMANGO - AWS Production Deployment Runbook

This is the definitive, step-by-step guide to deploying the JAMANGO Full-Stack application onto AWS. 

By the end of this guide, your system will be running on a decouple architecture:
1. **Database:** MongoDB Atlas (Cloud Database)
2. **Backend Engine:** AWS EC2 Server (Ubuntu) + PM2 + Nginx
3. **Frontend Application:** AWS S3 (Global Static Website)
4. **Media Storage:** AWS S3 (For Product Images)

---

## Part 1: Initial Setup (Database & Storage)

### 1. Configure MongoDB Atlas (The Database)
Do not install MongoDB on your EC2 server. Use MongoDB Atlas.
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an **M10 Dedicated Cluster** in your preferred AWS Region (e.g., `ap-south-1`). *A free `M0` cluster works for testing, but `M10` is required for production.*
2. Under **Database Access**, create a new database user (e.g., `jamango_admin`) with a secure password.
3. Under **Network Access**, click **Add IP Address** and select **Allow Access From Anywhere** (`0.0.0.0/0`).
4. Click **Connect -> Drivers -> Node.js** and copy your Connection String. Save this string securely.

### 2. Configure AWS S3 (Media & Image Uploads)
1. Go to your **AWS Console** and open **S3**.
2. Click **Create bucket**. Name it exactly: `jamango-product-images-production`.
3. Uncheck **Block all public access** and acknowledge the warning. Click **Create**.
4. Click the newly created bucket, go to **Permissions**, scroll to **Bucket policy**, and click **Edit**. Paste this policy exactly (change the bucket name if you didn't use `jamango-product-images-production`):
```json
{
    "Version": "2012-10-17",
    "Statement": [{
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::jamango-product-images-production/*"
    }]
}
```
5. Save the policy.

### 3. Generate AWS Access Keys (For Backend Image Uploads)
1. In the AWS Console, search for **IAM**.
2. Go to **Users** -> **Create user**. Name it `jamango-backend-service`. Click Next.
3. Select **Attach policies directly**. Search for and check `AmazonS3FullAccess`. Click Next -> Create User.
4. Click the user you just created. Click the **Security credentials** tab.
5. Scroll down to **Access keys** -> **Create access key**.
6. Select **Application running outside AWS** -> Click Next -> Create.
7. **DO NOT CLOSE THIS WINDOW YET.** Copy the `Access key ID` and `Secret access key` to a safe place. You need them for the backend `.env` file.

---

## Part 2: Backend Deployment (AWS EC2 Server)

### 1. Launch the Server
1. Go to AWS **EC2** and click **Launch Instance**.
2. **Name**: `Jamango-Backend-Core`
3. **OS**: Select **Ubuntu 24.04 LTS**.
4. **Instance Type**: Select `t3.small` (Production) or `t2.micro` (Testing).
5. **Key Pair**: Create a new key pair (e.g., `jamango-server.pem`). Download and keep it safe.
6. **Network Settings**: Check BOTH **Allow HTTP traffic from the internet** and **Allow HTTPS traffic from the internet**.
7. Click **Launch Instance**. Copy your server's Public IPv4 Address (e.g., `13.123.45.67`).

### 2. Connect to the Server
Open your laptop's terminal or Command Prompt. Navigate to where you saved your `.pem` key and type:
```bash
ssh -i "jamango-server.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```
*Note: Type `yes` if prompted about host authenticity.*

### 3. Install Server Dependencies
Copy and paste this exact block of code into the AWS terminal:
```bash
# Update the server architecture
sudo apt update && sudo apt upgrade -y

# Install Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx

# Install PM2 (Keeps the backend running forever)
sudo npm install -g pm2
```

### 4. Clone the Code Repository
```bash
# Move to the web directory
cd /var/www

# Clone the Jamango mono-repo from the new organization
sudo git clone https://github.com/CODE-FROM-SAI/jamango.git jamango
sudo chown -R ubuntu:ubuntu jamango

# Enter the backend directory and install packages
cd jamango/jamango-backend
npm install --omit=dev
```

### 5. Configure the Backend `.env` File
Run this command to create and open the configuration file:
```bash
nano .env
```
Paste this exact block and fill in your specific private keys:
```env
NODE_ENV=production
PORT=5000

# Copy from MongoDB Atlas (Part 1, Step 1)
MONGO_URI=mongodb+srv://jamango_admin:YOUR_PASSWORD@your-cluster.mongodb.net/jamango_db

# Make this a long, random, secure password
JWT_SECRET=production_jamango_jwt_secret_2026_xyz

# Razorpay Keys
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Amazon S3 Keys for Images (Part 1, Steps 2 & 3)
AWS_S3_BUCKET_NAME=jamango-product-images-production
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_iam_access_key
AWS_SECRET_ACCESS_KEY=your_iam_secret_key
```
*To save: Press `Ctrl + X`, then `Y`, then `Enter`.*

### 6. Start the Backend Engine
```bash
pm2 start server.js --name "jamango-api"
pm2 save
pm2 startup
```
*(The `startup` command will print one final `sudo env PATH...` command. Copy that printed command, paste it into the terminal, and hit Enter to ensure PM2 survives server reboots).*

### 7. Configure Nginx (Expose Backend to the Internet)
We must route standard web traffic (Port 80) into your Node proxy (Port 5000).
```bash
sudo nano /etc/nginx/sites-available/default
```
Delete everything inside that file. Paste this:
```nginx
server {
    listen 80;
    server_name _; 

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
*Save with `Ctrl + X`, then `Y`, then `Enter`.*

Restart Nginx to apply the routing:
```bash
sudo systemctl restart nginx
```
**Backend Deployment Complete!** To verify, open a browser and type `http://YOUR_EC2_PUBLIC_IP`. You should see "JAMANGO API is running...".

---

## Part 3: Frontend Deployment (AWS S3)

We compile the React frontend into highly-optimized static files and host them directly on AWS S3 for maximum global performance. 

### 1. Prepare Frontend S3 Bucket
1. Go to AWS **S3** and create a bucket named `jamango-website-frontend`.
2. Uncheck **Block all public access**.
3. Go to the bucket's **Properties** tab. Scroll to the bottom to **Static website hosting** and click **Edit**.
4. Click **Enable**. For both **Index document** and **Error document**, type `index.html`. Save.
5. Go to the **Permissions** tab. Edit the **Bucket policy**. Paste this code (replace bucket name if needed):
```json
{
    "Version": "2012-10-17",
    "Statement": [{
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::jamango-website-frontend/*"
    }]
}
```
6. Save the policy.

### 2. Build the Frontend (On your local laptop)
***Warning: Do not run this on the AWS EC2 server. Run this on your personal laptop.***

Open your local terminal/command prompt:
```bash
cd c:\jamangoversion1\jamango-direct

# Inform the frontend where the backend server lives (use your EC2 Public IP)
echo "VITE_API_BASE_URL=http://YOUR_EC2_PUBLIC_IP/api" > .env

# Compress and compile the production build
npm run build
```

### 3. Upload the Frontend to AWS
If you have the AWS CLI configured on your laptop, run:
```bash
aws s3 sync dist/ s3://jamango-website-frontend --delete
```
**Alternatively**, if you do not have the CLI installed:
1. Open your AWS S3 Console in the browser.
2. Open the `jamango-website-frontend` bucket.
3. Open a local file explorer to `C:\jamangoversion1\jamango-direct\dist`
4. Drag and drop **every file and folder** inside the `dist` folder into the AWS browser window.
5. Click **Upload**.

### 4. Verify Final Deployment
1. Stay in your frontend S3 bucket on AWS.
2. Click the **Properties** tab.
3. Scroll to the absolute bottom and click your **Bucket Website Endpoint URL**.

Your fully deployed, production-grade JAMANGO application will now load! The frontend is hosted globally via S3, and it is safely communicating with your EC2 Backend API!
