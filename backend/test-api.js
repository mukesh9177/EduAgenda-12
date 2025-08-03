const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');

    // Test registration
    const registerData = {
      name: 'API Test User',
      email: 'apitest@example.com',
      phone: '+1234567890',
      dob: '1990-01-01',
      password: 'testpassword123'
    };

    console.log('1. Testing registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful:', registerResponse.data.message);
    console.log('Token received:', !!registerResponse.data.data.token);

    // Test login with same credentials
    console.log('\n2. Testing login...');
    const loginData = {
      email: 'apitest@example.com',
      password: 'testpassword123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('Token received:', !!loginResponse.data.data.token);

    // Test login with wrong password
    console.log('\n3. Testing login with wrong password...');
    try {
      const wrongLoginData = {
        email: 'apitest@example.com',
        password: 'wrongpassword'
      };
      await axios.post(`${BASE_URL}/auth/login`, wrongLoginData);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly rejected wrong password');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    console.log('\n🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ API test failed:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
    }
  }
}

testAPI(); 