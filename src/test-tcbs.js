const axios = require('axios');

async function testTcbsIndustries() {
  console.log('Testing TCBS Industries API...');

  try {
    // Get industry data from TCBS API
    console.log('Fetching industry data...');
    const sectorResponse = await axios.get('https://apipubaws.tcbs.com.vn/tcanalysis/v1/industry');
    console.log(`Received industry data with ${sectorResponse.data.length} sectors`);
    
    // Sample one industry
    if (sectorResponse.data.length > 0) {
      const sample = sectorResponse.data[0];
      console.log('Sample industry:', {
        industryName: sample.industryName,
        numberOfTickers: sample.tickers?.length || 0
      });
    }
    
    // Get all symbols
    console.log('Fetching symbol data...');
    const symbolsResponse = await axios.get('https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker');
    console.log(`Received symbols data with ${symbolsResponse.data.data.length} symbols`);
    
    // Sample one symbol
    if (symbolsResponse.data.data.length > 0) {
      console.log('Sample symbol:', symbolsResponse.data.data[0]);
    }
    
    console.log('Test successful!');
  } catch (error) {
    console.error('Test failed:');
    console.error('- Message:', error.message);
    if (error.response) {
      console.error('- Status:', error.response.status);
      console.error('- Data:', JSON.stringify(error.response.data, null, 2));
      console.error('- Headers:', JSON.stringify(error.response.headers, null, 2));
    }
  }
}

testTcbsIndustries(); 