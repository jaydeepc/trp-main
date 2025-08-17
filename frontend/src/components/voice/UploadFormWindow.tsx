import React from 'react';
import FloatingWindow from '../common/FloatingWindow';
import FileUpload from '../floating-windows/FileUpload';

interface UploadFormWindowProps {
    onClose: () => void;
    onFilesChange?: (files: any[]) => void;
}

const UploadFormWindow: React.FC<UploadFormWindowProps> = ({
    onClose,
    onFilesChange
}) => {
    const handleNext = () => {
        onClose();
    };

    const handleFilesChange = (files: any[]) => {
        if (onFilesChange) {
            // Convert FileUpload files to voice function registry format
            const voiceFiles = files.map((file) => ({
                id: file.id,
                name: file.name,
                type: file.file.type,
                size: file.size,
                uploadedAt: new Date(),
                status: file.status === 'complete' ? ('uploaded' as const) : ('uploading' as const),
            }));
            onFilesChange(voiceFiles);
        }
    };

    return (
        <FloatingWindow title="File Upload" onClose={onClose}>
            <FileUpload
                onNext={handleNext}
                onCancel={onClose}
                onFilesChange={handleFilesChange}
            />
        </FloatingWindow>
    );
};

export default UploadFormWindow;
