import React from 'react';
import FloatingWindow from '../common/FloatingWindow';
import BOMAnalysis from '../floating-windows/BOMAnalysis';

interface BOMAnalysisWindowProps {
    onClose: () => void;
    uploadedFiles: any[];
}

const BOMAnalysisWindow: React.FC<BOMAnalysisWindowProps> = ({
    onClose,
    uploadedFiles
}) => {
    const handleNext = () => {
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <FloatingWindow title="BOM Analysis" onClose={handleCancel}>
            <BOMAnalysis
                onNext={handleNext}
                onCancel={handleCancel}
                uploadedFiles={uploadedFiles}
            />
        </FloatingWindow>
    );
};

export default BOMAnalysisWindow;
