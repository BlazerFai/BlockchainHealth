// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PatientRecords {
    enum Role { None, Patient, Doctor, Admin }
    struct Record {
        address uploader;
        string dataHash;
        bool verified;
    }
    mapping(address => Role) public roles;
    mapping(address => mapping(address => bool)) public access;
    mapping(address => Record[]) public records;
    address public admin;

    event RecordUploaded(address indexed patient, address indexed doctor, string dataHash);
    event RecordVerified(address indexed patient, uint recordIndex);
    event AccessGranted(address indexed patient, address indexed grantee);
    event AccessRevoked(address indexed patient, address indexed grantee);
    event Alert(string message);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }
    modifier onlyDoctorOrAdmin() {
        require(
            roles[msg.sender] == Role.Doctor || roles[msg.sender] == Role.Admin,
            "Not doctor or admin"
        );
        _;
    }
    modifier onlyPatient() {
        require(roles[msg.sender] == Role.Patient, "Not patient");
        _;
    }
    modifier hasAccess(address patient) {
        require(
            msg.sender == patient ||
            access[patient][msg.sender] ||
            msg.sender == admin,
            "No access"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
        roles[admin] = Role.Admin;
    }

    function assignRole(address user, Role role) public onlyAdmin {
        roles[user] = role;
    }

    function uploadRecord(address patient, string memory dataHash) public onlyDoctorOrAdmin {
        require(roles[patient] == Role.Patient, "Not a patient");
        records[patient].push(Record(msg.sender, dataHash, false));
        emit RecordUploaded(patient, msg.sender, dataHash);
    }

    function verifyRecord(address patient, uint index) public onlyAdmin {
        require(index < records[patient].length, "Invalid index");
        records[patient][index].verified = true;
        emit RecordVerified(patient, index);
    }

    function overrideAccess(address patient, address grantee, bool grant) public onlyAdmin {
        access[patient][grantee] = grant;
        if (grant) emit AccessGranted(patient, grantee);
        else emit AccessRevoked(patient, grantee);
    }

    function viewRecords(address patient) public hasAccess(patient) view returns (Record[] memory) {
        return records[patient];
    }
} 
