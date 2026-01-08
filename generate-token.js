const { Authflow, Titles } = require('prismarine-auth');

async function generateNewToken() {
  console.log('Generating new Microsoft authentication code...');
  
  try {
    const authflow = new Authflow('temp_user', {
      flow: 'msal',
      authTitle: Titles.MinecraftJava,
      onMsaCode: (data) => {
        console.log('\n' + '='.repeat(50));
        console.log('📱 SECURITY CODE FOR MICROSOFT:');
        console.log('='.repeat(50));
        console.log(`CODE: ${data.user_code}`);
        console.log(`LINK: ${data.verification_uri}`);
        console.log('='.repeat(50));
        console.log('Enter this code on the Microsoft page');
        console.log('='.repeat(50));
      }
    });

    await authflow.getMsaToken();
  } catch (error) {
    console.log('Authentication code generated above');
  }
}

generateNewToken();