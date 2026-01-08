# Complete Setup Guide: Minecraft AFK Bot on Replit

This guide will walk you through every step to set up your Minecraft AFK bot with Microsoft authentication.

## Prerequisites

- ✅ Minecraft Java Edition account with Microsoft login
- ✅ Access to DonutSMP server (or any Minecraft server)
- ✅ Replit account
- ✅ Node.js installed on your local PC (for token generation)

---

## Step 1: Generate Microsoft Refresh Token (Local PC)

### Method 1: Using the Token Generator Script

1. **Create a temporary folder** on your local PC:
   ```bash
   mkdir minecraft-token-gen
   cd minecraft-token-gen
   ```

2. **Initialize Node.js project**:
   ```bash
   npm init -y
   npm install prismarine-auth
   ```

3. **Create token generator script** (`generate-token.js`):
   ```javascript
   const { Authflow, Titles } = require('prismarine-auth');

   async function generateToken() {
     console.log('🔐 Starting Microsoft authentication...');
     console.log('🌐 A browser window will open for login...');
     
     const authflow = new Authflow('minecraft-token-generator', './cache');
     
     try {
       const result = await authflow.getMinecraftJavaToken();
       
       console.log('\n✅ Authentication successful!');
       console.log('👤 Username:', result.name);
       console.log('🔑 Profile ID:', result.uuid);
       
       console.log('\n📋 COPY THIS REFRESH TOKEN TO REPLIT:');
       console.log('=' .repeat(50));
       console.log(result.refresh_token || 'No refresh token available');
       console.log('=' .repeat(50));
       
       console.log('\n💾 Token saved to cache folder for future use');
       
     } catch (error) {
       console.error('❌ Authentication failed:', error.message);
       process.exit(1);
     }
   }

   generateToken();
   ```

4. **Run the token generator**:
   ```bash
   node generate-token.js
   ```

5. **Complete Microsoft login** in the browser window that opens

6. **Copy the refresh token** from the console output

### Method 2: Manual Token Extraction

If the above doesn't work, you can extract tokens manually:

1. **Install minecraft-launcher-core**:
   ```bash
   npm install minecraft-launcher-core
   