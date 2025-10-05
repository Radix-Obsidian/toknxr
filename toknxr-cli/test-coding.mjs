// Test the code analysis feature with Gemini (working API)
import axios from 'axios';

const prompt = "Write a JavaScript function to calculate the fibonacci sequence up to n terms. Include proper error handling and comments.";

const geminiRequest = {
  contents: [{
    parts: [{
      text: prompt
    }]
  }]
};

console.log('🎯 Sending coding request to Gemini via proxy...');
console.log('📝 Prompt:', prompt.substring(0, 100) + '...');

try {
  const response = await axios.post('http://localhost:8787/gemini/v1beta/models/gemini-2.5-flash:generateContent', geminiRequest, {
    headers: { 'Content-Type': 'application/json' }
  });

  console.log('✅ Request successful!');
  console.log('📊 Response preview:', response.data.candidates[0].content.parts[0].text.substring(0, 200) + '...');

} catch (error) {
  console.error('❌ Request failed:', error.response?.data || error.message);
}
