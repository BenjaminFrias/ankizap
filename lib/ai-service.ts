import { ActionState } from '@/types/types';
import {
	FinishReason,
	GenerateContentConfig,
	GoogleGenAI,
	HarmBlockThreshold,
	HarmCategory,
	SchemaUnion,
} from '@google/genai';
import z from 'zod';

const API_KEY = process.env.AI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

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

const GENERAL_INSTRUCTION =
	'You are an expert educational designer specializing in spaced-repetition learning and the "20 Rules of Knowledge Formulation."';

export async function callAI<T>(
	aiInstruction: string,
	userInstruction: string,
	schema: z.ZodType<T>,
): Promise<ActionState<T>> {
	if (!API_KEY) {
		console.error('Server configuration error: Missing API Key.');
		return { ok: false, error: 'Server error, Please try again later.' };
	}

	const responseSchema = z.toJSONSchema(schema);

	const systemInstruction = GENERAL_INSTRUCTION + ' ' + aiInstruction;
	const aiConfig: GenerateContentConfig = {
		systemInstruction: systemInstruction,
		safetySettings: safetySettings,
		responseMimeType: 'application/json',
		responseSchema: responseSchema as SchemaUnion,
		temperature: 0.7,
	};

	try {
		const response = await ai.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: [{ text: userInstruction }],
			config: aiConfig,
		});

		if (!response?.text || !response.candidates?.length) {
			return { ok: false, error: 'Flashcards generation failed.' };
		}

		if (response.promptFeedback?.blockReason) {
			return {
				ok: false,
				error: 'Prompt blocked: your input content was flagged as unsafe.',
			};
		}

		const candidate = response.candidates[0];
		if (candidate.finishReason !== FinishReason.STOP) {
			const reason =
				candidate.finishReason === FinishReason.SAFETY
					? 'safety reasons'
					: candidate.finishReason;

			return {
				ok: false,
				error: `AI generation stopped due to ${reason}.`,
			};
		}

		// JSON & ZOD validation
		try {
			const rawJSON = JSON.parse(response.text);
			const validation = schema.safeParse(rawJSON);

			if (!validation.success) {
				return { ok: false, error: 'AI generation failed. Please try again.' };
			}

			return { ok: true, data: validation.data as T };
		} catch (error) {
			console.error('AI returned an invalid format: ', error);
			return { ok: false, error: 'AI generation failed. Please try again.' };
		}
	} catch (error: unknown) {
		console.error('AI service error: ', error);

		if (error && typeof error === 'object' && 'status' in error) {
			if (error.status === 429)
				return {
					ok: false,
					error: 'Rate limit exceeded! Try again in a few seconds.',
				};
			if (error.status === 400)
				return { ok: false, error: 'Invalid request parameters.' };
		}

		return { ok: false, error: 'Failed to reach AI.' };
	}
}
