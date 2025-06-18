const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const app = express();
app.use(cors());
app.use(express.json());

// Blockchain config (update with deployed contract address and ABI)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const CONTRACT_ABI = require('D:/Blockchain/BlockchainHealth/Project-Copy/Hardhat/artifacts/contracts/PatientRecords.sol/PatientRecords.json'); // Placeholder, update after compilation
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const signer = provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

// Example endpoint: Get patient records
app.get('/records/:patient', async (req, res) => {
  try {
    const records = await contract.viewRecords(req.params.patient);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ...add endpoints for upload, verify, grant/revoke access, etc...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
