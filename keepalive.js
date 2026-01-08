const http = require('http');

function setupKeepAlive() {
  const keepAliveUrl = process.env.REPLIT_URL;
  
  if (!keepAliveUrl) {
    console.log('⚠️ REPLIT_URL not found, skip keep-alive setup (running locally)');
    return;
  }

  console.log('🔄 Setting up keep-alive mechanism...');
  
  // Ping the server every 5 minutes to keep it alive
  setInterval(() => {
    try {
      http.get(keepAliveUrl, (res) => {
        console.log(`🏓 Keep-alive ping successful (${res.statusCode})`);
      }).on('error', (err) => {
        console.warn('⚠️ Keep-alive ping failed:', err.message);
      });
    } catch (error) {
      console.warn('⚠️ Keep-alive error:', error.message);
    }
  }, 5 * 60 * 1000); // 5 minutes

  // Also setup a more frequent internal health check
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    console.log(`💓 Health check - Memory: ${memUsedMB}MB, Uptime: ${Math.round(process.uptime())}s`);
    
    // Log bot status if available
    if (global.botInstance && global.botInstance.bot) {
      const bot = global.botInstance.bot;
      console.log(`🤖 Bot status - Connected: ${!!bot.username}, Health: ${bot.health || 0}, Food: ${bot.food || 0}`);
    }
  }, 2 * 60 * 1000); // 2 minutes
}

module.exports = { setupKeepAlive };
