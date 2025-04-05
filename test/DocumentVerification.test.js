const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DocumentVerification", function () {
    let DocumentVerification;
    let documentVerification;
    let owner;
    let verifier;
    let user;
    let user2;

    beforeEach(async function () {
        [owner, verifier, user, user2] = await ethers.getSigners();
        DocumentVerification = await ethers.getContractFactory("DocumentVerification");
        documentVerification = await DocumentVerification.deploy();
        await documentVerification.deployed();
    });

    describe("Access Control", function () {
        it("Should only allow owner to add verifiers", async function () {
            await expect(
                documentVerification.connect(user).addVerifier(verifier.address, "Test Verifier")
            ).to.be.revertedWith("Only owner can perform this action");
        });

        it("Should only allow active verifiers to verify documents", async function () {
            const documentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test document"));
            await documentVerification.connect(user).registerDocument(documentHash, "test metadata");
            
            await expect(
                documentVerification.connect(user).updateStatus(documentHash, 1)
            ).to.be.revertedWith("Only active verifiers can perform this action");
        });
    });

    describe("Document Management", function () {
        beforeEach(async function () {
            await documentVerification.addVerifier(verifier.address, "Test Verifier");
        });

        it("Should not allow duplicate document registration", async function () {
            const documentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test document"));
            await documentVerification.connect(user).registerDocument(documentHash, "test metadata");
            
            await expect(
                documentVerification.connect(user).registerDocument(documentHash, "test metadata")
            ).to.be.revertedWith("Document already exists");
        });

        it("Should emit DocumentRegistered event with correct parameters", async function () {
            const documentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test document"));
            
            await expect(documentVerification.connect(user).registerDocument(documentHash, "test metadata"))
                .to.emit(documentVerification, "DocumentRegistered")
                .withArgs(documentHash, user.address, await time.latest() + 1, await time.latest() + 365 * 24 * 60 * 60 + 1);
        });

        it("Should allow updating document status only once", async function () {
            const documentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test document"));
            await documentVerification.connect(user).registerDocument(documentHash, "test metadata");
            
            await documentVerification.connect(verifier).updateStatus(documentHash, 1);
            
            await expect(
                documentVerification.connect(verifier).updateStatus(documentHash, 2)
            ).to.be.revertedWith("Document status cannot be changed");
        });
    });

    describe("Gas Optimization Tests", function () {
        it("Should efficiently handle multiple document registrations", async function () {
            const documentHashes = Array(5).fill().map((_, i) => 
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`test document ${i}`))
            );
            
            for (const hash of documentHashes) {
                const tx = await documentVerification.connect(user).registerDocument(hash, "test metadata");
                const receipt = await tx.wait();
                expect(receipt.gasUsed).to.be.below(200000); // Adjust threshold as needed
            }
        });

        it("Should efficiently handle multiple status updates", async function () {
            await documentVerification.addVerifier(verifier.address, "Test Verifier");
            const documentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test document"));
            await documentVerification.connect(user).registerDocument(documentHash, "test metadata");
            
            const tx = await documentVerification.connect(verifier).updateStatus(documentHash, 1);
            const receipt = await tx.wait();
            expect(receipt.gasUsed).to.be.below(100000); // Adjust threshold as needed
        });
    });

    describe("Edge Cases", function () {
        it("Should handle empty metadata", async function () {
            const documentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test document"));
            await documentVerification.connect(user).registerDocument(documentHash, "");
            
            const document = await documentVerification.getDocument(documentHash);
            expect(document.metadata).to.equal("");
        });

        it("Should handle maximum metadata size", async function () {
            const documentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test document"));
            const longMetadata = "x".repeat(1000); // Adjust size as needed
            
            await documentVerification.connect(user).registerDocument(documentHash, longMetadata);
            
            const document = await documentVerification.getDocument(documentHash);
            expect(document.metadata).to.equal(longMetadata);
        });
    });

    it("Should register a document successfully", async function () {
        const documentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test document"));
        const tx = await documentVerification.connect(user).registerDocument(
            documentHash,
            "test metadata"
        );
        
        console.log("Transaction:", {
            hash: tx.hash,
            from: tx.from,
            to: tx.to
        });

        const document = await documentVerification.getDocument(documentHash);
        console.log("Document:", {
            owner: document.owner,
            metadata: document.metadata,
            status: document.status
        });

        expect(document.owner).to.equal(user.address);
    });

    describe("Event Testing", function () {
        it("Should emit correct events with proper parameters", async function () {
            const documentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test document"));

            // Test DocumentRegistered event
            await expect(documentVerification.connect(user).registerDocument(documentHash, "test metadata"))
                .to.emit(documentVerification, "DocumentRegistered")
                .withArgs(documentHash, user.address);

            // Test StatusUpdated event
            await documentVerification.addVerifier(verifier.address, "Test Verifier");
            await expect(documentVerification.connect(verifier).updateStatus(documentHash, 1))
                .to.emit(documentVerification, "StatusUpdated")
                .withArgs(documentHash, 1, verifier.address);

            // Test multiple events in one transaction
            await expect(documentVerification.addVerifier(user2.address, "New Verifier"))
                .to.emit(documentVerification, "VerifierAdded")
                .withArgs(user2.address, "New Verifier")
                .and.to.emit(documentVerification, "RoleGranted");
        });
    });

    describe("Error Handling", function () {
        it("Should handle invalid inputs properly", async function () {
            // Test empty document hash
            await expect(
                documentVerification.connect(user).registerDocument(
                    ethers.constants.HashZero,
                    "test metadata"
                )
            ).to.be.revertedWith("Invalid document hash");

            // Test empty metadata
            const validHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("valid document"));
            await documentVerification.connect(user).registerDocument(validHash, "");
            const document = await documentVerification.getDocument(validHash);
            expect(document.metadata).to.equal("");

            // Test invalid status
            await documentVerification.addVerifier(verifier.address, "Test Verifier");
            await expect(
                documentVerification.connect(verifier).updateStatus(validHash, 5)
            ).to.be.revertedWith("Invalid status code");
        });
    });
});




