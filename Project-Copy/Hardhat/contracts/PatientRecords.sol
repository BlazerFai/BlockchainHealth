// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract PatientRecords {
    struct Record {
        string dataHash;
        bool verified;
    }

    // Storage
    mapping(address => Record[]) public records;
    mapping(address => uint256) public roles;
    mapping(address => mapping(address => bool)) public accessControl;

    // Role IDs
    uint256 constant ROLE_ADMIN = 1;
    uint256 constant ROLE_DOCTOR = 2;
    uint256 constant ROLE_PATIENT = 3;

    // Events
    event RecordUploaded(address indexed patient, address indexed by, string dataHash);
    event RecordVerified(address indexed patient, uint256 indexed recordId, address indexed by);
    event RoleAssigned(address indexed user, uint256 roleId);
    event AccessChanged(address indexed patient, address indexed grantee, bool access);

    constructor() {
        roles[msg.sender] = ROLE_ADMIN;
        emit RoleAssigned(msg.sender, ROLE_ADMIN);
    }

    // Modifiers
    modifier onlyAdmin() {
        require(roles[msg.sender] == ROLE_ADMIN, "Only admin can perform this action");
        _;
    }

    modifier onlyDoctorOrAdmin() {
        require(
            roles[msg.sender] == ROLE_DOCTOR || 
            roles[msg.sender] == ROLE_ADMIN,
            "Only doctor or admin can perform this action"
        );
        _;
    }

    modifier hasAccess(address _patient) {
        require(
            msg.sender == _patient || 
            accessControl[_patient][msg.sender] || 
            roles[msg.sender] == ROLE_DOCTOR || 
            roles[msg.sender] == ROLE_ADMIN,
            "No access to these records"
        );
        _;
    }

    modifier validAddress(address _address) {
        require(_address != address(0), "Invalid address");
        _;
    }

    // Core Functions
function uploadRecord(address _patient, string memory _dataHash) public onlyDoctorOrAdmin {
    records[_patient].push(Record(_dataHash, true)); // <-- Changed to true
    emit RecordUploaded(_patient, msg.sender, _dataHash);
}

    function verifyRecord(
        address _patient, 
        uint256 index
    ) public onlyDoctorOrAdmin validAddress(_patient) {
        require(index < records[_patient].length, "Record does not exist");
        records[_patient][index].verified = true;
        emit RecordVerified(_patient, index, msg.sender);
    }

    function assignRole(
        address _user, 
        uint256 _roleId
    ) public onlyAdmin validAddress(_user) {
        require(_roleId >= 1 && _roleId <= 3, "Invalid role ID");
        roles[_user] = _roleId;
        emit RoleAssigned(_user, _roleId);
    }

    function overrideAccess(
        address _patient,
        address _grantee,
        bool _grant
    ) public onlyAdmin validAddress(_patient) validAddress(_grantee) {
        accessControl[_patient][_grantee] = _grant;
        emit AccessChanged(_patient, _grantee, _grant);
    }

    // View Functions
    function getRecordCount(
        address _patient
    ) public view validAddress(_patient) hasAccess(_patient) returns (uint256) {
        return records[_patient].length;
    }

    function getRecordAt(
        address _patient, 
        uint256 index
    ) public view validAddress(_patient) hasAccess(_patient) returns (string memory, bool) {
        require(index < records[_patient].length, "Index out of bounds");
        Record memory rec = records[_patient][index];
        return (rec.dataHash, rec.verified);
    }

    function getRole(
        address _user
    ) public view validAddress(_user) returns (uint256) {
        return roles[_user];
    }

    function hasAccessTo(
        address _requester,
        address _patient
    ) public view validAddress(_requester) validAddress(_patient) returns (bool) {
        return _requester == _patient || 
               accessControl[_patient][_requester] || 
               roles[_requester] == ROLE_DOCTOR || 
               roles[_requester] == ROLE_ADMIN;
    }
}