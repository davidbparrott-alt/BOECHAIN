require('dotenv').config();
const Web3 = require('web3').default || require('web3');
const axios = require('axios');
const fs = require('fs');

// Load contract ABI
const abi = JSON.parse(fs.readFileSync('./RainToken.json', 'utf8')).abi;

// Connect to your local Besu node
const web3 = new Web3(process.env.RPC_URL);

// Set up account
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Connect to deployed RainToken contract
const contract = new web3.eth.Contract(abi, process.env.CONTRACT_ADDRESS);
const beneficiary = process.env.BENEFICIARY;
const location = "ipswich";

// Function to get weather in location from OpenWeatherMap
async function getWeather() {
    try {
        const res = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${location},GB&appid=${process.env.API_KEY}&units=metric`
        );
        const weather = res.data.weather[0].main.toLowerCase(); // e.g., "rain", "clear"
        return weather;
    } catch (err) {
        console.error("Error fetching weather:", err.message);
        return null;
    }
}

// Main function: check weather and mint if raining
async function checkRainAndMint() {
    //const weather = await getWeather();
    //if (!weather) return;
 
    const weather = "rain"; // force rain for testing

    console.log(`Current weather in ${location}:`, weather);

    if (weather.includes("rain")) {
        console.log("It's raining! Minting 5 tokens...");

        try {
            const tx = contract.methods.reportRain(true);
            const gas = await tx.estimateGas({ from: account.address });
            const receipt = await tx.send({ from: account.address, gas, type: 0 });
            console.log("Transaction mined:", receipt.transactionHash);
        } catch (err) {
            console.error("Error sending transaction:", err.message);
        }
    } else {
        console.log("No rain, no tokens minted.");
    }
}

// Run the script
checkRainAndMint();