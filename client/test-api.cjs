const axios = require('axios');

async function test() {
  try {
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      fullName: 'Test Recipient',
      email: 'test' + Date.now() + '@otms.com',
      phone: '1234567890',
      password: 'password',
      role: 'RECIPIENT'
    });
    const token = regRes.data.data.token;
    
    const hospRes = await axios.get('http://localhost:5000/api/organs/hospitals', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const hospitalId = hospRes.data.data[0].id;
    
    const reqRes = await axios.post('http://localhost:5000/api/requests', {
      hospitalId: hospitalId,
      organType: 'KIDNEY',
      urgencyLevel: '9',
      medicalPriority: '9',
      medicalInformation: 'very urgent'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("SUCCESS:", reqRes.data);
  } catch (e) {
    console.error("API ERROR:", e.response ? e.response.data : e.message);
  }
}
test();
