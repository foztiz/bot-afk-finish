const mineflayer = require('mineflayer');
const express = require('express');
const path = require('path');

// ========================================
// WEB-CONTROLLED MINECRAFT AFK BOT
// ========================================
// This application provides a web interface to control a Minecraft AFK bot
// Frontend: HTML/CSS/JavaScript dashboard in /public/index.html
// Backend: Express.js API endpoints for bot management
// Bot Logic: Mineflayer-based Minecraft bot with auto-reconnection

// Global variables for bot management
let bot = null;
let botConfig = {
    serverIp: 'donutsmp.net',
    serverPort: 25565,
    mcVersion: '1.21.4',
    msEmail: 'emmmaguerem@gmail.com'
};

let botStatus = {
    connected: false,
    startTime: Date.now(),
    reconnectAttempts: 0,
    totalReconnects: 0,
    lastConnectionTime: null,
    lastError: null
};

// Store recent logs for the web interface (max 50 entries)
let botLogs = [];
const MAX_LOGS = 50;

// Bot control flags
let shouldReconnect = true;
let reconnectTimeout = null;

// Create Express app and configure middleware
const app = express();
const PORT = 3000;

// Middleware to parse JSON requests from frontend
app.use(express.json());

// Serve static files from public directory (frontend files)
app.use(express.static(path.join(__dirname, 'public')));

// ========================================
// API ENDPOINTS FOR FRONTEND COMMUNICATION
// ========================================

// GET / - Serve the main dashboard (HTML file)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET /api/status - Get current bot status for frontend
app.get('/api/status', (req, res) => {
    const uptime = Math.floor((Date.now() - botStatus.startTime) / 1000);
    res.json({
        connected: botStatus.connected,
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        reconnectAttempts: botStatus.reconnectAttempts,
        totalReconnects: botStatus.totalReconnects,
        lastConnection: botStatus.lastConnectionTime,
        lastError: botStatus.lastError,
        server: `${botConfig.serverIp}:${botConfig.serverPort}`,
        config: botConfig
    });
});

