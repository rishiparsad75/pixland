const axios = require('axios');

async function testLogin() {
    try {
        console.log("Testing login on localhost:5000...");
        const response = await axios.post('http://localhost:5000/api/users/login', {
            email: 'test@example.com',
            password: 'password123'
        });
        console.log("Response:", response.status, response.data);
    } catch (error) {
        if (error.response) {
            console.log("Error Response:", error.response.status, error.response.data);
        } else {
            console.log("Error:", error.message);
        }
    }
}

testLogin();
