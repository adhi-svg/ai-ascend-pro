# 🔐 FYXION — AWS Credentials Setup Guide

This guide describes the exact steps required to obtain and configure your AWS credentials for the FYXION platform.

---

## 1. Create an IAM User (Authentication)
This user provides the "keys" that allow your backend to talk to AWS.

1.  Log in to the [AWS IAM Console](https://console.aws.amazon.com/iam/).
2.  Go to **Users** → **Create user**.
3.  **User name**: `fyxion-api-user`
4.  Click **Next**.
5.  Select **Attach policies directly**.
6.  Search for and check these three policies:
    *   `AmazonS3FullAccess`
    *   `AmazonSNSFullAccess`
    *   `AmazonRDSFullAccess` (If using RDS Database)
7.  Click **Next** → **Create user**.

---

## 2. Generate Access Keys
1.  Click on the user you just created (`fyxion-api-user`).
2.  Go to the **Security credentials** tab.
3.  Scroll down to **Access keys** and click **Create access key**.
4.  Select **Application running outside AWS**.
5.  Click **Next** → **Create access key**.
6.  **⚠️ IMPORTANT**: Copy your **Access Key ID** and **Secret Access Key** immediately. You will not be able to see the Secret Key again.

---

## 3. Configure File Storage (S3)
1.  Go to the [S3 Console](https://s3.console.aws.amazon.com/s3/).
2.  Click **Create bucket**.
3.  **Bucket name**: `fyxion-uploads-[your-name]` (must be unique).
4.  **Region**: Select the one closest to you (e.g., `ap-south-1` for Mumbai).
5.  **Object Ownership**: ACLs enabled (recommended for simple public access).
6.  **Block Public Access**: **Uncheck** "Block all public access" (so users can view uploaded document photos).
7.  Click **Create bucket**.

---

## 4. Configure Notifications (SNS)
1.  Go to the [SNS Console](https://console.aws.amazon.com/sns/v3/home).
2.  Click **Topics** → **Create topic**.
3.  Select **Standard**.
4.  **Name**: `fyxion-alerts`
5.  Click **Create topic**.
6.  Copy the **ARN** (e.g., `arn:aws:sns:ap-south-1:1234567890:fyxion-alerts`).
7.  *(Optional)* Create a **Subscription** with "Email" protocol to receive alerts in your inbox.

---

## 5. Update Your `.env`
Open `backend/.env` and fill in the values you collected:

```env
# AWS Core Credentials
AWS_ACCESS_KEY_ID=AKIA... (Paste your Access Key ID)
AWS_SECRET_ACCESS_KEY=... (Paste your Secret Access Key)
AWS_REGION=ap-south-1 (Or your chosen region)

# AWS S3 (Storage)
AWS_S3_BUCKET_NAME=fyxion-uploads-[your-name]
ENABLE_S3_UPLOAD=True

# AWS SNS (Alerts)
AWS_SNS_TOPIC_ARN=arn:aws:sns:ap-south-1:...
ENABLE_SNS_ALERTS=True
```

---

## 6. Verification
Restart your backend. If everything is correct, you will see:
`[CONFIG] AWS S3 enabled: True`
`[CONFIG] AWS SNS enabled: True`

✅ **You are now ready to handle production-grade uploads and alerts!**
