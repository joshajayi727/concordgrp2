# ⚡ ConcordGrp2 — Starter Edition (Project 2)

> A cloud-hosted browser game platform built on AWS as part of the Cloud & DevOps Capstone Project 2.  
> Deployed using Amazon S3, CloudFront (HTTPS via default CloudFront certificate), and monitored with CloudWatch.

![AWS](https://img.shields.io/badge/AWS-S3%20%2B%20CloudFront-orange?logo=amazon-aws)
![HTTPS](https://img.shields.io/badge/HTTPS-Enabled-green?logo=letsencrypt)
![Status](https://img.shields.io/badge/Status-Live-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🌐 Live URL

```
https://dscevtv8kkn9d.cloudfront.net/
```

> Replace with your actual CloudFront distribution URL after deployment.

---

## 📖 Project Overview

**ConcordGrp2studio Starter Edition** is the MVP (Minimum Viable Product) platform built for Concordgrp2 Studios — a fictional gaming startup. The platform allows users to:

- Open a website and play a browser-based **Reaction Timer** game
- Enter their nickname (callsign)
- View their reaction time score and personal rating
- See a live **leaderboard** of top scores

This project was built and deployed as part of a Cloud & DevOps Capstone assignment, demonstrating real-world cloud architecture using AWS services.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        USER BROWSER                     │
│                    https:// (HTTPS only)                 │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               AWS CloudFront (CDN + HTTPS)              │
│  • Global edge delivery                                  │
│  • Default CloudFront SSL certificate (*.cloudfront.net)│
│  • Enforces HTTPS (HTTP → HTTPS redirect)               │
│  • Caches static assets at edge locations               │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Amazon S3 (Static Hosting)             │
│  • index.html  — Game UI and layout                     │
│  • style.css   — Retro arcade styling                   │
│  • game.js     — Game logic and leaderboard             │
└────────────────────────────┬────────────────────────────┘
                             │ Access Logs
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Amazon CloudWatch (Monitoring)            │
│  • Request counts and error rates                       │
│  • CloudFront access logs stored in concordgrp2log      │
│  • Performance metrics dashboard                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ AWS Services Used

| Service | Purpose |
|---|---|
| **Amazon S3** | Hosts all static website files (HTML, CSS, JS) |
| **Amazon CloudFront** | CDN — delivers content globally with HTTPS using default CloudFront certificate |
| **Amazon CloudWatch** | Monitors traffic, errors, and performance logs |

> **Note:** This project uses the **default CloudFront SSL certificate** (`*.cloudfront.net`) instead of a custom ACM certificate. HTTPS is fully enforced without requiring a custom domain or ACM setup.

---

## 📁 Project Structure

```
concordgrp2/
├── index.html        # Main game page and layout
├── style.css         # Retro neon arcade theme and animations
├── game.js           # Reaction timer logic, scoring, leaderboard
└── README.md         # Project documentation (this file)
```

---

## 🎮 Game Features

- **Reaction Timer** — Measures how fast you click when the signal appears
- **Random delay** — Signal fires between 1.5s and 5s to prevent cheating
- **Early-click penalty** — Clicking before the signal resets the round
- **5-tier rating system:**

| Rating | Time | Label |
|---|---|---|
| 🥇 God Mode | < 150ms | Impossible. Are you human? |
| ⚡ Elite | < 200ms | Elite reflexes |
| ✅ Sharp | < 280ms | Sharp reaction |
| 🟡 Average | < 380ms | Keep training |
| 🔴 Slow | 380ms+ | Try again |

- **Leaderboard** — Top 8 scores saved locally with medal rankings
- **Stats panel** — Tracks personal best, average, and total plays
- **Persistent storage** — Scores saved via `localStorage` across sessions

---

## 🚀 Deployment Guide

### Prerequisites
- An AWS account
- All 3 files: `index.html`, `style.css`, `game.js`

---

### Step 1 — Upload Files to GitHub Repository

The project files were manually uploaded to the GitHub repository **concordgrp2** using the GitHub web interface:

1. Go to **https://github.com** and open the `concordgrp2` repository
2. Click **"Add file" → "Upload files"**
3. Drag and drop or select the following files:
   - `index.html`
   - `style.css`
   - `game.js`
   - `README.md`
4. Add a commit message: `Initial concordgrp2 build`
5. Click **"Commit changes"**

> Make sure the repository is set to **Public** so assessors can view it.

---

### Step 2 — Create an S3 Bucket

1. Go to **AWS Console → S3 → Create Bucket**
2. Name: `concordgrp2` (or unique variant)
3. Uncheck **"Block all public access"** and acknowledge the warning
4. Enable **Static Website Hosting** under the Properties tab
5. Set **Index document** to `index.html`
6. Apply this bucket policy under the Permissions tab (replace `YOUR_BUCKET_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

7. Upload `index.html`, `style.css`, and `game.js` to the bucket root

---

### Step 3 — Create a CloudFront Distribution

1. Go to **CloudFront → Create Distribution**
2. **Origin domain** — select your S3 bucket from the dropdown
3. **Viewer Protocol Policy** → `Redirect HTTP to HTTPS`
4. **Default root object** → `index.html`
5. **SSL Certificate** → Use the **default CloudFront certificate** (`*.cloudfront.net`) — no ACM setup required
6. Click **Create Distribution**
7. Wait **10–15 minutes** for status: **Deployed ✅**
8. Copy the **Distribution Domain Name** — this is your live HTTPS URL

---

### Step 4 — Enable CloudWatch Logging

1. Open your CloudFront distribution → **Edit**
2. Under **Standard logging**, enable it
3. Choose or create a dedicated S3 logging bucket named `concordgrp2studio
4. Save changes
5. View metrics: **CloudWatch → Metrics → CloudFront**

---

## 🔒 Security Configuration

| Requirement | Implementation |
|---|---|
| HTTPS enforced | CloudFront: Redirect HTTP → HTTPS |
| SSL Certificate | Default CloudFront certificate (`*.cloudfront.net`) |
| No plain HTTP access | Viewer Protocol Policy set to Redirect HTTP to HTTPS |

---

## 🧪 Testing Evidence

### What Was Tested

| Test | Method | Result |
|---|---|---|
| Game loads over HTTPS | Open `https://` CloudFront URL in browser | ✅ Padlock visible, no warnings |
| HTTPS certificate active | Click padlock → Certificate details | ✅ Issued by Amazon for `*.cloudfront.net` |
| HTTP redirects to HTTPS | Open `http://` version of URL | ✅ Auto-redirects to HTTPS |
| Game functions correctly | Play multiple rounds | ✅ Scores recorded and ranked |
| Early click penalty | Click before signal fires | ✅ Round resets with error message |
| Leaderboard persistence | Refresh browser after scoring | ✅ Scores persist via localStorage |
| CloudWatch logging active | Check CloudWatch Metrics dashboard | ✅ Request count and error rate visible |
| Mobile responsiveness | Load on mobile device | ✅ Layout adapts correctly |

> 📸 Screenshots of the above tests are included in the `/screenshots` folder of this repository.

---

## 📋 Recommendations

### 🔐 Security Improvements
- Add **AWS WAF** (Web Application Firewall) in front of CloudFront to block malicious traffic and DDoS attacks
- Use **S3 Origin Access Control (OAC)** so the S3 bucket is never directly public — all traffic must flow through CloudFront
- Enable **S3 Versioning** and **MFA Delete** to protect against accidental file deletion

### ⚡ Performance Improvements
- Enable **CloudFront caching rules** with appropriate TTL values for static assets
- Enable **Gzip/Brotli compression** on CSS and JS files — reduces transfer size by up to 70%
- Set long-lived **Cache-Control headers** on S3 objects (e.g. `max-age=31536000` for versioned files)

### 💰 Cost Reduction
- Set **CloudFront Price Class** to `PriceClass_100` (North America + Europe only) to reduce edge costs if global delivery is not required
- Enable **S3 Intelligent-Tiering** on the `concordgrp2log` logging bucket to automatically reduce storage costs for infrequently accessed logs
- Configure **AWS Budgets** alerts to avoid unexpected charges

### 🔮 Future Features
- **Persistent leaderboard** — Replace `localStorage` with **AWS Lambda + API Gateway + DynamoDB** for a real server-side global leaderboard
- **User authentication** — Add **Amazon Cognito** for user accounts and personal score history
- **CI/CD Pipeline** — Add **GitHub Actions** to automatically deploy changes to S3 on every `git push`
- **Custom domain** — Register a domain via **Route 53** and attach a custom ACM certificate to the CloudFront distribution

---

## ✅ Final Deliverables Checklist

- [ ] `index.html`, `style.css`, `game.js` — game files uploaded to S3
- [ ] GitHub repository (public, with README)
- [ ] Live HTTPS URL (`https://d1234abc.cloudfront.net`)
- [ ] Architecture diagram (S3 → CloudFront → CloudWatch)
- [ ] Screenshot: game working in browser with `https://` in URL bar
- [ ] Screenshot: CloudWatch metrics/logs dashboard
- [ ] Testing summary (short written paragraph)
- [ ] Recommendations document (1–2 pages on security/performance/cost/future)

---

## 👤 Author

Joshua Ajayi
Cloud & DevOps Capstone — Project 2  
Institution: Deepwave learning Career Accelerator
Date: 2026-03-15

---

## 📄 License

This project is licensed under the MIT License.
