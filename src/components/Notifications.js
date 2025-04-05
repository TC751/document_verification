import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

const Notifications = ({ contract }) => {
  useEffect(() => {
    if (!contract) return;

    const handleDocumentVerified = (error, event) => {
      if (error) {
        console.error("Error in DocumentVerified event:", error);
        return;
      }
      const { documentId, verifier } = event.returnValues;
      toast.success(`Document ${documentId} verified by ${verifier}`);
    };

    const handleDocumentRejected = (error, event) => {
      if (error) {
        console.error("Error in DocumentRejected event:", error);
        return;
      }
      const { documentId, verifier } = event.returnValues;
      toast.error(`Document ${documentId} rejected by ${verifier}`);
    };

    // Set up event subscriptions using Web3.js syntax
    const verifiedSubscription = contract.events.DocumentVerified({})
      .on('data', event => handleDocumentVerified(null, event))
      .on('error', error => handleDocumentVerified(error, null));

    const rejectedSubscription = contract.events.DocumentRejected({})
      .on('data', event => handleDocumentRejected(null, event))
      .on('error', error => handleDocumentRejected(error, null));

    // Cleanup function
    return () => {
      verifiedSubscription.unsubscribe();
      rejectedSubscription.unsubscribe();
    };
  }, [contract]);

  return null; // This component doesn't render anything
};

export default Notifications;


