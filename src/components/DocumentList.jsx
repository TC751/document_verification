import React, { useState } from 'react';
import './DocumentVerification.css';

const DocumentList = ({ documents, contract, account, onDocumentUpdate }) => {
    const [processingTx, setProcessingTx] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const handleVerify = async (documentHash) => {
        if (!documentHash || processingTx) return;
        
        try {
            setProcessingTx(true);
            await contract.methods.approveDocument(documentHash)
                .send({ from: account });
            
            if (onDocumentUpdate) {
                await onDocumentUpdate();
            }
        } catch (error) {
            console.error('Error verifying document:', error);
        } finally {
            setProcessingTx(false);
        }
    };

    const openRejectModal = (documentHash) => {
        setSelectedDocument(documentHash);
        setShowRejectModal(true);
    };

    const handleReject = async () => {
        if (!selectedDocument || processingTx || !rejectionReason) return;
        
        try {
            setProcessingTx(true);
            await contract.methods.rejectDocument(selectedDocument, rejectionReason)
                .send({ from: account });
            
            if (onDocumentUpdate) {
                await onDocumentUpdate();
            }
            setShowRejectModal(false);
            setRejectionReason('');
            setSelectedDocument(null);
        } catch (error) {
            console.error('Error rejecting document:', error);
        } finally {
            setProcessingTx(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 0: return 'status-badge pending';
            case 1: return 'status-badge verified';
            case 2: return 'status-badge rejected';
            case 3: return 'status-badge expired';
            default: return 'status-badge';
        }
    };

    const getStatusText = (status) => {
        return ['Pending', 'Verified', 'Rejected', 'Expired'][status] || 'Unknown';
    };

    return (
        <div className="document-list">
            {documents.map((doc) => (
                <div key={doc.hash} className="document-item">
                    <div className="document-info">
                        <span className={getStatusBadgeClass(doc.status)}>
                            {getStatusText(doc.status)}
                        </span>
                        <p className="document-hash">Hash: {doc.hash}</p>
                        <p className="document-owner">Owner: {doc.owner}</p>
                        <p className="document-timestamp">
                            Submitted: {new Date(doc.timestamp * 1000).toLocaleString()}
                        </p>
                        {doc.rejectionReason && (
                            <p className="rejection-reason">
                                Rejection Reason: {doc.rejectionReason}
                            </p>
                        )}
                    </div>
                    
                    {doc.status === 0 && (
                        <div className="document-actions">
                            <button
                                onClick={() => handleVerify(doc.hash)}
                                disabled={processingTx}
                                className="verify-button"
                            >
                                {processingTx ? 'Processing...' : 'Verify'}
                            </button>
                            <button
                                onClick={() => openRejectModal(doc.hash)}
                                disabled={processingTx}
                                className="reject-button"
                            >
                                {processingTx ? 'Processing...' : 'Reject'}
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {showRejectModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Reject Document</h3>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter reason for rejection"
                            rows={4}
                            className="rejection-reason-input"
                        />
                        <div className="modal-actions">
                            <button
                                onClick={handleReject}
                                disabled={processingTx || !rejectionReason}
                                className="reject-button"
                            >
                                Confirm Rejection
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                    setSelectedDocument(null);
                                }}
                                disabled={processingTx}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentList;


