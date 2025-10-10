import axios from 'axios';

const PROXY_URL = 'http://localhost:8787/api/chat';

async function runTest() {
  console.log('Sending test request to proxy for Ollama...');
  try {
    const response = await axios.post(PROXY_URL, {
      model: 'llama3.2:3b',
      messages: [{ role: 'user', content: 'Hello, world!' }],
      stream: false, // For this test, we will not stream the response
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Received response from proxy:');
    console.log(response.data);
  } catch (error) {
    console.error('Error during test:', error.message);
  }
}

runTest();