import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CommercialTermsData {
    desiredLeadTime: string;
    paymentTerms: string;
    deliveryLocation: string;
    complianceRequirements: string[];
    additionalRequirements: string;
}

export interface CommercialTermsContextType {
    formData: CommercialTermsData;
    updateField: (field: keyof CommercialTermsData, value: any) => void;
    setFormData: (data: Partial<CommercialTermsData>) => void;
    resetForm: () => void;
}

const defaultFormData: CommercialTermsData = {
    desiredLeadTime: '',
    paymentTerms: 'Net 30',
    deliveryLocation: '',
    complianceRequirements: [],
    additionalRequirements: '',
};

const CommercialTermsContext = createContext<CommercialTermsContextType | undefined>(undefined);

export const useCommercialTermsContext = () => {
    const context = useContext(CommercialTermsContext);
    if (!context) {
        throw new Error('useCommercialTermsContext must be used within a CommercialTermsProvider');
    }
    return context;
};

interface CommercialTermsProviderProps {
    children: ReactNode;
}

export const CommercialTermsProvider: React.FC<CommercialTermsProviderProps> = ({ children }) => {
    const [formData, setFormDataState] = useState<CommercialTermsData>(defaultFormData);

    const updateField = (field: keyof CommercialTermsData, value: any) => {
        setFormDataState(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const setFormData = (data: Partial<CommercialTermsData>) => {
        setFormDataState(prev => ({
            ...prev,
            ...data,
        }));
    };

    const resetForm = () => {
        setFormDataState(defaultFormData);
    };

    const contextValue: CommercialTermsContextType = {
        formData,
        updateField,
        setFormData,
        resetForm,
    };

    return (
        <CommercialTermsContext.Provider value={contextValue}>
            {children}
        </CommercialTermsContext.Provider>
    );
};
