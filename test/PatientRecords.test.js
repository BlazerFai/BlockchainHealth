const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PatientRecords", function () {
  let contract, admin, doctor, patient, stranger;
  const ROLE = { None: 0, Patient: 1, Doctor: 2, Admin: 3 };

  beforeEach(async function () {
    [admin, doctor, patient, stranger] = await ethers.getSigners();
    const PatientRecords = await ethers.getContractFactory("PatientRecords");
    contract = await PatientRecords.connect(admin).deploy();

    await contract.connect(admin).assignRole(doctor.address, ROLE.Doctor);
    await contract.connect(admin).assignRole(patient.address, ROLE.Patient);
  });

  it("should allow a doctor to upload a record for a patient", async function () {
    await contract.connect(doctor).uploadRecord(patient.address, "ipfs://hash1");
    const records = await contract.viewRecords(patient.address);
    expect(records.length).to.equal(1);
    expect(records[0].uploader).to.equal(doctor.address);
    expect(records[0].dataHash).to.equal("ipfs://hash1");
    expect(records[0].verified).to.be.false;
  });

  it("should allow admin to upload a record for a patient", async function () {
    await contract.connect(admin).uploadRecord(patient.address, "ipfs://hash2");
    const records = await contract.viewRecords(patient.address);
    expect(records.length).to.equal(1);
    expect(records[0].uploader).to.equal(admin.address);
  });

  it("should not allow strangers to upload", async function () {
    await expect(
      contract.connect(stranger).uploadRecord(patient.address, "ipfs://bad")
    ).to.be.revertedWith("Not doctor or admin");
  });

  it("should allow admin to verify a record", async function () {
    await contract.connect(doctor).uploadRecord(patient.address, "ipfs://hash3");
    await contract.connect(admin).verifyRecord(patient.address, 0);
    const records = await contract.viewRecords(patient.address);
    expect(records[0].verified).to.be.true;
  });

  it("should allow admin to override access for doctor", async function () {
    await contract.connect(admin).overrideAccess(patient.address, doctor.address, true);
    expect(await contract.access(patient.address, doctor.address)).to.be.true;
  });

  it("should allow patient to view their own records", async function () {
    await contract.connect(doctor).uploadRecord(patient.address, "ipfs://hash4");
    const records = await contract.connect(patient).viewRecords(patient.address);
    expect(records.length).to.equal(1);
  });

  it("should not allow random users to view records without access", async function () {
    await contract.connect(doctor).uploadRecord(patient.address, "ipfs://hash5");
    await expect(
      contract.connect(stranger).viewRecords(patient.address)
    ).to.be.revertedWith("No access");
  });
});
