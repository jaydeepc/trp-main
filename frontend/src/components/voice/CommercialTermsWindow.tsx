import React from 'react';
import FloatingWindow from '../common/FloatingWindow';
import CommercialTerms from '../floating-windows/CommercialTerms';

interface CommercialTermsWindowProps {
    onClose: () => void;
    onNext: () => void;
    uploadedFiles: any[];
}

const CommercialTermsWindow: React.FC<CommercialTermsWindowProps> = ({
    onClose,
    onNext,
    uploadedFiles
}) => {
    return (
        <FloatingWindow title="Commercial Terms" onClose={onClose}>
            <CommercialTerms
                onNext={onNext}
                onCancel={onClose}
                bomData={uploadedFiles}
            />
        </FloatingWindow>
    );
};

export default CommercialTermsWindow;
