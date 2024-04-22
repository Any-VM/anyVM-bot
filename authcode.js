const axios = require('axios');
const fs = require('fs');
const path = require('path');

const data = JSON.stringify({ "authcode": " " });
const config = {
  method: 'post',
  url: 'https://liaobots.work/api/user',
  headers: {
    'Content-Type': 'application/json',
    'Referer': 'https://liaobots.work/',
    'Origin': 'https://liaobots.work',
    'cookie': 'gkp2=YgA62VmMKGEuVwkbz2HB'
  },
  data: data,
  responseType: 'json' // Expecting a JSON response
};

async function fetchAndStoreAuthCodes() {
  while (true) {
    try {
      const response = await axios.request(config);
      const { authCode } = response.data;

      let authCodes = [];
      const filePath = path.join(__dirname, 'authCodes.json');

      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        try {
          const parsedContent = JSON.parse(fileContent);
          if (Array.isArray(parsedContent)) {
            authCodes = parsedContent;
          } else {
            console.error('File content is not an array, initializing with an empty array.');
          }
        } catch (parseError) {
          console.error('Error parsing JSON from file, initializing with an empty array:', parseError.message);
        }
      }

      authCodes.push(authCode);
      fs.writeFileSync(filePath, JSON.stringify(authCodes, null, 2), 'utf8');

      console.log(`AuthCode ${authCode} saved.`);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          console.log('Received 404 error, sending data to gpt.anyvm.tech.');
          await sendDataToGptAnyvmTech();
          break;
        } else if (error.response.status === 401) {
          console.log('Received 401 error, stopping.');
          break;
        }
      } else {
        console.error('Error:', error.message);
      }
    }
  }
}

async function sendDataToGptAnyvmTech() {
  const filePath = path.join(__dirname, 'authCodes.json');
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    try {
      await axios.post('https://gpt.anyvm.tech', fileContent, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Data successfully sent to gpt.anyvm.tech');
    } catch (error) {
      console.error('Failed to send data to gpt.anyvm.tech:', error.message);
    }
  } else {
    console.log('authCodes.json does not exist, no data sent.');
  }
}

fetchAndStoreAuthCodes();