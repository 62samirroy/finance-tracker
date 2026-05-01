const axios = require('axios');

async function testDelete() {
  try {
    // 1. Get transactions
    const res = await axios.get('http://localhost:5000/api/transactions');
    const transactions = res.data;
    if (transactions.length === 0) {
      console.log('No transactions to delete');
      return;
    }
    const id = transactions[0].id;
    console.log(`Testing deletion of transaction ID: ${id}`);
    
    // 2. Try delete
    const delRes = await axios.delete(`http://localhost:5000/api/transactions/${id}`);
    console.log('Success:', delRes.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testDelete();
