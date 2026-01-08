const { Authflow, Titles } = require('prismarine-auth');
const fs = require('fs');

class SimpleAuth {
  static async authenticate() {
    const username = process.env.MINECRAFT_USERNAME;
    const password = process.env.MINECRAFT_PASSWORD;
    
    if (!username || !password) {
      throw new Error('MINECRAFT_USERNAME and MINECRAFT_PASSWORD must be set');
    }

    console.log(`Authenticating ${username}...`);

    try {
      // Force fresh authentication by removing cache
      if (fs.existsSync('./auth-cache')) {
        fs.rmSync('./auth-cache', { recursive: true, force: true });
      }
      fs.mkdirSync('./auth-cache', { recursive: true });

      const authflow = new Authflow(username, {
        username,
        password,
        flow: 'msal',
        authTitle: Titles.MinecraftJava,
        onMsaCode: (data) => {
          console.log('\n🔐 NEW AUTHENTICATION LINK:');
          console.log(`Go to: ${data.verification_uri}?otc=${data.user_code}`);
          console.log(`Or visit: ${data.verification_uri} and enter code: ${data.user_code}`);
          console.log('Complete authentication to continue...\n');
        }
      });

      // Get the authentication token
      const token = await authflow.getMinecraftJavaToken();
      
      console.log('✅ Authentication successful!');
      
      return {
        accessToken: token.access_token,
        clientToken: token.client_token || 'client-token',
        uuid: token.uuid,
        username: token.username || username
      };

    } catch (error) {
      console.error('Authentication error:', error.message);
      throw new Error(`Failed to authenticate: ${error.message}`);
    }
  }
}

module.exports = { SimpleAuth };