import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { getPrice } from "../AssetOracle/oracle";
const fs = require('fs');
const path = require('path');
dotenv.config();

// Setup env variables
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
/// TODO: Hack
let chainId = 31337;

const avsDeploymentData = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../contracts/deployments/hello-world/${chainId}.json`), 'utf8'));
const helloWorldServiceManagerAddress = avsDeploymentData.addresses.helloWorldServiceManager;
const helloWorldServiceManagerABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../abis/HelloWorldServiceManager.json'), 'utf8'));
// Initialize contract objects from ABIs
const helloWorldServiceManager = new ethers.Contract(helloWorldServiceManagerAddress, helloWorldServiceManagerABI, wallet);


// Function to generate random names
function generateRandomPayment(): string {
    const currencies = [' USD', ' EUR', ' Pounds', ' BRL', ' CAD', ' MXN'];
    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    const randomPayment = `${Math.floor(Math.random() * 100)}${currency}`;
    return randomPayment;
  }

function convertToUSD(randomPayment: string): number {
    // Parse the payment string to extract amount and currency
    const parts = randomPayment.trim().split(' ');
    const amount = parseFloat(parts[0]);
    const currency = parts[1];
    
    // Exchange rates (per 1 USD)
    const exchangeRates: { [key: string]: number } = {
        'USD': 1.0,
        'EUR': 0.8757,
        'Pounds': 0.7381,
        'BRL': 5.208,
        'CAD': 1.3677,
        'MXN': 19.193
    };
    
    // Convert to USD
    if (currency in exchangeRates) {
        return amount / exchangeRates[currency];
    } else {
        console.warn(`Unknown currency: ${currency}, assuming USD`);
        return amount;
    }
}

function selectingAsset(): number {
    const assets = [1, 1027];
    const selectedAsset = assets[Math.floor(Math.random() * assets.length)];
    return selectedAsset;
}

async function amountOfAsset(randomPayment: string, selectedAsset: number): Promise<number> {
    const price = await getPrice(selectedAsset);
    const amount = convertToUSD(randomPayment);
    
    // Calculate how much of the asset we can buy with the USD amount
    const assetAmount = amount / price;
    
    return assetAmount;
}

async function createNewTask(taskName: string) {
  try {
    // Send a transaction to the createNewTask function
    const tx = await helloWorldServiceManager.createNewTask(taskName);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    // Wait 3 seconds before showing confirmation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`Transaction successful with hash: ${receipt.hash}`);
  } catch (error) {
    console.error('Error sending transaction:', error);
  }
}

// Function to create a new task with a random name every 5 seconds
function startCreatingTasks() {
  setInterval(async () => {
    const randomPayment = generateRandomPayment();
    console.log(`
      --------------------------------
      Receiving a new payment of ${randomPayment}
      `);
    
    try {
      const selectedAsset = selectingAsset();
      const assetName = selectedAsset === 1 ? 'WBTC' : 'ETH';
      const price = await getPrice(selectedAsset);
      const assetAmount = await amountOfAsset(randomPayment, selectedAsset);
      const amount = convertToUSD(randomPayment);
      
      console.log(`User wants to buy ${assetName}`);
      console.log(`Converting ${randomPayment} to USD`);
      console.log(`You are receiving $${amount.toFixed(2)} USD`);
      console.log(`The price of ${assetName} is $${price.toFixed(2)}`);
      console.log(`You are sending ${assetAmount.toFixed(6)} ${assetName}`);

      
      // Create task with payment info and asset conversion
      const taskData = `${randomPayment}, sending ${assetAmount.toFixed(6)} ${assetName}`;
      createNewTask(taskData);
    } catch (error) {
      console.error('Error calculating asset amount:', error);
      // Fallback to just the payment
      createNewTask(randomPayment);
    }
  }, 15000);
}

// Start the process
startCreatingTasks();