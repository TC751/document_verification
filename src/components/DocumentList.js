import React, { useState, useEffect } from 'react';

const DocumentList = ({ contract, account }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [contract, account]);

  const fetchDocuments = async () => {
    if (!contract || !account) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      const docIds = await contract.methods.getUserDocuments().call({ from: account });
      const docs = await Promise.all(
        docIds.map(id => contract.methods.getDocument(id).call())
      );
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      '0': 'Pending',
      '1': 'Verified',
      '2': 'Rejected'
    };
    return statusMap[status] || 'Unknown';
  };

  if (loading) {
    return <div className="loading">Loading documents...</div>;
  }

  return (
    <div className="document-list">
      <h3>My Documents</h3>
      <div className="documents-grid">
        {documents.map((doc, index) => (
          <div key={index} className="document-item">
            <div className="document-info">
              <div className="document-hash">
                {`${doc.documentHash.substring(0, 6)}...${doc.documentHash.substring(62)}`}
              </div>
              <div className={`document-status status-${getStatusText(doc.status).toLowerCase()}`}>
                Status: {getStatusText(doc.status)}
              </div>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="no-documents">You haven't submitted any documents yet.</div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;

