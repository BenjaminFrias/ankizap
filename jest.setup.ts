import '@testing-library/jest-dom';

jest.mock('@google/genai', () => {
	return {
		GoogleGenAI: jest.fn().mockImplementation(() => ({
			models: {
				generateContent: jest.fn().mockResolvedValue({
					text: '{}',
					candidates: [{ finishReason: 'STOP' }],
					promptFeedback: null,
				}),
			},
			files: {
				upload: jest.fn().mockResolvedValue({
					state: 'SUCCEEDED',
					uri: 'mock-uri',
					mimeType: 'text/plain',
				}),
				get: jest.fn().mockResolvedValue({
					state: 'SUCCEEDED',
					uri: 'mock-uri',
					mimeType: 'text/plain',
				}),
			},
		})),
		HarmBlockThreshold: { BLOCK_ONLY_HIGH: 'BLOCK_ONLY_HIGH' },
		HarmCategory: {
			HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
			HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
			HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
			HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
		},
		FinishReason: {
			STOP: 'STOP',
			SAFETY: 'SAFETY',
		},
		createUserContent: (parts: unknown) => parts,
		createPartFromUri: (uri: string, mimeType: string) => ({ uri, mimeType }),
	};
});
