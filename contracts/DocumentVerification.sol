// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DocumentVerification {
    enum Status { Pending, Verified, Rejected, Expired }

    struct Document {
        bytes32 documentHash;
        address owner;
        uint256 timestamp;
        Status status;
        uint256 expiryDate;
        string metadata;
        address verifier;
        string rejectionReason; // New field for storing rejection reasons
    }

    mapping(bytes32 => Document) public documents;
    mapping(address => bool) public checkers;
    mapping(address => bytes32[]) private userDocuments;
    bytes32[] private pendingDocuments; // Array to track pending documents
    bytes32[] private verifiedDocuments; // Array to track verified documents
    bytes32[] private rejectedDocuments; // Array to track rejected documents
    
    address public immutable checker;
    
    uint256 public totalDocuments;
    uint256 public pendingDocumentsCount;
    uint256 public verifiedDocumentsCount;
    uint256 public rejectedDocumentsCount;

    bytes32[] public allDocumentIds;

    // Custom errors
    error DocumentNotFound();
    error DocumentNotPending();
    error NotChecker();
    error DocumentAlreadyExists();
    error InvalidStatus();

    // Events
    event DocumentSubmitted(bytes32 indexed documentId, address indexed owner, string metadata);
    event DocumentVerified(bytes32 indexed documentId, address indexed checker);
    event DocumentRejected(bytes32 indexed documentId, address indexed checker, string reason);
    event CheckerAdded(address checker);

    // Modifiers
    modifier onlyChecker() {
        if (!checkers[msg.sender] && msg.sender != checker) revert NotChecker();
        _;
    }

    modifier documentExists(bytes32 documentId) {
        if (documents[documentId].owner == address(0)) revert DocumentNotFound();
        _;
    }

    modifier documentNotExists(bytes32 documentId) {
        if (documents[documentId].owner != address(0)) revert DocumentAlreadyExists();
        _;
    }

    constructor() {
        checker = msg.sender;
        checkers[msg.sender] = true;
    }

    function registerDocument(bytes32 documentId, string memory metadata) 
        public 
        documentNotExists(documentId) 
    {
        documents[documentId] = Document({
            documentHash: documentId,
            owner: msg.sender,
            timestamp: block.timestamp,
            status: Status.Pending,
            expiryDate: block.timestamp + 365 days,
            metadata: metadata,
            verifier: address(0),
            rejectionReason: ""
        });

        userDocuments[msg.sender].push(documentId);
        allDocumentIds.push(documentId);
        pendingDocuments.push(documentId);
        
        totalDocuments++;
        pendingDocumentsCount++;
        
        emit DocumentSubmitted(documentId, msg.sender, metadata);
    }

    function approveDocument(bytes32 documentId) 
        external 
        onlyChecker 
        documentExists(documentId) 
    {
        Document storage doc = documents[documentId];
        if (doc.status != Status.Pending) revert DocumentNotPending();
        
        if (block.timestamp > doc.expiryDate) {
            doc.status = Status.Expired;
            pendingDocumentsCount--;
            _removeFromPendingArray(documentId);
        } else {
            doc.status = Status.Verified;
            doc.verifier = msg.sender;
            pendingDocumentsCount--;
            verifiedDocumentsCount++;
            _removeFromPendingArray(documentId);
            verifiedDocuments.push(documentId);
            emit DocumentVerified(documentId, msg.sender);
        }
    }

    function rejectDocument(bytes32 documentId, string memory reason) 
        external 
        onlyChecker 
        documentExists(documentId) 
    {
        Document storage doc = documents[documentId];
        if (doc.status != Status.Pending) revert DocumentNotPending();
        
        doc.status = Status.Rejected;
        doc.verifier = msg.sender;
        doc.rejectionReason = reason;
        
        pendingDocumentsCount--;
        rejectedDocumentsCount++;
        
        _removeFromPendingArray(documentId);
        rejectedDocuments.push(documentId);
        
        emit DocumentRejected(documentId, msg.sender, reason);
    }

    function getPendingDocuments() external view returns (bytes32[] memory) {
        return pendingDocuments;
    }

    function getVerifiedDocuments() external view returns (bytes32[] memory) {
        return verifiedDocuments;
    }

    function getRejectedDocuments() external view returns (bytes32[] memory) {
        return rejectedDocuments;
    }

    function getDocument(bytes32 documentId) 
        public 
        view 
        documentExists(documentId) 
        returns (
            bytes32 hash,
            address owner,
            uint256 timestamp,
            Status status,
            uint256 expiryDate,
            string memory metadata,
            address verifier,
            string memory rejectionReason
        ) 
    {
        Document storage doc = documents[documentId];
        return (
            doc.documentHash,
            doc.owner,
            doc.timestamp,
            doc.status,
            doc.expiryDate,
            doc.metadata,
            doc.verifier,
            doc.rejectionReason
        );
    }

    function getUserDocuments(address user) external view returns (bytes32[] memory) {
        return userDocuments[user];
    }

    function getAllDocuments() external view returns (bytes32[] memory) {
        return allDocumentIds;
    }

    function addChecker(address _checker) external {
        require(msg.sender == checker, "Only admin can add checkers");
        require(!checkers[_checker], "Already a checker");
        checkers[_checker] = true;
        emit CheckerAdded(_checker);
    }

    function isChecker(address _address) external view returns (bool) {
        return checkers[_address] || _address == checker;
    }

    // Internal function to remove a document from pending array
    function _removeFromPendingArray(bytes32 documentId) internal {
        for (uint i = 0; i < pendingDocuments.length; i++) {
            if (pendingDocuments[i] == documentId) {
                pendingDocuments[i] = pendingDocuments[pendingDocuments.length - 1];
                pendingDocuments.pop();
                break;
            }
        }
    }
}


