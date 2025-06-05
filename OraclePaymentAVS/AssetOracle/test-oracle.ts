import { getPrice } from './oracle';

async function testOracle() {
  console.log('Testing Oracle Functions...\n');

  let id: number = 1; // BTC = 1, ETH = 1027
  const asset1 = "BTC";
  const asset2 = "ETH";

  let asset = "";
  if (id === 1) {
    asset = asset1;
  } else {
    asset = asset2;
  }


  try {
    console.log('Fetching price...');
    const price = await getPrice(id);
    console.log(`Current ${asset} price: $${price}\n`);

  } catch (error) {
    console.error('Error testing oracle:', error);
  }
}
// Run the test
testOracle(); 