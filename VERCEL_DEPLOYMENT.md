# Vercel Deployment Guide

## Admin Login Credentials

**Email:** `admin@level200.local`  
**Password:** `Admin@123456`

## Quick Deployment Steps

### Prerequisites
- GitHub account (already configured ✓)
- Vercel account (free at https://vercel.com)

### Step 1: Connect Repository to Vercel
1. Go to https://vercel.com/new
2. Connect your GitHub account (if not already done)
3. Select the `voting` repository
4. Click "Import"

### Step 2: Configure Project Settings
1. **Framework Preset:** Select "Other" or "Vite"
2. **Root Directory:** Leave empty (auto-detected)
3. **Build Command:** `npm run build --prefix frontend`
4. **Output Directory:** `frontend/dist`
5. **Install Command:** `npm install --prefix backend && npm install --prefix frontend`

### Step 3: Environment Variables (Optional)
Add these if needed:
```
REACT_APP_API_BASE_URL=https://your-vercel-deployment.vercel.app/api
```

### Step 4: Deploy
Click "Deploy" and wait for the build to complete.

## Your Deployment URL

After deployment completes, your site will be available at:
```
https://voting-<random-id>.vercel.app
```

Access the voting system:
- **Student Portal:** https://voting-<random-id>.vercel.app
- **Admin Portal:** https://voting-<random-id>.vercel.app/admin

## Important Notes

⚠️ **Database Limitation:** This application currently uses a JSON-based database (backend/data/db.json) which is suitable for development but not ideal for production on Vercel because:
- Vercel's serverless functions have an ephemeral filesystem
- Data written to db.json will be lost on redeploy
- For production, consider migrating to:
  - MongoDB Atlas (free tier available)
  - Firebase Realtime Database
  - Supabase PostgreSQL
  - AWS DynamoDB

## Recommended Next Steps

1. Set up a production database
2. Update backend environment variables
3. Add SSL certificate (Vercel handles this automatically)
4. Configure custom domain if needed
5. Set up analytics and monitoring

## Need Help?

- Check Vercel documentation: https://vercel.com/docs
- GitHub repository: https://github.com/vwkichasu-lab/voting
- Review DEVELOPMENT.md for local setup details
