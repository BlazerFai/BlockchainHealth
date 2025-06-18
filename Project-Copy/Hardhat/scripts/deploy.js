// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [admin, doctor, patient] = await hre.ethers.getSigners();
  const PatientRecords = await hre.ethers.getContractFactory("PatientRecords");
  const contract = await PatientRecords.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("Contract deployed to:", contractAddress);
  console.log("Admin:", admin.address);
  console.log("Doctor:", doctor.address);
  console.log("Patient:", patient.address);

  // Assign roles to default signers
  await contract.connect(admin).assignRole(doctor.address, 2);  // Role.Doctor
  await contract.connect(admin).assignRole(patient.address, 1); // Role.Patient

  // 🔑 Also assign your MetaMask wallet address the doctor role
  const yourWalletAddress = "0x6E942B1c99d2AF4d84E5aaECaCEd682Fa4577653"; // <-- your address
  await contract.connect(admin).assignRole(yourWalletAddress, 2); // Role.Doctor
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
