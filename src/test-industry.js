const { Vnstock } = require('vnstock-js');

async function testIndustries() {
  try {
    const { stock } = new Vnstock();
    console.log('Fetching industries data...');
    
    const industries = await stock.listing.symbolsByIndustries();
    
    console.log(`Found ${industries.length} industries`);
    
    // Display the first industry and a few symbols as a sample
    if (industries.length > 0) {
      const firstIndustry = industries[0];
      console.log(`Industry: ${firstIndustry.industry}`);
      console.log(`Total symbols: ${firstIndustry.symbols.length}`);
      console.log('Sample symbols:');
      firstIndustry.symbols.slice(0, 3).forEach(symbol => {
        console.log(`- ${symbol.ticker}: ${symbol.organName}`);
      });
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testIndustries(); 