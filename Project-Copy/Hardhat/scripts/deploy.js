const fs = require("fs");
const path = require("path");

async function main() {
  const [admin, doctor, patient] = await ethers.getSigners();

  const PatientRecords = await ethers.getContractFactory("PatientRecords");
  const contract = await PatientRecords.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ PatientRecords deployed to:", address);

  // Assign roles
  const tx1 = await contract.connect(admin).assignRole(doctor.address, 2); // Doctor
  await tx1.wait();

  const tx2 = await contract.connect(admin).assignRole(patient.address, 3); // Patient
  await tx2.wait();

  console.log("👤 Roles assigned:");
  console.log("Admin:  ", admin.address);
  console.log("Doctor: ", doctor.address);
  console.log("Patient:", patient.address);

  // Prepare to export ABI + address to frontend
  const frontendContractsDir = path.resolve(__dirname, "../../frontend/src/contracts");

  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(frontendContractsDir, "contract-address.json"),
    JSON.stringify({ PatientRecords: address }, null, 2)
  );

  fs.copyFileSync(
    path.resolve(__dirname, "../artifacts/contracts/PatientRecords.sol/PatientRecords.json"),
    path.join(frontendContractsDir, "PatientRecords.json")
  );
}

main().catch((error) => {
  console.error("🚨 Deployment failed:", error);
  process.exitCode = 1;
});