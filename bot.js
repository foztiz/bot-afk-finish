const mineflayer = require('mineflayer');
const { PersistentAuth } = require('./persistent-auth');

class MinecraftBot {
  constructor(callbacks = {}) {
    this.bot = null;
    this.callbacks = callbacks;
    this.isAFK = false;
    this.lastMovement = Date.now();
    this.movementInterval = null;
    this.chatResponses = [
      "I'm AFK right now",
      "Currently away from keyboard",
      "AFK - will be back later",
      "Away at the moment",
      "Not here right now"
    ];
  }

  async connect() {
    try {
      // Authenticate with Microsoft using persistent auth
      const authData = await PersistentAuth.authenticate();
      
      console.log(`Authenticated as ${authData.username}`);

      // Get server configuration
      const serverHost = process.env.MINECRAFT_SERVER;
      const serverPort = parseInt(process.env.MINECRAFT_PORT || '25565');
      
      if (!serverHost) {
        throw new Error('MINECRAFT_SERVER environment variable is required');
      }

      console.log(`Connecting to ${serverHost}:${serverPort}...`);

      // Create bot instance
      this.bot = mineflayer.createBot({
        host: serverHost,
        port: serverPort,
        username: authData.username,
        auth: 'microsoft',
        accessToken: authData.accessToken,
        clientToken: authData.clientToken,
        version: '1.20.1', // Use stable version that works with most servers
        keepAlive: true,
        checkTimeoutInterval: 30000, // 30 seconds
        hideErrors: false
      });

      this.setupEventHandlers();
      
      return this.bot;

    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }

  setupEventHandlers() {
    // Connection events
    this.bot.on('login', () => {
      console.log(`✓ Bot logged in as ${this.bot.username}`);
      this.callbacks.onConnect?.();
      this.startAFKBehavior();
    });

    this.bot.on('spawn', () => {
      console.log('✓ Bot spawned in world');
      this.callbacks.onActivity?.('Spawned in world');
    });

    this.bot.on('end', (reason) => {
      console.log(`✗ Bot disconnected: ${reason}`);
      this.stopAFKBehavior();
      this.callbacks.onDisconnect?.(reason);
    });

    this.bot.on('kicked', (reason) => {
      console.log(`✗ Bot was kicked: ${reason}`);
      this.callbacks.onDisconnect?.(`Kicked: ${reason}`);
    });

    this.bot.on('error', (err) => {
      console.error('✗ Bot error:', err);
      this.callbacks.onError?.(err);
    });

    // Chat events
    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return;
      
      console.log(`<${username}> ${message}`);
      this.callbacks.onActivity?.(`Chat: <${username}> ${message}`);
      
      // Respond to mentions or direct messages
      if (message.toLowerCase().includes(this.bot.username.toLowerCase()) || 
          message.toLowerCase().includes('afk') ||
          message.toLowerCase().startsWith('!')) {
        this.respondToChat(username, message);
      }
    });

    // Health and food monitoring
    this.bot.on('health', () => {
      const health = this.bot.health;
      const food = this.bot.food;
      
      if (health <= 10 || food <= 10) {
        console.log(`⚠️ Low health (${health}) or food (${food})`);
      }
      
      // If health is critical, try to eat
      if (food <= 5) {
        this.tryToEat();
      }
    });

    // Health monitoring
    this.bot.on('health', () => {
      if (this.bot.health <= 5) {
        console.warn(`⚠ Low health: ${this.bot.health}/20`);
        this.callbacks.onActivity?.(`Low health: ${this.bot.health}/20`);
      }
    });

    // Death event
    this.bot.on('death', () => {
      console.log('☠ Bot died, respawning...');
      this.callbacks.onActivity?.('Died and respawning');
      this.bot.respawn();
    });

