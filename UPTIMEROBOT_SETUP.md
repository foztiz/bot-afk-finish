# UptimeRobot Setup Guide

This guide will help you set up UptimeRobot to keep your Minecraft AFK bot running 24/7 on Replit.

## What is UptimeRobot?

UptimeRobot is a free service that pings your website every few minutes. When it pings your Replit project, it keeps the project "awake" and prevents it from going to sleep due to inactivity.

## Step-by-Step Setup

### 1. Get Your Replit URL
1. Look at the address bar when viewing your project
2. Copy the URL (it should look like: `https://YOUR-PROJECT-NAME.YOUR-USERNAME.repl.co`)

### 2. Choose Your Monitoring Endpoint
Your bot now has two endpoints specifically for UptimeRobot:

- **`/health` (Recommended)**: Returns detailed bot status in JSON format
  - Example: `https://YOUR-PROJECT-NAME.YOUR-USERNAME.repl.co/health`
  - Shows if bot is connected, uptime, and timestamp

- **`/ping` (Simple)**: Returns just "Bot is running" message
  - Example: `https://YOUR-PROJECT-NAME.YOUR-USERNAME.repl.co/ping`
  - Basic text response for simple monitoring

### 3. Set Up UptimeRobot
1. Go to [UptimeRobot.com](https://uptimerobot.com)
2. Create a free account
3. Click "Add New Monitor"
4. Fill in the details:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Minecraft AFK Bot
   - **URL**: Your Replit URL + `/health` (e.g., `https://your-project.your-username.repl.co/health`)
   - **Monitoring Interval**: 5 minutes (recommended)
5. Click "Create Monitor"

### 4. Test Your Setup
1. Visit your `/health` endpoint in a browser to make sure it works
2. You should see something like:
   ```json
   {
     "status": "Bot is running",
     "uptime": 1234,
     "connected": true,
     "timestamp": "2025-08-08T19:35:00.000Z"
   }
   ```

### 5. Verify It's Working
- Check your UptimeRobot dashboard to see if the monitor shows "Up"
- Your bot should now stay alive 24/7!
- UptimeRobot will ping every 5 minutes to keep your project awake

## Troubleshooting

**Monitor shows "Down":**
- Make sure your Replit project is running
- Check that the URL is correct (including `/health` at the end)
- Try visiting the URL in your browser first

**Bot still goes to sleep:**
- Make sure UptimeRobot is actually pinging (check the logs)
- Try changing the interval to 3-4 minutes instead of 5

**Can't access the endpoint:**
- Make sure your Replit project is public or the URL is accessible
- Check that port 5000 is being used (this should happen automatically)

## What Happens Now

1. UptimeRobot pings your `/health` endpoint every 5 minutes
2. This keeps your Replit project active and prevents it from sleeping
3. Your Minecraft bot continues running 24/7
4. You can monitor both UptimeRobot and your bot's dashboard to see everything is working

Your bot is now set up for 24/7 operation!