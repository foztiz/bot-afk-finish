# 🚀 Quick Setup: Keep Your Bot Running 24/7

## The Problem
When you close your web browser, Replit puts your project to sleep after 5 minutes. Your bot stops working even though your code is perfect.

## The Solution
Use UptimeRobot (free service) to automatically "ping" your project every 5 minutes. This keeps it awake 24/7, even when your PC is completely off.

## Step-by-Step Setup (5 minutes)

### Step 1: Get Your Project URL
Your Replit project URL is:
```
https://YOURPROJECTNAME.keylian219.repl.co
```
(Replace YOURPROJECTNAME with your actual project name - you can see it in the address bar)

### Step 2: Create UptimeRobot Account
1. Go to [UptimeRobot.com](https://uptimerobot.com)
2. Click "Sign Up" (it's free)
3. Verify your email

### Step 3: Add Your Bot Monitor
1. Click "Add New Monitor"
2. Fill in these details:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Minecraft AFK Bot
   - **URL**: `https://YOURPROJECTNAME.keylian219.repl.co/health`
   - **Monitoring Interval**: 5 minutes
3. Click "Create Monitor"

### Step 4: Test It Works
1. Visit `https://YOURPROJECTNAME.keylian219.repl.co/health` in your browser
2. You should see: `{"status":"Bot is running","uptime":123,"connected":true,"timestamp":"..."}`
3. If you see that, you're all set!

## ✅ What Happens Now

- UptimeRobot pings your bot every 5 minutes
- This keeps your Replit project awake 24/7
- Your Minecraft bot runs continuously
- Works even when your PC is off or browser is closed
- Completely free!

## 🔧 If Something Goes Wrong

**"Monitor shows Down":**
- Make sure your project name is correct in the URL
- Check that your bot is running (green play button in Replit)

**"Bot still stops:"**
- Wait 10 minutes after setting up UptimeRobot
- Make sure the monitor is actually "Up" in your UptimeRobot dashboard

**"Can't access /health URL:"**
- Make sure your Replit project is public
- Try the URL in your browser first

## 📊 Monitor Your Bot

You can check if everything is working:
- **UptimeRobot Dashboard**: Shows if your bot is "Up" or "Down"
- **Your Bot Dashboard**: Visit your main Replit URL to see bot status
- **Health Check**: Visit `/health` endpoint anytime to see current status

That's it! Your bot will now run 24/7 without you needing to keep your browser or PC on.