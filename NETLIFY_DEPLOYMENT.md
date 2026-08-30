# Netlify Deployment Guide

## Admin Login Credentials

**Email:** `admin@level200.local`  
**Password:** `Admin@123456`

## Quick Deployment Steps

### Prerequisites
- GitHub account (already configured ✓)
- Netlify account (free at https://netlify.com)

### Step 1: Connect Repository to Netlify
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub account (if not already done)
4. Select the `voting` repository
5. Click "Deploy site"

### Step 2: Configure Build Settings
Netlify will auto-detect settings from `netlify.toml`:
- **Build Command:** `npm run build --prefix frontend`
- **Publish Directory:** `frontend/dist`
- **Node Version:** 18

### Step 3: Environment Variables (Optional)
Go to Site settings → Environment and add:
```
REACT_APP_API_BASE_URL=https://your-netlify-site.netlify.app/api
```

### Step 4: Deploy
Click "Deploy" and wait for the build to complete (~2-3 minutes).

## Your Deployment URL

After deployment, your site will be available at:
```
https://your-voting-site.netlify.app
```

### Custom Domain
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain and follow the steps

## Access Points

- **Student Portal:** https://your-voting-site.netlify.app
- **Admin Portal:** https://your-voting-site.netlify.app/admin

## Important Notes

⚠️ **Database Limitation:** Same as Vercel - JSON database won't persist on Netlify.

For production, migrate to:
- **MongoDB Atlas** (free tier)
- **Firebase Realtime Database**
- **Supabase PostgreSQL**
- **AWS DynamoDB**

## Advantages of Netlify

✅ Git-based deployments (automatic on push)  
✅ Free SSL/TLS certificate  
✅ Netlify Functions for serverless backend  
✅ Built-in form handling  
✅ Split testing capabilities  
✅ Global CDN  

## Need Help?

- Netlify Docs: https://docs.netlify.com
- GitHub Repository: https://github.com/vwkichasu-lab/voting
