import { RootState } from '../store';

export const generateContextMessage = (state: RootState): string => {
    const { currentStep, rfqData, commercialTerms, uploadedFiles } = state.rfq;

    // Base greeting
    let message = 'User Message: Hello Robbie!';

    // Add context summary
    switch (currentStep) {
        case 1:
            message += '\n\n\nContext: ';
            message += getStep1Context(uploadedFiles, rfqData);
            break;
        case 2:
            message += '\n\n\nContext: ';
            message += getStep2Context(rfqData, commercialTerms);
            break;
        case 3:
            message += '\n\n\nContext: ';
            message += getStep3Context(rfqData);
            break;
        default:
    }

    return message;
};

const getStep1Context = (uploadedFiles: any[], rfqData: any): string => {
    const hasExtractedData = rfqData?.analysisData?.components?.length > 0;
    const componentCount = rfqData?.analysisData?.components?.length || 0;

    let context = `User is on Step 1 (Upload & Extract Documents). `;

    if (hasExtractedData) {
        context += `Files uploaded and ${componentCount} components extracted.\n\n`;
        context += `Extracted Data:\n${JSON.stringify(
            rfqData.analysisData,
            null,
            2
        )}`;
    } else if (uploadedFiles?.length > 0) {
        context += `${uploadedFiles.length} file(s) uploaded, extraction pending.`;
    } else {
        context += `No files uploaded yet.\n\nRFQ Data: None yet`;
    }

    return context;
};

const getStep2Context = (rfqData: any, commercialTerms: any): string => {
    const componentCount = rfqData?.analysisData?.components?.length || 0;
    const hasLeadTime = !!commercialTerms.desiredLeadTime;
    const hasCompliance = commercialTerms.complianceRequirements?.length > 0;
    const hasPriority = !!commercialTerms.supplierPriority;

    let context = `User is on Step 2 (Define Requirements). ${componentCount} components extracted.\n\n`;

    context += `Current State:\n`;
    context += `- Step: 2\n`;
    context += `- Page: Requirements Form\n`;
    context += `- Components Extracted: \n${JSON.stringify(
        rfqData?.analysisData || [],
        null,
        2
    )}\n`;
    context += `- Requirements Status:\n`;
    context += `  - Lead Time: ${
        hasLeadTime ? commercialTerms.desiredLeadTime : 'Not Set'
    }\n`;
    context += `  - Compliance: ${
        hasCompliance
            ? commercialTerms.complianceRequirements.join(', ')
            : 'Not Set'
    }\n`;
    context += `  - Supplier Priority: ${hasPriority ? 'Set' : 'Not Set'}\n\n`;

    return context;
};

const getStep3Context = (rfqData: any): string => {
    const hasBOMAnalysis = rfqData?.boms?.length > 0;

    if (!hasBOMAnalysis) {
        return `User is on Step 3 (Smart BOM Review), but no analysis results available yet.`;
    }

    const components = rfqData.boms[0]?.components || [];
    const componentCount = components.length;
    const totalAlternatives = components.reduce((sum: number, comp: any) => {
        return sum + (comp.alternatives?.length || 0);
    }, 0);

    let context = `User is on Step 3 (Smart BOM Review). ${componentCount} components analyzed with ${totalAlternatives} alternatives.\n\n`;

    context += `Current State:\n`;
    context += `- Step: 3\n`;
    context += `- Page: BOM Analysis\n`;
    context += `- BOM: \n${JSON.stringify(rfqData.boms[0] || {}, null, 2)}\n`;

    // Include complete BOM data
    context += `Complete BOM Data:\n${JSON.stringify(
        rfqData.boms[0],
        null,
        2
    )}\n\n`;

    // Include complete RFQ data
    context += `Complete RFQ Data:\n${JSON.stringify(rfqData, null, 2)}`;

    return context;
};
