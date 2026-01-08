# Overview

This is a Minecraft AFK (Away From Keyboard) bot built with Node.js that maintains a constant connection to Minecraft servers to prevent disconnection due to inactivity. The bot uses Microsoft authentication for secure login and includes anti-kick mechanisms through random movements and chat messages. It's designed to run 24/7 on Replit with comprehensive monitoring and auto-reconnection capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Bot Architecture
The system follows a modular architecture with separate concerns:

- **Bot Controller** (`bot.js`): Core Minecraft bot logic using Mineflayer library for server connection and game interactions
- **Authentication Module** (`auth.js`): Handles Microsoft OAuth2 authentication flow using prismarine-auth with token caching
- **Main Application** (`index.js`): Express.js web server providing status monitoring and health checks
- **Keep-Alive Service** (`keepalive.js`): Prevents Replit from sleeping by self-pinging and health monitoring

## Authentication Strategy
Uses Microsoft OAuth2 refresh token authentication rather than username/password for security. The authentication module implements:
- Token caching to file system for persistence
- Fallback token rotation from environment variables
- Error handling for expired tokens with automatic refresh

## AFK Behavior System
Implements multiple anti-kick strategies:
- Random movement patterns to simulate player activity
- Periodic chat messages from a predefined pool
- Health and food monitoring to prevent in-game death
- Configurable timing intervals to avoid detection

## Monitoring and Health Checks
Built-in web interface provides:
- Real-time bot connection status
- Player health and food levels
- Server uptime tracking
- Memory usage monitoring
- RESTful status endpoints for external monitoring

## UptimeRobot Integration (24/7 Operation)
The system includes dedicated endpoints for UptimeRobot monitoring:
- `/health` endpoint returns JSON status with bot connection state and uptime
- `/ping` endpoint returns simple "Bot is running" response
- Both endpoints keep Replit project active when pinged every 5 minutes
- Enables true 24/7 operation even when user's browser/PC is off
- Dashboard includes copy-paste UptimeRobot setup instructions

## Error Handling and Recovery
Robust error recovery mechanisms:
- Automatic reconnection with exponential backoff
- Maximum retry limits to prevent infinite loops
- Comprehensive logging for debugging
- Graceful handling of network failures and server kicks

# External Dependencies

## Minecraft Integration
- **Mineflayer**: Core Minecraft bot framework for server connection and game interaction
- **Prismarine-Auth**: Microsoft authentication library for secure login token management

## Web Framework
- **Express.js**: Lightweight web server for status monitoring and health check endpoints

## Authentication Services
- **Azure MSAL Node**: Microsoft Authentication Library for OAuth2 token handling
- **Microsoft Xbox Live**: Authentication backend for Minecraft account verification

## Environment Configuration
- **Dotenv**: Environment variable management for secure credential storage
- **Replit Secrets**: Secure storage for sensitive tokens and server configurations

## Server Requirements
- **Minecraft Java Edition Server**: Target server must support Microsoft-authenticated connections
- **Network Connectivity**: Stable internet connection required for 24/7 operation