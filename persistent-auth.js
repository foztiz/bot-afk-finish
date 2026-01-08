const { Authflow, Titles } = require('prismarine-auth');
const fs = require('fs');
const path = require('path');

class PersistentAuth {
  static getCacheDir() {
    const cacheDir = path.join(process.cwd(), '.minecraft-auth');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    return cacheDir;
  }

  static async authenticate() {
    const username = process.env.MINECRAFT_USERNAME;
    const password = process.env.MINECRAFT_PASSWORD;
    
    if (!username || !password) {
      throw new Error('MINECRAFT_USERNAME and MINECRAFT_PASSWORD must be set');
    }

    console.log(`🔐 Authenticating ${username}...`);

    try {
      // Set up persistent cache directory (DON'T DELETE IT!)
      const cacheDir = this.getCacheDir();
      
      const authflow = new Authflow(username, {
        username,
        password,
        flow: 'msal',
        authTitle: Titles.MinecraftJava,
        cacheDirectory: cacheDir,
        onMsaCode: (data) => {
          console.log('\n' + '='.repeat(60));
          console.log('🔗 MICROSOFT AUTHENTICATION REQUIRED');
          console.log('='.repeat(60));
          console.log(`🌐 Link: ${data.verification_uri}?otc=${data.user_code}`);
          console.log(`🔢 Code: ${data.user_code}`);
          console.log('📱 Or visit: https://microsoft.com/link');
          console.log('='.repeat(60));
          console.log('⏱️  Complete authentication in browser to continue...');
          console.log('✨ This will save your login for weeks/months!');
          console.log('='.repeat(60) + '\n');
        }
      });

      // Try to get token (will use cache if available)
      const token = await authflow.getMinecraftJavaToken();
      
      console.log('✅ Authentication successful!');
      console.log('💾 Tokens cached - future logins will be automatic!');
      
      return {
        accessToken: token.access_token,
        clientToken: token.client_token || 'client-token',
        uuid: token.uuid,
        username: token.username || username
      };

    } catch (error) {
      if (error.message.includes('expired_token') || error.message.includes('invalid_token')) {
        console.log('🔄 Token expired - manual authentication required');
      } else {
        console.error('❌ Authentication error:', error.message);
      }
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  // Method to check if we have valid cached tokens
  static hasCachedTokens() {
    const cacheDir = this.getCacheDir();
    const msaTokenFile = path.join(cacheDir, 'msa-cache.json');
    const xblTokenFile = path.join(cacheDir, 'xbl-cache.json');
    
    return fs.existsSync(msaTokenFile) && fs.existsSync(xblTokenFile);
  }

  // Method to clear cache if needed for troubleshooting
  static clearCache() {
    const cacheDir = this.getCacheDir();
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
      console.log('🗑️ Authentication cache cleared');
    }
  }
}

module.exports = { PersistentAuth };