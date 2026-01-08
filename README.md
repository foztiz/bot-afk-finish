# Minecraft AFK Bot for Replit

A 24/7 Minecraft AFK bot using Mineflayer with Microsoft authentication, designed to run continuously on Replit.

## Features

- 🔐 **Microsoft Authentication**: Secure login using refresh tokens
- 🤖 **AFK Behavior**: Anti-kick measures with random movements and chat
- 🔄 **Auto-Reconnect**: Automatically reconnects if disconnected
- 📊 **Status Monitoring**: Web interface to check bot status
- 🛡️ **Error Handling**: Comprehensive error handling and logging
- ⚡ **24/7 Uptime**: Keep-alive mechanism for continuous operation

## Quick Start

1. **Fork this Repl** or create a new Node.js Repl and copy the files

2. **Set up Secrets** in Replit:
   - `MINECRAFT_REFRESH_TOKEN`: Your Microsoft refresh token (see setup guide)
   - `MINECRAFT_SERVER_HOST`: Server address (default: donutsmp.net)
   - `MINECRAFT_SERVER_PORT`: Server port (default: 25565)

3. **Install Dependencies** (if not auto-installed):
   ```bash
   npm install mineflayer prismarine-auth dotenv express
   ```

4. **Run the Bot**:
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MINECRAFT_REFRESH_TOKEN` | ✅ | - | Microsoft refresh token for authentication |
| `MINECRAFT_SERVER_HOST` | ❌ | `donutsmp.net` | Minecraft server hostname |
| `MINECRAFT_SERVER_PORT` | ❌ | `25565` | Minecraft server port |
| `MINECRAFT_VERSION` | ❌ | `auto` | Minecraft version (auto-detect) |

## Monitoring

- **Status Page**: Visit your Repl URL to see bot status
- **Logs**: Check the console for detailed logging
- **Health Check**: `/status` endpoint shows detailed bot information

## AFK Behaviors

The bot performs various anti-AFK actions:

- 🎯 **Random Looking**: Looks around randomly
- 🚶 **Slight Movement**: Small movements in random directions  
- 🦘 **Random Jumping**: Occasional jumps
- 💬 **Chat Messages**: Sends AFK messages every 10-15 minutes
- 🤏 **Arm Swinging**: Swings arm to show activity

## Reconnection Logic

- Automatic reconnection with exponential backoff
- Maximum 10 reconnection attempts
- Handles session expiration and token refresh
- Graceful error recovery

## Security

- Refresh tokens stored securely in Replit Secrets
- No hardcoded credentials in source code
- Session management and token caching
- Safe error handling without credential exposure

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Ensure `MINECRAFT_REFRESH_TOKEN` is set correctly
   - Token may have expired - generate a new one
   - Check Microsoft account has Minecraft Java Edition

2. **Connection Timeout**
   - Verify server address and port
   - Check if server is online
   - Ensure your IP isn't banned

3. **Bot Kicked/Banned**
   - Server may have anti-bot measures
   - Contact server admins if legitimate use
   - Adjust AFK behavior timing

### Getting Help

- Check the console logs for detailed error messages
- Visit the status page for real-time bot information
- See `setup-guide.md` for detailed setup instructions

## Files Structure

