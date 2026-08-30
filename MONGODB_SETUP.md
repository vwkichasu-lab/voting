# MongoDB Atlas Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Start Free"**
3. Create an account (use your email)
4. Click **"Create"** for free shared cluster

### Step 2: Create a Database
1. In MongoDB Atlas dashboard, click **"Create Deployment"**
2. Choose **"M0 Free"** tier (always free)
3. Cloud Provider: **AWS**
4. Region: Choose closest to your users (or **N. Virginia** for US)
5. Click **"Create Deployment"**
6. Wait 2-3 minutes for setup

### Step 3: Create Database User
1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. **Username:** `votingadmin`
4. **Password:** Create a strong password and copy it
5. Database User Privileges: **Read and write to any database**
6. Click **"Add User"**

### Step 4: Add IP Whitelist
1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

**⚠️ Note:** For production, use specific IPs instead.

### Step 5: Get Connection String
1. Go to **"Databases"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Drivers"** → **"Node.js"**
4. Copy the connection string
5. Replace:
   - `<password>` with your database user password
   - `myFirstDatabase` with `voting-system`

**Example:**
```
mongodb+srv://votingadmin:YourPassword@cluster0.xxxxx.mongodb.net/voting-system?retryWrites=true&w=majority
```

## 🔧 Add to Vercel/Netlify

### For Vercel:
1. Go to your Vercel project settings
2. Click **"Environment Variables"**
3. Add new variable:
   - **Name:** `MONGODB_URI`
   - **Value:** Your connection string (paste from Step 5)
4. Click **"Save"**
5. **Redeploy** your project

### For Netlify:
1. Go to your Netlify site settings
2. Click **"Build & deploy"** → **"Environment"**
3. Click **"Edit variables"**
4. Add new variable:
   - **Key:** `MONGODB_URI`
   - **Value:** Your connection string
5. Click **"Save"**
6. Trigger a new build (push to GitHub or click "Trigger deploy")

## 📱 Test Connection
After deployment, visit: `https://your-site.vercel.app/api/health`

Should return:
```json
{
  "status": "ok",
  "time": "2026-08-30T...",
  "environment": "vercel-function"
}
```

## 🎯 Data Persistence
✅ **Votes are now permanent** - stored in MongoDB Atlas  
✅ **Survives redeploys** - data persists indefinitely  
✅ **Free forever** - M0 tier is always free (512MB storage)  
✅ **Secure** - encrypted connection with authentication  

## 💾 View Your Data
1. In MongoDB Atlas, click **"Browse Collections"**
2. See all your votes, students, elections in real-time
3. Manual data management available

## 🆘 Troubleshooting

### Connection refused?
- Check IP whitelist (should be 0.0.0.0/0)
- Verify password is correct (special chars must be URL-encoded)
- Wait 2-3 minutes for Network Access to propagate

### Still using JSON database?
- Check Vercel/Netlify logs for MongoDB connection errors
- Verify `MONGODB_URI` environment variable is set
- Check database password doesn't have special characters that need encoding

### Connection timeout?
- Check cluster is running (M0 tier sleeps after 60 days of inactivity)
- Verify network connection is stable
- Check firewall allows MongoDB Atlas connections

## 📊 MongoDB Atlas Free Tier Limits
- **Storage:** 512 MB
- **Connections:** Up to 3 concurrent connections per cluster
- **For your voting system:** Plenty of space (can store 100,000+ votes)

## 🎓 Learning More
- MongoDB docs: https://docs.mongodb.com
- Mongoose docs: https://mongoosejs.com/docs
- MongoDB Atlas docs: https://docs.atlas.mongodb.com
