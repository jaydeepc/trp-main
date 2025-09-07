// Voice Function Registry for Gemini Live Integration
// Handles automatic function calling based on voice input

import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { mockBOMAnalysisResults } from '../data/mockBOMData';
import {
    setLeadTime,
    setPaymentTerms,
    setDeliveryLocation,
    addComplianceRequirement,
    removeComplianceRequirement,
    setAdditionalRequirements,
} from '../store/rfqSlice';

export interface FunctionDefinition {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
    function: (args: any) => Promise<any> | any;
}

export interface ConversationState {
    uploadedFiles: UploadedFile[];
    currentView: string;
    currentStep: number;
    activeAnalysis: any;
    userPreferences: Record<string, any>;
    lastAction: string;
    context: Record<string, any>;
}

export interface UploadedFile {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: Date;
    status: 'uploading' | 'uploaded' | 'processing' | 'analyzed' | 'error';
    analysisResult?: any;
}

export interface StateUpdateCallbacks {
    voiceActionService: any;
    dispatch: any;
    setShowUploadForm: (show: boolean) => void;
    setCurrentStep: (step: number) => void;
    updateFiles: (files: UploadedFile[]) => void;
    showNotification: (
        message: string,
        type?: 'info' | 'success' | 'error'
    ) => void;
    setShowSystemInfo: (show: boolean) => void;
    setShowDetailModal: (featureId: string | null) => void;
    updateCommercialTermsField?: (field: string, value: any) => void;
    setCommercialTermsData?: (data: any) => void;
}

class VoiceFunctionRegistry {
    private functions: Map<string, FunctionDefinition> = new Map();
    private conversationState: ConversationState = {
        uploadedFiles: [],
        currentView: 'voice-landing',
        currentStep: 1,
        activeAnalysis: null,
        userPreferences: {},
        lastAction: '',
        context: {},
    };

    private callbacks: StateUpdateCallbacks | null = null;

    // Initialize the registry with callback functions from UI components
    initialize(callbacks: StateUpdateCallbacks) {
        this.callbacks = callbacks;
        this.registerDefaultFunctions();
    }

    // Register a new function
    registerFunction(definition: FunctionDefinition) {
        this.functions.set(definition.name, definition);
    }

    // Get all function definitions for Gemini Live
    getFunctionDefinitions(): FunctionDefinition[] {
        return Array.from(this.functions.values());
    }

    // Convert registry function definitions to Gemini Live format
    getGeminiFunctionDeclarations(): FunctionDeclaration[] {
        return Array.from(this.functions.values()).map((func) => ({
            name: func.name,
            description: func.description,
            parameters: {
                type: SchemaType.OBJECT,
                properties: func.parameters.properties,
                required: func.parameters.required,
            },
        }));
    }

    // Execute a function by name
    async executeFunction(name: string, parameters: any = {}) {
        const func = this.functions.get(name);
        if (!func) {
            console.error(`❌ Function ${name} not found in registry`);
            throw new Error(`Function ${name} not found`);
        }

        console.log(`🎯 FUNCTION CALL START: ${name}`);
        console.log(`📋 Parameters:`, parameters);
        console.log(`📝 Description: ${func.description}`);

        try {
            // Validate parameters
            this.validateParameters(parameters, func.parameters);
            console.log(`✅ Parameter validation passed for ${name}`);

            // Execute function
            console.log(`🔄 Executing function: ${name}...`);
            const startTime = Date.now();
            const result = await func.function(parameters);
            const duration = Date.now() - startTime;

            console.log(`✅ FUNCTION CALL SUCCESS: ${name} (${duration}ms)`);
            console.log(`📤 Result:`, result);

            // Update conversation state
            this.updateConversationState(name, parameters, result);

            return result;
        } catch (error) {
            console.error(`❌ FUNCTION CALL ERROR: ${name}`);
            console.error(`💥 Error details:`, error);
            console.error(`📋 Failed parameters:`, parameters);
            throw error;
        }
    }

    // Update conversation state after function execution
    private updateConversationState(
        functionName: string,
        parameters: any,
        result: any
    ) {
        this.conversationState.lastAction = functionName;
        this.conversationState.context = {
            ...this.conversationState.context,
            [functionName]: { parameters, result, timestamp: new Date() },
        };
    }

