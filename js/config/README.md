# Create config.js file here but make sure to add it to the .gitignore file

```javascript

export const CONFIG = {
    // Get you free API key from [Google AI Studio](https://aistudio.google.com/apikey)
    API: {
        KEY: 'YOUR_API_KEY_FROM_GOOGLE_AI_STUDIO',
        BASE_URL: 'wss://generativelanguage.googleapis.com/ws', // Default base URL for Gemini API  
        VERSION: 'v1alpha', // Default version for Gemini API
        MODEL_NAME: 'models/gemini-2.0-flash-exp' // Current model with Multimodal Live support
    },
    // You can change the system instruction to your liking
    SYSTEM_INSTRUCTION: {
        PARTS: [
            {
                text: 'You are my helpful assistant. You can see and hear me, and respond with voice and text. If you are asked about things you do not know, you can use the google search tool to find the answer.',
            },
        ],
    },  
    // Model's voice
    VOICE: {
        NAME: 'Aoede' // You can choose one from: Puck, Charon, Kore, Fenrir, Aoede (Kore and Aoede are female voices, rest are male)
    },  
    // Default audio settings
    AUDIO: {
        SAMPLE_RATE: 16000,
        BUFFER_SIZE: 2048,
        CHANNELS: 1
    },
    TOOLS: {
        // Add tool-specific configurations here if needed
    },
    // If you are working in the RoArm branch 
    // ROARM: {
        // IP_ADDRESS: '192.168.1.4'
    // }
};

export default CONFIG; 

```
