import voiceAppCommandBus from './VoiceAppCommandBus';

class VoiceActionService {
    // Simple initialization - just register with command bus
    initialize() {
        console.log('Voice Action Service initialized with Command Bus');

        // Register to receive feedback from app
        voiceAppCommandBus.registerVoiceFeedback(
            this.handleAppFeedback.bind(this)
        );
    }

    // Handle voice commands with simple if-else logic
    async executeVoiceCommand(functionName: string, params: any = {}) {
        console.log(`Voice Action Service: Executing ${functionName}`, params);

        // Simple if-else logic for different voice commands
        if (functionName === 'show_upload_form') {
            return await voiceAppCommandBus.executeAppCommand('createRFQ');
        } else if (functionName === 'analyse_bom') {
            return await voiceAppCommandBus.executeAppCommand(
                'analyzeBOM',
                params
            );
        } else if (functionName === 'set_lead_time') {
            return await voiceAppCommandBus.executeAppCommand(
                'updateLeadTime',
                { value: params.leadTime }
            );
        } else if (functionName === 'set_payment_terms') {
            return await voiceAppCommandBus.executeAppCommand(
                'updatePaymentTerms',
                { value: params.paymentTerms }
            );
        } else if (functionName === 'set_delivery_location') {
            return await voiceAppCommandBus.executeAppCommand(
                'updateDeliveryLocation',
                { value: params.location }
            );
        } else if (functionName === 'show_bom_analysis') {
            return await voiceAppCommandBus.executeAppCommand(
                'showBOMAnalysis',
                params
            );
        } else if (functionName === 'show_commercial_terms') {
            return await voiceAppCommandBus.executeAppCommand(
                'showCommercialTerms',
                params
            );
        } else if (functionName === 'show_rfq_preview') {
            return await voiceAppCommandBus.executeAppCommand(
                'showRFQPreview',
                params
            );
        } else if (functionName === 'show_system_info') {
            return await voiceAppCommandBus.executeAppCommand(
                'showSystemInfo',
                params
            );
        } else {
            console.warn(`Unknown voice command: ${functionName}`);
            return {
                success: false,
                message: `Unknown command: ${functionName}`,
            };
        }
    }

    // Handle feedback from app (bidirectional communication)
    handleAppFeedback(event: string, data: any, context: any) {
        console.log(
            `Voice Action Service: Received app feedback '${event}'`,
            data
        );

        // Simple if-else logic for different app events
        if (event === 'fileUploaded') {
            console.log('File uploaded, voice can inform user');
        } else if (event === 'analysisCompleted') {
            console.log('Analysis completed, voice can share results');
        } else if (event === 'formFieldUpdated') {
            console.log('Form field updated, voice can confirm');
        } else if (event === 'navigationCompleted') {
            console.log('Navigation completed, voice context updated');
        } else {
            console.log(`Unhandled app feedback: ${event}`);
        }
    }

    // Get current context from command bus
    getContext() {
        return voiceAppCommandBus.getContext();
    }

    // Debug info
    getDebugInfo() {
        return voiceAppCommandBus.getDebugInfo();
    }
}

// Export singleton instance
export const voiceActionService = new VoiceActionService();
export default voiceActionService;
