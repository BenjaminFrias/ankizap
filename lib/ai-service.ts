import { ActionState, SourceType } from '@/types/types';
import {
	ContentListUnion,
	createPartFromUri,
	createUserContent,
	FinishReason,
	GenerateContentConfig,
	GoogleGenAI,
	HarmBlockThreshold,
	HarmCategory,
	SchemaUnion,
} from '@google/genai';
import z from 'zod';

const API_KEY = process.env.AI_API_KEY;
export const ai = new GoogleGenAI({ apiKey: API_KEY });

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

interface FormatterInput {
	content: string;
	file?: {
		uri: string;
		mimeType: string;
	};
}

type ContentFormatter = (input: FormatterInput) => ContentListUnion;

const SOURCE_FORMATTER: Record<SourceType, ContentFormatter> = {
	['prompt']: (input) => [
		{ text: `User instruction to generate flashcards: ${input.content}` },
	],
	['link']: (input) => {
		const fileUri = input.file?.uri ?? input.content;
		const mimeType = input.file?.mimeType ?? 'video/*';
		const instructionText = input.content
			? `User instruction to generate flashcards: ${input.content}`
			: 'Create flashcards based on the video.';

		return [{ fileData: { fileUri, mimeType } }, { text: instructionText }];
	},
	['file']: (input) => {
		if (!input.file) throw new Error('File data is required.');

		return createUserContent([
			createPartFromUri(input.file.uri, input.file.mimeType),
			input.content,
		]);
	},
};

export async function callAI<T>(
	aiInstruction: string,
	userInstruction: string,
	schema: z.ZodType<T>,
	sourceType: SourceType = 'prompt',
	fileData?: { uri: string; mimeType: string },
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
		const formatter = SOURCE_FORMATTER[sourceType];

		const contents = formatter({ content: userInstruction, file: fileData });

		const response = await ai.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: contents,
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

		return {
			ok: false,
			error: 'Failed to generate flashcards. Please try again.',
		};
	}
}

export async function processAndUploadFileAI(
	fileBlob: Blob,
	fileName: string,
): Promise<{ uri: string; mimeType: string }> {
	const uploadResponse = await ai.files.upload({
		file: fileBlob,
		config: { displayName: fileName },
	});

	let file = uploadResponse;

	while (file.state === 'PROCESSING') {
		await new Promise((res) => setTimeout(res, 2000));

		file = await ai.files.get({ name: fileName });
	}

	if (file.state === 'FAILED') {
		throw new Error('File processing failed. Please try again.');
	}

	if (!file.uri || !file.mimeType) {
		throw new Error('File uploaded but metadata is missing.');
	}

	return {
		uri: file.uri,
		mimeType: file.mimeType,
	};
}