// POST /api/start - Start bot with configuration from frontend
app.post('/api/start', (req, res) => {
    try {
        // Update bot configuration from frontend form
        if (req.body.serverIp) botConfig.serverIp = req.body.serverIp;
        if (req.body.serverPort) botConfig.serverPort = req.body.serverPort;
        if (req.body.mcVersion) botConfig.mcVersion = req.body.mcVersion;
        if (req.body.msEmail) botConfig.msEmail = req.body.msEmail;
        
        // Stop any existing bot instance
        if (bot) {
            bot.quit('Restarting with new configuration');
            bot = null;
        }
        
        // Clear any pending reconnection
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
        
        // Enable reconnection and start bot
        shouldReconnect = true;
        botStatus.startTime = Date.now();
        botStatus.reconnectAttempts = 0;
        botStatus.totalReconnects = 0;
        
        logMessage('🎮 Starting bot with new configuration...');
        logMessage(`📋 Server: ${botConfig.serverIp}:${botConfig.serverPort}`);
        logMessage(`📋 Version: ${botConfig.mcVersion}`);
        logMessage(`📋 Account: ${botConfig.msEmail}`);
        
        createBot();
        
        res.json({ 
            success: true, 
            message: 'Bot started with new configuration',
            config: botConfig
        });
        
    } catch (error) {
        logMessage(`❌ Failed to start bot: ${error.message}`);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// POST /api/stop - Stop the bot
app.post('/api/stop', (req, res) => {
    try {
        shouldReconnect = false;
        
        // Clear any pending reconnection
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
        
        if (bot) {
            logMessage('🛑 Stopping bot by user request...');
            bot.quit('Stopped by user');
            bot = null;
        }
        
        botStatus.connected = false;
        logMessage('✅ Bot stopped successfully');
        
        res.json({ 
            success: true, 
            message: 'Bot stopped successfully' 
        });
        
    } catch (error) {
        logMessage(`❌ Failed to stop bot: ${error.message}`);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// GET /api/logs - Get recent bot logs for frontend display
app.get('/api/logs', (req, res) => {
    res.json({ logs: botLogs });
});

// POST /api/chat - Send a chat message through the bot
app.post('/api/chat', (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Message is required' 
            });
        }
        
        if (!bot || !botStatus.connected) {
            return res.status(400).json({ 
                success: false, 
                error: 'Bot is not connected to server' 
            });
        }
        
        // Send the message
        bot.chat(message);
        logMessage(`💬 Sent chat message: ${message}`);
        
        res.json({ 
            success: true, 
            message: `Chat message sent: ${message}` 
        });
        
    } catch (error) {
        logMessage(`❌ Failed to send chat message: ${error.message}`);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ========================================
// BOT MANAGEMENT FUNCTIONS
// ========================================

/**
 * Add a log message to the bot logs array
 * Maintains a maximum number of log entries for the web interface
 */
function logMessage(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    
    // Add to logs array
    botLogs.push(logEntry);
    
    // Keep only the most recent logs
    if (botLogs.length > MAX_LOGS) {
        botLogs.shift();
    }
    
    // Also log to console for server-side debugging
    console.log(logEntry);
}

/**
 * Main function to create and configure the Minecraft bot
 * This is where the mineflayer bot logic is located
 */
function createBot() {
    if (!shouldReconnect) return;
    
    logMessage('🤖 Creating new bot instance...');
    
    // Prepare bot options for mineflayer
    const botOptions = {
        host: botConfig.serverIp,
        port: botConfig.serverPort,
        version: botConfig.mcVersion,
        username: botConfig.msEmail,
        auth: 'microsoft'  // Always use Microsoft authentication
    };
    
    logMessage(`🔗 Connecting to ${botConfig.serverIp}:${botConfig.serverPort} as ${botConfig.msEmail}`);
    
    try {
        bot = mineflayer.createBot(botOptions);
    } catch (error) {
        logMessage(`❌ Error creating bot: ${error.message}`);
        botStatus.lastError = error.message;
        scheduleReconnect();
        return;
    }

    // ========================================
    // BOT EVENT HANDLERS
    // ========================================

    bot.on('login', () => {
        logMessage(`✅ Bot successfully logged in!`);
        logMessage(`👤 Username: ${bot.username}`);
        botStatus.connected = true;
        botStatus.lastConnectionTime = new Date().toISOString();
        botStatus.reconnectAttempts = 0;
        botStatus.lastError = null;
    });

    bot.on('spawn', () => {
        logMessage(`🌍 Bot spawned in the world!`);
        if (bot.entity && bot.entity.position) {
            const pos = bot.entity.position;
            logMessage(`📍 Position: ${Math.round(pos.x)}, ${Math.round(pos.y)}, ${Math.round(pos.z)}`);
        }
        
        // Start anti-AFK measures when spawned
        startAntiAFKMeasures();
    });

    bot.on('chat', (username, message) => {
        // Log all chat messages from players (but not our own)
        if (username === bot.username) return; // Don't log our own messages
        
        // Log all chat messages
        logMessage(`💬 <${username}> ${message}`);
    });

    bot.on('kicked', (reason) => {
        logMessage(`❌ Bot was kicked from server: ${reason}`);
        botStatus.connected = false;
        botStatus.lastError = `Kicked: ${reason}`;
        scheduleReconnect();
    });

    bot.on('error', (err) => {
        logMessage(`❌ Bot error: ${err.message}`);
        botStatus.connected = false;
        botStatus.lastError = err.message;
        
        // Handle specific errors with helpful information
        if (err.message.includes('ENOTFOUND')) {
            logMessage(`❌ Server not found. Check hostname: ${botConfig.serverIp}`);
        } else if (err.message.includes('ECONNREFUSED')) {
            logMessage(`❌ Connection refused. Check if server is running on port ${botConfig.serverPort}`);
        } else if (err.message.includes('Invalid credentials') || err.message.includes('authentication')) {
            logMessage(`❌ Authentication failed. Check Microsoft account credentials.`);
        }
        
        scheduleReconnect();
    });

    bot.on('end', () => {
        logMessage(`❌ Bot disconnected from server`);
        botStatus.connected = false;
        scheduleReconnect();
    });

    bot.on('health', () => {
        if (bot.health <= 0) {
            logMessage(`⚠️ Bot died! Health: ${bot.health}`);
        } else if (bot.health < 5) {
            logMessage(`⚠️ Bot health is low: ${bot.health}`);
        }
    });


}

/**
 * Start anti-AFK measures to prevent being kicked for inactivity
 * Implements subtle movements and actions to simulate player activity
 */
function startAntiAFKMeasures() {
    if (!bot || !botStatus.connected) return;
    
    logMessage('🎯 Starting anti-AFK measures...');
    
    // Subtle look around every 30 seconds
    const lookInterval = setInterval(() => {
        if (bot && botStatus.connected && bot.entity) {
            const yaw = Math.random() * Math.PI * 2;
            const pitch = (Math.random() - 0.5) * 0.5; // Small pitch variation
            bot.look(yaw, pitch);
        } else {
            clearInterval(lookInterval);
        }
    }, 30000);

    // Small jump every 2 minutes
    const jumpInterval = setInterval(() => {
        if (bot && botStatus.connected && bot.entity) {
            bot.setControlState('jump', true);
            setTimeout(() => {
                if (bot && botStatus.connected) {
                    bot.setControlState('jump', false);
                }
            }, 300);
        } else {
            clearInterval(jumpInterval);
        }
    }, 120000);

    // Slight movement every 5 minutes
    const moveInterval = setInterval(() => {
        if (bot && botStatus.connected && bot.entity) {
            // Move forward briefly, then back to return to position
            bot.setControlState('forward', true);
            setTimeout(() => {
                if (bot && botStatus.connected) {
                    bot.setControlState('forward', false);
                    bot.setControlState('back', true);
                    setTimeout(() => {
                        if (bot && botStatus.connected) {
                            bot.setControlState('back', false);
                        }
                    }, 200);
                }
            }, 200);
        } else {
            clearInterval(moveInterval);
        }
    }, 300000);

    // Send a chat message every 10 minutes to prevent AFK kick
    const chatMessages = [
        "Still here!",
        "AFK bot running",
        "Monitoring server",
        "Bot active",
        "Online and ready",
        "Keeping connection alive"
    ];
    
    const chatInterval = setInterval(() => {
        if (bot && botStatus.connected && bot.entity) {
            const message = chatMessages[Math.floor(Math.random() * chatMessages.length)];
            bot.chat(message);
            logMessage(`💬 Sent chat message: ${message}`);
        } else {
            clearInterval(chatInterval);
        }
    }, 600000); // 10 minutes

    logMessage('✅ Anti-AFK measures activated');
}

/**
 * Schedule bot reconnection with exponential backoff
 * Automatically attempts to reconnect when disconnected
 */
function scheduleReconnect() {
    if (!shouldReconnect) {
        logMessage('🚫 Reconnection disabled by user');
        return;
    }
    
    botStatus.reconnectAttempts++;
    botStatus.totalReconnects++;
    
    // Calculate delay with exponential backoff (max 60 seconds)
    const baseDelay = 5000; // 5 seconds
    const delay = Math.min(baseDelay * Math.pow(1.5, Math.min(botStatus.reconnectAttempts - 1, 8)), 60000);
    
    logMessage(`⏳ Scheduling reconnect attempt ${botStatus.reconnectAttempts} in ${delay / 1000} seconds...`);
    
    reconnectTimeout = setTimeout(() => {
        logMessage(`🔄 Attempting to reconnect... (Attempt ${botStatus.reconnectAttempts})`);
        createBot();
    }, delay);
}

// ========================================
// APPLICATION STARTUP AND ERROR HANDLING
// ========================================

// Graceful shutdown handling
process.on('SIGINT', () => {
    logMessage('🛑 Received shutdown signal. Disconnecting bot gracefully...');
    shouldReconnect = false;
    if (bot) {
        bot.quit('Application shutting down');
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    logMessage('🛑 Received termination signal. Disconnecting bot gracefully...');
    shouldReconnect = false;
    if (bot) {
        bot.quit('Application shutting down');
    }
    process.exit(0);
});

// Handle uncaught exceptions to prevent crashes
process.on('uncaughtException', (error) => {
    logMessage(`❌ Uncaught Exception: ${error.message}`);
    // Don't exit, try to continue running
});

process.on('unhandledRejection', (reason, promise) => {
    logMessage(`❌ Unhandled Rejection: ${reason}`);
    // Don't exit, try to continue running
});

// Start the HTTP server
app.listen(PORT, '0.0.0.0', () => {
    logMessage(`🌐 Web control panel started on port ${PORT}`);
    logMessage(`🔗 Dashboard URL: http://localhost:${PORT}`);
    logMessage(`📊 API Status: http://localhost:${PORT}/api/status`);
    logMessage(`🎮 Minecraft AFK Bot Web Controller Ready!`);
    logMessage(`📝 Use the web interface to configure and control your bot`);
});

// Initialize with current configuration but don't auto-start
// The bot will be started through the web interface
logMessage('🚀 AFK Bot Web Controller initialized!');
logMessage('💻 Open the web interface to start your bot');