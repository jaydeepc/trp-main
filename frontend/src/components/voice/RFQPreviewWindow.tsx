import React from 'react';
import FloatingWindow from '../common/FloatingWindow';
import RFQPreview from '../floating-windows/RFQPreview';

interface RFQPreviewWindowProps {
    onClose: () => void;
    onNext: () => void;
    uploadedFiles: any[];
}

const RFQPreviewWindow: React.FC<RFQPreviewWindowProps> = ({
    onClose,
    onNext,
    uploadedFiles
}) => {
    return (
        <FloatingWindow title="RFQ Preview" onClose={onClose}>
            <RFQPreview
                onNext={onNext}
                onCancel={onClose}
                bomData={uploadedFiles}
            />
        </FloatingWindow>
    );
};

export default RFQPreviewWindow;
