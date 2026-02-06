import {
	GenerationResponse,
	GenerationRequest,
	GenerationResponseSchema,
} from '@/types/types';
import {
	FinishReason,
	GoogleGenAI,
	HarmBlockThreshold,
	HarmCategory,
	Type,
} from '@google/genai';

const API_KEY = process.env.AI_API_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY });

type Result =
	| { ok: true; data: GenerationResponse }
	| { ok: false; error: string };

export async function generateFlashcards(
	FlashcardData: GenerationRequest,
): Promise<Result> {
	if (!API_KEY) {
		return { ok: false, error: 'Server configuration error: Missing API Key' };
	}

	const { inputContent, cardCount, cardType } = FlashcardData;

	const safetySettings = [
		{
			category: HarmCategory.HARM_CATEGORY_HARASSMENT,
			threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
		},
		{
			category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
			threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
		},
		{
			category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
			threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
		},
		{
			category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
			threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
		},
	];

	const configAI = {
		systemInstruction: `
        You are an expert educational designer specializing in spaced-repetition learning and the "20 Rules of Knowledge Formulation."
        Your task is to transform the provided source content into a highly effective Anki flashcard deck.

        ### TASK:
        Analyze the content above and generate exactly ${cardCount} flashcards.
       
        ### Strict Requirements:
        Quantity: Generate exactly ${cardCount} cards.
        Atomicity: Each card must cover only one distinct fact or concept. Avoid "list-style" cards.
        Language: Use the same language as the provided source text.
		For every card generated, the "type" field MUST be exactly "${cardType}".

        ### OUTPUT:
        The response MUST be a valid JSON array of objects strictly following the provided schema. No prose or introductory text.`,

		safetySettings: safetySettings,
		responseMimeType: 'application/json',
		responseSchema: {
			type: Type.ARRAY,
			description: 'A list of flashcards',
			items: {
				type: Type.OBJECT,
				properties: {
					id: {
						type: Type.INTEGER,
						description:
							'Assign a different, random and unique 5-character ID to each card.',
					},
					front: {
						type: Type.STRING,
					},
					back: {
						type: Type.STRING,
					},
					type: {
						type: Type.STRING,
						description: `Set this to ${cardType}`,
					},
				},
				propertyOrdering: ['id', 'front', 'back', 'type'],
			},
		},
	};

	try {
		const response = await ai.models.generateContent({
			model: 'gemini-flash-latest',
			contents: [{ text: `SOURCE CONTENT: ${inputContent}` }],
			config: configAI,
		});

		if (!response || !response.text) {
			return { ok: false, error: 'Flashcards generation failed.' };
		}

		if (response.promptFeedback?.blockReason) {
			return {
				ok: false,
				error: 'Prompt blocked: your input content was flagged as unsafe.',
			};
		}

		if (!response.candidates || response.candidates.length === 0) {
			return { ok: false, error: 'Failed to generate flashcards.' };
		}

		const firstCandidate = response.candidates[0];

		if (firstCandidate.finishReason !== FinishReason.STOP) {
			if (firstCandidate.finishReason === FinishReason.SAFETY) {
				return {
					ok: false,
					error: 'AI generation blocked due to safety reasons.',
				};
			} else {
				return {
					ok: false,
					error: `AI generation stopped due to ${firstCandidate.finishReason}.`,
				};
			}
		}

		// Validate AI JSON format using zod and avoid possible hallutinations
		try {
			const rawJSON = JSON.parse(response.text);

			const validation = GenerationResponseSchema.safeParse(rawJSON);

			if (!validation.success) {
				return { ok: false, error: 'AI generation failed. Please try again.' };
			}

			return { ok: true, data: validation.data };
		} catch {
			return {
				ok: false,
				error: 'The AI returned an invalid format. Please try again.',
			};
		}
	} catch (error) {
		console.log('API error: ', error);

		if (error && typeof error === 'object' && 'status' in error) {
			if (error.status === 429) {
				return {
					ok: false,
					error: 'Rate limit exceeded. Please wait a moment.',
				};
			}
		}

		return { ok: false, error: 'Failed to reach API.' };
	}
}