    // Get current conversation state (for context injection)
    getConversationState(): ConversationState {
        return { ...this.conversationState };
    }

    // Update conversation state from UI actions
    updateState(action: string, data: any) {
        switch (action) {
            case 'FILE_UPLOADED':
                // Check if file already exists, if not add it
                const existingFileIndex =
                    this.conversationState.uploadedFiles.findIndex(
                        (f) => f.id === data.id
                    );
                if (existingFileIndex >= 0) {
                    // Update existing file
                    this.conversationState.uploadedFiles[existingFileIndex] =
                        data;
                } else {
                    // Add new file
                    this.conversationState.uploadedFiles.push(data);
                }
                console.log(
                    'Updated uploaded files:',
                    this.conversationState.uploadedFiles
                );
                break;
            case 'FILES_UPDATED':
                // Replace entire files array
                this.conversationState.uploadedFiles = data;
                console.log(
                    'Replaced uploaded files:',
                    this.conversationState.uploadedFiles
                );
                break;
            case 'NAVIGATE_TO':
                this.conversationState.currentView = data.destination;
                break;
            case 'STEP_CHANGED':
                this.conversationState.currentStep = data.step;
                break;
            case 'ANALYSIS_COMPLETE':
                this.conversationState.activeAnalysis = data;
                break;
            default:
                this.conversationState.context[action] = data;
        }
    }

    // Validate function parameters
    private validateParameters(parameters: any, schema: any) {
        const required = schema.required || [];
        for (const param of required) {
            if (!(param in parameters)) {
                throw new Error(`Missing required parameter: ${param}`);
            }
        }
    }

