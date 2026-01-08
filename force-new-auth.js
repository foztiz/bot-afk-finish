const { Authflow, Titles } = require('prismarine-auth');

// Force a new authentication with a fresh flow
async function forceNewAuth() {
  const username = process.env.MINECRAFT_USERNAME || 'test@example.com';
  
  console.log('🔐 Forcing new Microsoft authentication...');
  
  try {
    const authflow = new Authflow(username, {
      username: username,
      flow: 'msal',
      authTitle: Titles.MinecraftJava,
      deviceType: 'Nintendo',
      forceRefresh: true,
      onMsaCode: (data) => {
        console.log('\n' + '='.repeat(60));
        console.log('🔗 NEW AUTHENTICATION LINK GENERATED:');
        console.log('='.repeat(60));
        console.log(`Link: ${data.verification_uri}?otc=${data.user_code}`);
        console.log(`Code: ${data.user_code}`);
        console.log(`Direct URL: https://www.microsoft.com/link?otc=${data.user_code}`);
        console.log('='.repeat(60));
        console.log('Complete authentication in your browser to continue...');
        console.log('='.repeat(60) + '\n');
      }
    });

    // This will trigger the authentication flow
    await authflow.getMsaToken();
    
  } catch (error) {
    console.log('Authentication flow initiated - check above for the link');
  }
}

forceNewAuth();