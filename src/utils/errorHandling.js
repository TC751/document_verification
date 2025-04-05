export const handleContractError = (error) => {
    if (error.code === 'ACTION_REJECTED') {
        return 'Transaction was rejected by user';
    }
    
    if (error.code === -32603) {
        if (error.message.includes('insufficient funds')) {
            return 'Insufficient funds for transaction';
        }
        if (error.message.includes('nonce too low')) {
            return 'Transaction nonce error. Please reset your MetaMask account';
        }
    }

    if (error.message.includes('Document already exists')) {
        return 'This document has already been registered';
    }

    return error.message || 'An unexpected error occurred';
};

export const validateDocument = (file) => {
    const errors = [];
    
    if (!file) {
        errors.push('No file selected');
        return errors;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        errors.push('File size must be less than 10MB');
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        errors.push('File type not supported. Please use PDF or common image formats');
    }

    return errors;
};