    // Register default functions for Step 1
    private registerDefaultFunctions() {
        // UI Control Functions
        this.registerFunction({
            name: 'show_upload_form',
            description: 'Show the document upload form to the user',
            parameters: {
                type: 'object',
                properties: {
                    reason: {
                        type: 'string',
                        description: 'Reason for showing the upload form',
                    },
                    focus: {
                        type: 'boolean',
                        description: 'Whether to focus on the upload area',
                    },
                },
                required: [],
            },
            function: this.showUploadForm.bind(this),
        });

        this.registerFunction({
            name: 'show_bom_analysis',
            description:
                'Show the BOM analysis interface to review and analyze uploaded files',
            parameters: {
                type: 'object',
                properties: {
                    reason: {
                        type: 'string',
                        description: 'Reason for showing BOM analysis',
                    },
                },
                required: [],
            },
            function: this.showBOMAnalysis.bind(this),
        });

        this.registerFunction({
            name: 'show_commercial_terms',
            description:
                'Show the commercial terms interface to define payment and compliance requirements',
            parameters: {
                type: 'object',
                properties: {
                    reason: {
                        type: 'string',
                        description: 'Reason for showing commercial terms',
                    },
                },
                required: [],
            },
            function: this.showCommercialTerms.bind(this),
        });

        this.registerFunction({
            name: 'show_rfq_preview',
            description:
                'Show the RFQ preview interface to review and finalize the complete RFQ summary',
            parameters: {
                type: 'object',
                properties: {
                    reason: {
                        type: 'string',
                        description: 'Reason for showing RFQ preview',
                    },
                },
                required: [],
            },
            function: this.showRFQPreview.bind(this),
        });

        this.registerFunction({
            name: 'hide_rfq_preview',
            description: 'Hide the RFQ preview interface',
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
            function: this.hideRFQPreview.bind(this),
        });

        this.registerFunction({
            name: 'navigate_to',
            description: 'Navigate to different sections of the application',
            parameters: {
                type: 'object',
                properties: {
                    destination: {
                        type: 'string',
                        enum: [
                            'dashboard',
                            'rfq-wizard',
                            'bom-review',
                            'commercial-terms',
                            'preview',
                        ],
                        description: 'Where to navigate to',
                    },
                    step: {
                        type: 'number',
                        description:
                            'Specific step number (for wizard navigation)',
                    },
                },
                required: ['destination'],
            },
            function: this.navigateTo.bind(this),
        });

        // State Query Functions
        this.registerFunction({
            name: 'get_uploaded_files',
            description: 'Get information about files the user has uploaded',
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
            function: this.getUploadedFiles.bind(this),
        });

        this.registerFunction({
            name: 'get_current_view',
            description:
                'Get information about what the user is currently viewing',
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
            function: this.getCurrentView.bind(this),
        });

        this.registerFunction({
            name: 'get_conversation_context',
            description:
                'Get the current conversation context and application state',
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
            function: this.getConversationContext.bind(this),
        });

        // File Management Functions
        this.registerFunction({
            name: 'clear_uploaded_files',
            description: 'Clear all uploaded files and reset the upload state',
            parameters: {
                type: 'object',
                properties: {
                    confirm: {
                        type: 'boolean',
                        description: 'Confirmation to clear files',
                    },
                },
                required: ['confirm'],
            },
            function: this.clearUploadedFiles.bind(this),
        });

        this.registerFunction({
            name: 'show_system_info',
            description:
                'Show detailed information about the system when user asks about purpose, capabilities, "what do you do", "tell me about yourself", or similar queries about the system',
            parameters: {
                type: 'object',
                properties: {
                    query_type: {
                        type: 'string',
                        description:
                            'Type of query - purpose, about, capabilities, features, what_do_you_do',
                    },
                },
                required: [],
            },
            function: this.showSystemInfo.bind(this),
        });

        this.registerFunction({
            name: 'show_feature_details',
            description:
                'Show detailed information about a specific feature when user asks about voice interface, BOM analysis, supplier intelligence, compliance automation, cost optimization, global integration, file upload, or any specific system capability',
            parameters: {
                type: 'object',
                properties: {
                    feature_id: {
                        type: 'string',
                        enum: [
                            'voice-interface',
                            'bom-analysis',
                            'supplier-intelligence',
                            'compliance-automation',
                            'cost-optimization',
                            'global-integration',
                            'file-upload',
                            'system-info',
                        ],
                        description: 'The specific feature to show details for',
                    },
                    query_context: {
                        type: 'string',
                        description:
                            'Context of what the user is asking about this feature',
                    },
                },
                required: ['feature_id'],
            },
            function: this.showFeatureDetails.bind(this),
        });

        // Commercial Terms Functions
        this.registerFunction({
            name: 'set_lead_time',
            description:
                'Set the desired lead time for the commercial terms. Can be a preset option or custom value.',
            parameters: {
                type: 'object',
                properties: {
                    leadTime: {
                        type: 'string',
                        description:
                            'Lead time value (e.g., "2-4 weeks", "6-8 weeks", "10-12 weeks")',
                    },
                },
                required: ['leadTime'],
            },
            function: this.setLeadTime.bind(this),
        });

        this.registerFunction({
            name: 'set_payment_terms',
            description: 'Set the payment terms for the commercial terms.',
            parameters: {
                type: 'object',
                properties: {
                    paymentTerms: {
                        type: 'string',
                        enum: [
                            'Net 30',
                            'Net 60',
                            'Milestone-based',
                            '2/10 Net 30',
                            'Cash on Delivery',
                            'Letter of Credit',
                        ],
                        description: 'Payment terms option',
                    },
                },
                required: ['paymentTerms'],
            },
            function: this.setPaymentTerms.bind(this),
        });

        this.registerFunction({
            name: 'set_delivery_location',
            description: 'Set the delivery location for the commercial terms.',
            parameters: {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description:
                            'Delivery address or location (e.g., "San Francisco, CA, USA")',
                    },
                },
                required: ['location'],
            },
            function: this.setDeliveryLocation.bind(this),
        });

        this.registerFunction({
            name: 'add_compliance_requirement',
            description:
                'Add a compliance requirement to the commercial terms.',
            parameters: {
                type: 'object',
                properties: {
                    requirement: {
                        type: 'string',
                        enum: [
                            'ISO 9001',
                            'AS9100',
                            'ISO 14001',
                            'OHSAS 18001',
                            'RoHS',
                            'REACH',
                            'FDA',
                            'CE Marking',
                            'UL Listed',
                        ],
                        description: 'Compliance requirement to add',
                    },
                },
                required: ['requirement'],
            },
            function: this.addComplianceRequirement.bind(this),
        });

        this.registerFunction({
            name: 'remove_compliance_requirement',
            description:
                'Remove a compliance requirement from the commercial terms.',
            parameters: {
                type: 'object',
                properties: {
                    requirement: {
                        type: 'string',
                        enum: [
                            'ISO 9001',
                            'AS9100',
                            'ISO 14001',
                            'OHSAS 18001',
                            'RoHS',
                            'REACH',
                            'FDA',
                            'CE Marking',
                            'UL Listed',
                        ],
                        description: 'Compliance requirement to remove',
                    },
                },
                required: ['requirement'],
            },
            function: this.removeComplianceRequirement.bind(this),
        });

        this.registerFunction({
            name: 'set_additional_requirements',
            description:
                'Set additional requirements or special instructions for the commercial terms.',
            parameters: {
                type: 'object',
                properties: {
                    requirements: {
                        type: 'string',
                        description:
                            'Additional requirements or special instructions',
                    },
                },
                required: ['requirements'],
            },
            function: this.setAdditionalRequirements.bind(this),
        });
    }

    private async showUploadForm(args: { reason?: string; focus?: boolean }) {
        if (!this.callbacks) {
            throw new Error('Callbacks not initialized');
        }

        console.log(
            'Voice: Using voiceActionService to navigate to RFQ creation\nReason:',
            args.reason
        );

        // Use voiceActionService to handle navigation
        await this.callbacks.voiceActionService.executeVoiceCommand(
            'show_upload_form',
            args
        );

        return {
            message:
                "Perfect! I've opened the RFQ creation page where you can upload your documents. You can drag and drop files or click to browse and select your BOM or design files.",
        };
    }

    private async showBOMAnalysis(args: { reason?: string }) {
        if (!this.callbacks) {
            throw new Error('Callbacks not initialized');
        }

        console.log('showBOMAnalysis called with args:', args);
        console.log('Navigating to Step 2 BOM Analysis in main wizard');

        // Use voiceActionService to navigate to Step 2 in the main wizard
        await this.callbacks.voiceActionService.executeVoiceCommand(
            'navigate_to_step',
            { step: 2, destination: 'bom-analysis' }
        );

        // Also update internal state
        this.conversationState.currentStep = 2;
        this.updateState('STEP_CHANGED', { step: 2 });

        return {
            success: true,
            message:
                'Navigated to BOM Analysis step in the main wizard. You can now analyze your bill of materials and make any necessary adjustments.',
            action: 'show_bom_analysis',
            reason: args.reason || 'User requested BOM analysis',
        };
    }

    private async showCommercialTerms(args: { reason?: string }) {
        if (!this.callbacks) {
            throw new Error('Callbacks not initialized');
        }

        console.log('showCommercialTerms called with args:', args);
        console.log('Navigating to Step 3 Commercial Terms in main wizard');

        // Use voiceActionService to navigate to Step 3 in the main wizard
        await this.callbacks.voiceActionService.executeVoiceCommand(
            'navigate_to_step',
            { step: 3, destination: 'commercial-terms' }
        );

        // Also update internal state
        this.conversationState.currentStep = 3;
        this.updateState('STEP_CHANGED', { step: 3 });

        return {
            success: true,
            message:
                'Navigated to Commercial Terms step in the main wizard. You can now set up your payment terms, delivery location, and compliance requirements using the comprehensive form.',
            action: 'show_commercial_terms',
            reason: args.reason || 'User requested commercial terms',
        };
    }

    private async showRFQPreview(args: { reason?: string }) {
        if (!this.callbacks) {
            throw new Error('Callbacks not initialized');
        }

        console.log('showRFQPreview called with args:', args);
        console.log('Setting current step to 4');

        // Close other UI elements first
        this.callbacks.setShowSystemInfo(false);
        this.callbacks.setShowUploadForm(false);

        // Set current step to 4 for RFQ preview
        this.callbacks.setCurrentStep(4);

        // Also update internal state
        this.conversationState.currentStep = 4;
        this.updateState('STEP_CHANGED', { step: 4 });

        this.callbacks.showNotification(
            'RFQ Preview interface opened',
            'success'
        );

        return {
            success: true,
            message:
                'RFQ preview interface displayed. You can now review the complete summary of your request for quote.',
            action: 'show_rfq_preview',
            reason: args.reason || 'User requested RFQ preview',
        };
    }

    private async hideRFQPreview() {
        if (!this.callbacks) {
            throw new Error('Callbacks not initialized');
        }

        // Reset back to step 1
        this.callbacks.setCurrentStep(1);

        return {
            success: true,
            message: 'RFQ preview interface hidden',
            action: 'hide_rfq_preview',
        };
    }

    private async navigateTo(args: { destination: string; step?: number }) {
        if (!this.callbacks) {
            throw new Error('Callbacks not initialized');
        }

        // Use voiceActionService for external navigation, direct callbacks for internal navigation
        if (
            args.destination === 'dashboard' ||
            args.destination === 'create-rfq'
        ) {
            await this.callbacks.voiceActionService.executeVoiceCommand(
                'navigate_to',
                args
            );
        } else if (args.destination === 'bom-review') {
            this.callbacks.setCurrentStep(2);
        } else if (args.destination === 'commercial-terms') {
            this.callbacks.setCurrentStep(3);
        } else if (args.destination === 'preview') {
            this.callbacks.setCurrentStep(4);
        } else {
            throw new Error(`Invalid destination: ${args.destination}`);
        }

        // Update conversation state
        this.updateState('NAVIGATE_TO', { destination: args.destination });

        return {
            success: true,
            message: `Navigated to ${args.destination}`,
            destination: args.destination,
            step: args.step,
        };
    }

    private async getUploadedFiles() {
        return {
            files: this.conversationState.uploadedFiles.map((file) => ({
                id: file.id,
                name: file.name,
                type: file.type,
                size: file.size,
                uploadedAt: file.uploadedAt,
                status: file.status,
            })),
            count: this.conversationState.uploadedFiles.length,
            hasFiles: this.conversationState.uploadedFiles.length > 0,
        };
    }

    private async getCurrentView() {
        return {
            view: this.conversationState.currentView,
            step: this.conversationState.currentStep,
            availableActions: this.getAvailableActions(),
            context: this.conversationState.context,
        };
    }

    private async getConversationContext() {
        return {
            state: this.getConversationState(),
            availableActions: this.getAvailableActions(),
            recentActions: Object.keys(this.conversationState.context).slice(
                -5
            ),
        };
    }

    private async clearUploadedFiles(args: { confirm: boolean }) {
        if (!args.confirm) {
            return {
                success: false,
                message: 'Confirmation required to clear files',
                requiresConfirmation: true,
            };
        }

        this.conversationState.uploadedFiles = [];

        if (this.callbacks) {
            this.callbacks.updateFiles([]);
            this.callbacks.showNotification(
                'All uploaded files cleared',
                'info'
            );
        }

        return {
            success: true,
            message: 'All uploaded files cleared',
            filesCleared: true,
        };
    }

    private async showSystemInfo(args: { query_type?: string }) {
        if (!this.callbacks) {
            throw new Error('Callbacks not initialized');
        }

        console.log('showSystemInfo called with args:', args);

        // Show the SystemInfo floating window
        this.callbacks.setShowSystemInfo(true);

        this.callbacks.showNotification(
            'System information displayed',
            'success'
        );

        // Update conversation state to track this action
        this.updateState('SHOW_SYSTEM_INFO', { query_type: args.query_type });

        // Voice response that syncs exactly with popup sequence
        const systemResponse = `Hi! I'm Robbie, your AI-powered procurement assistant. I help organizations streamline procurement workflows through intelligent automation and voice interactions.

My Voice-First Interface uses Natural Language Processing. Talk to me naturally - no buttons, no complex menus needed.

Smart BOM Analysis with AI-powered cost optimization. I analyze your Bill of Materials in just 2.3 seconds with 94.2% accuracy.

Supplier Intelligence with 200+ pre-qualified suppliers. Real-time supplier scoring across multiple regions and industries.

Compliance Automation with a 99.1% success rate. Automated regulatory compliance checking across automotive, aerospace, and medical standards.

Cost Optimization delivering an average 12.8% cost reduction. Should-cost modeling with AI recommendations for measurable savings.

Global Integration that's enterprise-ready. Seamless integration with ERP, PLM, and procurement systems worldwide with 99.9% uptime SLA.

Live Supplier Intelligence Matrix with 8 suppliers showing cost versus trust visualization across North America, Europe, and Asia Pacific regions.

Performance Metrics include 94.2% AI recommendation accuracy and 4.8 out of 5 user satisfaction rating.

I'm powered by Google Gemini Live API. How can I help you today?`;

        return {
            success: true,
            message: systemResponse,
            action: 'show_system_info',
            query_type: args.query_type || 'general',
            shouldShowUI: true,
        };
    }

    private async showFeatureDetails(args: {
        feature_id: string;
        query_context?: string;
    }) {
        if (!this.callbacks) {
            throw new Error('Callbacks not initialized');
        }

        console.log('showFeatureDetails called with args:', args);

        // Close other UI elements first
        this.callbacks.setShowSystemInfo(false);
        this.callbacks.setShowUploadForm(false);

        // Show the DetailModal
        this.callbacks.setShowDetailModal(args.feature_id);

        // Store the feature request in the conversation state
        this.updateState('SHOW_FEATURE_DETAILS', {
            feature_id: args.feature_id,
            query_context: args.query_context,
        });

        this.callbacks.showNotification(
            `Detailed information about ${args.feature_id.replace(
                '-',
                ' '
            )} displayed`,
            'success'
        );

        // Create a detailed response based on the feature
        const featureResponses: Record<string, string> = {
            'voice-interface': `I'm showing you detailed information about our Voice-First Interface. This advanced system uses Google Gemini Live API for real-time speech recognition with 98.5% accuracy. It supports natural language understanding, multi-language support, and context-aware conversations. You can upload files, analyze BOMs, and navigate the entire system hands-free. The interface responds in under 200ms and supports unlimited concurrent sessions.`,

            'bom-analysis': `Here are the comprehensive details about our Smart BOM Analysis feature. This AI-powered system processes complex component lists in just 2.3 seconds with 94.2% accuracy. It provides automated component classification, real-time market price analysis, should-cost modeling, risk assessment, and alternative component suggestions. The system can handle over 10,000 components per analysis and covers 500+ component categories.`,

            'supplier-intelligence': `I'm displaying detailed information about our Supplier Intelligence platform. This system maintains real-time data on 200+ pre-qualified suppliers across 45+ countries. It features multi-dimensional trust scoring with 96.7% accuracy, geographic risk assessment, financial stability monitoring, and delivery performance analytics. The platform reduces supplier onboarding time by 60% and provides 99.9% data availability.`,

            'compliance-automation': `Here's comprehensive information about our Compliance Automation system. This engine automatically verifies components against 50+ industry standards with 99.1% success rate. It supports automotive IATF 16949, aerospace AS9100, medical ISO 13485, RoHS, and REACH regulations. The system generates automated documentation, provides real-time monitoring, and reduces compliance delays by 85%.`,

            'cost-optimization': `I'm showing you detailed information about our Cost Optimization engine. This AI-driven system uses should-cost modeling to identify savings opportunities with 91.5% prediction accuracy. It benchmarks against 1M+ component price points, provides real-time cost analysis, and delivers an average 12.8% cost reduction. The system includes ROI tracking and negotiation support with data insights.`,

            'global-integration': `Here are the comprehensive details about our Global Integration platform. This enterprise-grade system connects with 50+ ERP, PLM, and procurement systems worldwide. It features API-first architecture with REST/GraphQL support, real-time data synchronization, and 99.9% uptime SLA. Response times are under 100ms with unlimited API calls and enterprise security compliance.`,

            'file-upload': `I'm displaying detailed information about our Document Upload system. This advanced processor handles 15+ file formats including Excel, CSV, PDF, and XML with 99.2% data extraction accuracy. It supports files up to 100MB, processes them in 5-10 seconds, and includes drag-and-drop interface with progress tracking. The system provides automatic validation, batch processing, and secure cloud storage.`,

            'system-info': `Here's comprehensive information about our System Overview capabilities. This platform provides real-time performance monitoring, interactive demonstrations, live metrics dashboard, and feature usage tracking. It maintains 99.9% system availability with 94.2% overall AI accuracy and sub-second response times. The system supports enterprise-scale processing with 4.8/5 user satisfaction rating.`,
        };

        const response =
            featureResponses[args.feature_id] ||
            `I'm showing you detailed information about the ${args.feature_id.replace(
                '-',
                ' '
            )} feature. This comprehensive modal includes technical specifications, key benefits, use cases, performance metrics, and integration details.`;

        return {
            success: true,
            message: response,
            action: 'show_feature_details',
            feature_id: args.feature_id,
            query_context: args.query_context,
            shouldShowModal: true,
        };
    }

    private async sayHi(args: { greeting: string }) {
        console.log('hi');

        return {
            success: true,
            message: 'Function completed!',
            greeting: args.greeting,
            response: `Hello! You said: ${args.greeting}`,
        };
    }

    // Commercial Terms Function Implementations with Redux
    private async setLeadTime(args: { leadTime: string }) {
        if (!this.callbacks) {
            throw new Error('Callbacks not initialized');
        }

        // Dispatch Redux action directly
        this.callbacks.dispatch(setLeadTime(args.leadTime));

        return {
            success: true,
            message: `I've set the desired lead time to ${args.leadTime}. What would you like to set for payment terms?`,
            nextStep: 'payment_terms',
        };
    }

    private async setPaymentTerms(args: { paymentTerms: string }) {
        if (!this.callbacks) {
            throw new Error('Callbacks not initialized');
        }

        // Dispatch Redux action directly
        this.callbacks.dispatch(setPaymentTerms(args.paymentTerms));

        return {
            success: true,
            message: `Perfect! I've set payment terms to ${args.paymentTerms}. Now, where would you like the components delivered? Please provide the delivery location.`,
            nextStep: 'delivery_location',
        };
    }

    private async setDeliveryLocation(args: { location: string }) {
        if (!this.callbacks) {
            throw new Error('Callbacks not initialized');
        }

        // Dispatch Redux action directly
        this.callbacks.dispatch(setDeliveryLocation(args.location));

        return {
            success: true,
            message: `Great! I've set the delivery location to ${args.location}. Now let's discuss compliance requirements. Do you need any specific certifications like ISO 9001, AS9100, RoHS, REACH, or others? You can tell me which ones you need, or say "none" if no specific compliance is required.`,
            nextStep: 'compliance_requirements',
        };
    }

    private async addComplianceRequirement(args: { requirement: string }) {
        if (!this.callbacks) {
            throw new Error('Callbacks not initialized');
        }

        // Dispatch Redux action directly
        this.callbacks.dispatch(addComplianceRequirement(args.requirement));

        return {
            success: true,
            message: `I've added ${args.requirement} to your compliance requirements. Would you like to add any other compliance requirements, or shall we move on to additional requirements?`,
        };
    }

    private async removeComplianceRequirement(args: { requirement: string }) {
        if (!this.callbacks) {
            throw new Error('Callbacks not initialized');
        }

        // Dispatch Redux action directly
        this.callbacks.dispatch(removeComplianceRequirement(args.requirement));

        return {
            success: true,
            message: `I've removed ${args.requirement} from your compliance requirements.`,
        };
    }

    private async setAdditionalRequirements(args: { requirements: string }) {
        if (!this.callbacks) {
            throw new Error('Callbacks not initialized');
        }

        // Dispatch Redux action directly
        this.callbacks.dispatch(setAdditionalRequirements(args.requirements));

        return {
            success: true,
            message: `Perfect! I've recorded your additional requirements: "${args.requirements}". Let me summarize what we've configured for your commercial terms.`,
            nextStep: 'summary',
        };
    }

    private getAvailableActions(): string[] {
        const actions = [
            'say_hi',
            'show_upload_form',
            'hide_upload_form',
            'get_uploaded_files',
        ];

        if (this.conversationState.uploadedFiles.length > 0) {
            actions.push('clear_uploaded_files', 'navigate_to');
        }

        if (this.conversationState.currentView === 'voice-landing') {
            actions.push('navigate_to');
        }

        return actions;
    }
}

// Export singleton instance
export const voiceFunctionRegistry = new VoiceFunctionRegistry();
export default voiceFunctionRegistry;
