import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "../../Hardhat/artifacts/contracts/PatientRecords.sol/PatientRecords.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // TODO: Replace with your contract address
const CONTRACT_ABI = abi.abi;

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [role, setRole] = useState("doctor"); // default role

  useEffect(() => {
    const loadBlockchain = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        setAccount(userAddress);

        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(contractInstance);

        const roleId = await contract.roles(userAddress);
        console.log("Connected Role:", roleId.toString());


      } else {
        alert("Please install MetaMask.");
      }
    };
    loadBlockchain();
  }, []);

  return (
    <div className="App">
      <h1>Patient Records DApp</h1>
      <p><strong>Connected Wallet:</strong> {account}</p>

      <label>Select Role: </label>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="doctor">Doctor</option>
        <option value="admin">Admin</option>
        <option value="patient">Patient</option>
      </select>

      {role === "doctor" && <DoctorView contract={contract} />}
      {role === "admin" && <AdminView contract={contract} />}
      {role === "patient" && <PatientView contract={contract} account={account} />}
    </div>
  );
}

function DoctorView({ contract }) {
  const [patientAddress, setPatientAddress] = useState("");
  const [dataHash, setDataHash] = useState("");
  const [records, setRecords] = useState([]);

  const handleUpload = async () => {
    try {
      const tx = await contract.uploadRecord(patientAddress, dataHash);
      await tx.wait();
      alert("Record uploaded successfully!");
    } catch (err) {
      alert("Upload error: " + err.reason);
    }
  };

  const handleView = async () => {
    try {
      const result = await contract.viewRecords(patientAddress);
      setRecords(result);
    } catch (err) {
      alert("View error: " + err.reason);
    }
  };

  return (
    <div className="card">
      <h2>Doctor View</h2>
      <input placeholder="Patient Address" value={patientAddress} onChange={(e) => setPatientAddress(e.target.value)} />
      <input placeholder="IPFS Hash" value={dataHash} onChange={(e) => setDataHash(e.target.value)} />
      <button onClick={handleUpload}>Upload</button>
      <button onClick={handleView}>View Records</button>

      <ul>
        {records.map((rec, i) => (
          <li key={i}>
            {rec.dataHash} | Verified: {rec.verified.toString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AdminView({ contract }) {
  const [patientAddress, setPatientAddress] = useState("");
  const [dataHash, setDataHash] = useState("");
  const [grantee, setGrantee] = useState("");
  const [grantValue, setGrantValue] = useState(true);
  const [records, setRecords] = useState([]);

  const handleUpload = async () => {
    try {
      const tx = await contract.uploadRecord(patientAddress, dataHash);
      await tx.wait();
      alert("Record uploaded by admin");
    } catch (err) {
      alert("Upload error: " + err.reason);
    }
  };

  const handleAccess = async () => {
    try {
      const tx = await contract.overrideAccess(patientAddress, grantee, grantValue);
      await tx.wait();
      alert(grantValue ? "Access Granted" : "Access Revoked");
    } catch (err) {
      alert("Access change error: " + err.reason);
    }
  };

  const handleView = async () => {
    try {
      const result = await contract.viewRecords(patientAddress);
      setRecords(result);
    } catch (err) {
      alert("View error: " + err.reason);
    }
  };

  return (
    <div className="card">
      <h2>Admin View</h2>
      <input placeholder="Patient Address" value={patientAddress} onChange={(e) => setPatientAddress(e.target.value)} />
      <input placeholder="IPFS Hash" value={dataHash} onChange={(e) => setDataHash(e.target.value)} />
      <button onClick={handleUpload}>Upload</button>
      <button onClick={handleView}>View Records</button>

      <h3>Grant/Revoke Access</h3>
      <input placeholder="Grantee Address" value={grantee} onChange={(e) => setGrantee(e.target.value)} />
      <select value={grantValue} onChange={(e) => setGrantValue(e.target.value === "true")}> 
        <option value="true">Grant</option>
        <option value="false">Revoke</option>
      </select>
      <button onClick={handleAccess}>Apply Access Change</button>

      <ul>
        {records.map((rec, i) => (
          <li key={i}>
            {rec.dataHash} | Verified: {rec.verified.toString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PatientView({ contract, account }) {
  const [records, setRecords] = useState([]);

  const handleView = async () => {
    try {
      const result = await contract.viewRecords(account);
      setRecords(result);
    } catch (err) {
      alert("View error: " + err.reason);
    }
  };

  return (
    <div className="card">
      <h2>Patient View</h2>
      <button onClick={handleView}>View My Records</button>
      <ul>
        {records.map((rec, i) => (
          <li key={i}>
            {rec.dataHash} | Verified: {rec.verified.toString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
