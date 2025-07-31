import {
  AvatarQuality,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from '@heygen/streaming-avatar';

export const AVATARS = [
  {
      avatar_id: 'Graham_Black_Suit_public',
      name: 'Graham',
  },
  {
      avatar_id: 'Anna_public_3_20240108',
      name: 'Anna',
  },
  {
      avatar_id: 'Eric_public_pro2_20230608',
      name: 'Eric',
  },
  {
      avatar_id: 'Tyler-incasualsuit-20220721',
      name: 'Tyler',
  },
];

export const DEFAULT_AVATAR_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Low,
  avatarName: AVATARS[0].avatar_id,
  knowledgeId: undefined, // Explicitly disable knowledge base
  voice: {
      rate: 1.2,
      emotion: VoiceEmotion.FRIENDLY,
      model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: 'en',
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
      provider: STTProvider.DEEPGRAM,
  },
  disableIdleTimeout: true, // Keep avatar active
};

export const ROBBIE_PERSONALITY = {
  greeting:
      "Hi! I'm Robbie, your AI procurement assistant. I'm here to help you create smart RFQs and optimize your procurement process. How can I assist you today?",
  helpPrompts: [
      'I can help you create a new RFQ',
      'Upload and analyze your BOM or design files',
      'Find the best suppliers for your requirements',
      'Set up commercial terms and compliance requirements',
      'Review your procurement analytics',
  ],
  conversationStarters: [
      "Let's create a new procurement request",
      'I need help with supplier selection',
      'Can you analyze my BOM?',
      'Show me my procurement dashboard',
  ],
};