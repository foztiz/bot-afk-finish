const { Authflow, Titles } = require('prismarine-auth');
const fs = require('fs');
const path = require('path');

class MinecraftAuth {
  constructor() {
    this.authflow = null;
    this.cacheFile = path.join(__dirname, '.auth-cache.json');
    this.authDir = path.join(__dirname, 'auth-cache');
  }

  async authenticate() {
    const username = process.env.MINECRAFT_USERNAME;
    const password = process.env.MINECRAFT_PASSWORD;
    const refreshToken = process.env.REFRESH_TOKEN;

    if (!username) {
      throw new Error('MINECRAFT_USERNAME must be set in environment variables');
    }

    if (!refreshToken && !password) {
      throw new Error('Either REFRESH_TOKEN or MINECRAFT_PASSWORD must be set in environment variables');
    }

    try {
      console.log(`Authenticating with Microsoft account: ${username}`);
      
      // Try to use cached authentication first
      if (fs.existsSync('./auth-cache') && refreshToken) {
        try {
          console.log('Attempting to use cached refresh token...');
          this.authflow = new Authflow(username, {
            username: username,
            refreshToken: refreshToken,
            flow: 'live',
            authTitle: Titles.MinecraftJava,
            cachePath: './auth-cache'
          });
        } catch (err) {
          console.log('Cached auth failed, will try password auth');
        }
      }

      // If no cached auth or refresh token, use password
      if (!this.authflow && password) {
        console.log('Using password authentication...');
        this.authflow = new Authflow(username, {
          username: username,
          password: password,
          flow: 'msal',
          authTitle: Titles.MinecraftJava,
          cachePath: './auth-cache',
          onMsaCode: (data) => {
            console.log('\n🔐 Microsoft Authentication Required:');
            console.log(`Please go to: ${data.verification_uri}`);
            console.log(`Enter code: ${data.user_code}`);
            console.log(`Or visit: ${data.verification_uri}?otc=${data.user_code}`);
            console.log('Waiting for authentication...\n');
          }
        });
      }
      
      // Get authentication tokens using the proper API
      console.log('Getting Microsoft authentication tokens...');
      const authTokens = await this.authflow.getMinecraftJavaToken();
      console.log('✓ All authentication steps completed successfully');
      
      // Save authentication cache
      this.saveAuthCache({
        authTokens,
        username: username,
        timestamp: Date.now()
      });

      return {
        accessToken: authTokens.access_token,
        clientToken: authTokens.client_token || 'client-token',
        uuid: authTokens.uuid,
        username: authTokens.username || username
      };

    } catch (error) {
      console.error('Authentication failed:', error.message);
      
      // If cached auth failed, try fresh authentication
      if (fs.existsSync(this.cacheFile)) {
        console.log('Removing invalid auth cache and retrying...');
        fs.unlinkSync(this.cacheFile);
        return this.authenticate(); // Retry once without cache
      }
      
      throw new Error(`Microsoft authentication failed: ${error.message}`);
    }
  }

  saveAuthCache(authData) {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(authData, null, 2));
      console.log('✓ Authentication cache saved');
    } catch (err) {
      console.warn('Failed to save auth cache:', err.message);
    }
  }

  async refreshAuth() {
    try {
      if (!this.authflow) {
        return this.authenticate();
      }
      
      const mcToken = await this.authflow.getMcToken();
      console.log('✓ Authentication refreshed successfully');
      
      return {
        accessToken: mcToken.access_token,
        clientToken: mcToken.client_token || 'client-token',
        uuid: mcToken.uuid,
        username: mcToken.username
      };
      
    } catch (error) {
      console.warn('Failed to refresh auth, attempting fresh authentication...');
      return this.authenticate();
    }
  }

  // Generate refresh token (for initial setup)
  static async generateRefreshToken(username, password) {
    try {
      const authflow = new Authflow(username, {
        username: username,
        password: password,
        flow: 'msal'
      });
      
      const msaToken = await authflow.getMsaToken();
      console.log('✓ Refresh token generated successfully');
      console.log('Add this to your Replit Secrets as REFRESH_TOKEN:');
      console.log(msaToken.refresh_token);
      
      return msaToken.refresh_token;
    } catch (error) {
      throw new Error(`Failed to generate refresh token: ${error.message}`);
    }
  }
}

module.exports = { MinecraftAuth };