    // Time events for periodic activities
    this.bot.on('time', () => {
      // Perform periodic AFK actions every 5 minutes
      const now = Date.now();
      if (now - this.lastMovement > 300000) { // 5 minutes
        this.performAFKAction();
        this.lastMovement = now;
      }
    });
  }

  startAFKBehavior() {
    console.log('🎯 Starting AFK behavior...');
    this.isAFK = true;

    // Movement interval to prevent being kicked for inactivity
    this.movementInterval = setInterval(() => {
      this.performAFKAction();
    }, 60000); // Every minute

    // Look around occasionally
    setInterval(() => {
      if (this.bot && this.isAFK) {
        const yaw = Math.random() * Math.PI * 2;
        const pitch = (Math.random() - 0.5) * Math.PI * 0.5;
        this.bot.look(yaw, pitch);
        this.callbacks.onActivity?.('Looking around');
      }
    }, 30000); // Every 30 seconds
  }

  stopAFKBehavior() {
    console.log('⏹ Stopping AFK behavior...');
    this.isAFK = false;
    
    if (this.movementInterval) {
      clearInterval(this.movementInterval);
      this.movementInterval = null;
    }
  }

  performAFKAction() {
    if (!this.bot || !this.isAFK) return;

    try {
      const actions = [
        () => {
          // Small movement to prevent AFK kick
          const x = (Math.random() - 0.5) * 2;
          const z = (Math.random() - 0.5) * 2;
          this.bot.setControlState('forward', true);
          setTimeout(() => this.bot.setControlState('forward', false), 100);
          this.callbacks.onActivity?.('Performed anti-AFK movement');
        },
        () => {
          // Jump occasionally
          this.bot.setControlState('jump', true);
          setTimeout(() => this.bot.setControlState('jump', false), 100);
          this.callbacks.onActivity?.('Jumped to stay active');
        },
        () => {
          // Sneak briefly
          this.bot.setControlState('sneak', true);
          setTimeout(() => this.bot.setControlState('sneak', false), 500);
          this.callbacks.onActivity?.('Sneaked briefly');
        },
        () => {
          // Open inventory occasionally
          if (this.bot.currentWindow === null) {
            this.bot.openInventory();
            setTimeout(() => {
              if (this.bot.currentWindow) {
                this.bot.closeWindow(this.bot.currentWindow);
              }
            }, 1000);
            this.callbacks.onActivity?.('Checked inventory');
          }
        }
      ];

      // Randomly select an action
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      randomAction();

    } catch (error) {
      console.warn('Error performing AFK action:', error.message);
    }
  }

  respondToChat(username, message) {
    try {
      // Don't respond too frequently
      const now = Date.now();
      if (this.lastChatResponse && now - this.lastChatResponse < 10000) {
        return; // Wait at least 10 seconds between responses
      }

      let response = null;

      // Specific responses
      if (message.toLowerCase().includes('afk')) {
        response = this.chatResponses[Math.floor(Math.random() * this.chatResponses.length)];
      } else if (message.toLowerCase().includes('status') || message.toLowerCase().includes('!status')) {
        const uptime = Math.floor((Date.now() - this.lastMovement) / 60000);
        response = `I've been AFK for ${uptime} minutes`;
      } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('!help')) {
        response = 'I am an AFK bot. Commands: !status, !time';
      } else if (message.toLowerCase().includes('time') || message.toLowerCase().includes('!time')) {
        response = `Current time: ${new Date().toLocaleTimeString()}`;
      } else if (message.toLowerCase().includes(this.bot.username.toLowerCase())) {
        response = `Hi ${username}! I'm currently AFK.`;
      }

      if (response) {
        setTimeout(() => {
          this.bot.chat(response);
          console.log(`Responded to ${username}: ${response}`);
          this.callbacks.onActivity?.(`Responded to ${username}`);
          this.lastChatResponse = now;
        }, 1000 + Math.random() * 2000); // 1-3 second delay
      }

    } catch (error) {
      console.warn('Error responding to chat:', error.message);
    }
  }

  quit(reason = 'Bot disconnecting') {
    if (this.bot) {
      console.log(`Disconnecting bot: ${reason}`);
      this.stopAFKBehavior();
      this.bot.quit(reason);
      this.bot = null;
    }
  }
}

async function createBot(callbacks = {}) {
  const botInstance = new MinecraftBot(callbacks);
  await botInstance.connect();
  return botInstance;
}

module.exports = { createBot, MinecraftBot };
