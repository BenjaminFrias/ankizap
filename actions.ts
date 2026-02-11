'use server';

import { generateFlashcards, refineFlashcard } from './lib/flashcard-service';
import {
	ActionState,
	GenerationRequestSchema,
	GenerationResponse,
	RefineRequestSchema,
	RefineResponse,
} from './types/types';

export async function generateAction(
	prevState: ActionState<GenerationResponse>,
	formData: FormData,
): Promise<ActionState<GenerationResponse>> {
	const formRawData = Object.fromEntries(formData.entries());
	const formValidated = GenerationRequestSchema.safeParse(formRawData);

	if (!formValidated.success) {
		return {
			ok: false,
			error: formValidated.error.issues[0].message ?? 'Invalid input',
		};
	}

	try {
		const cardsResponse = await generateFlashcards(formValidated.data);

		if (!cardsResponse.ok) {
			return { ok: false, error: cardsResponse.error };
		}

		return { ok: true, data: cardsResponse.data };
	} catch (error) {
		console.error('Server action error: ', error);
		return {
			ok: false,
			error: 'A connection error occurred. Please try again',
		};
	}
}

export async function refineAction(
	prevState: ActionState<RefineResponse>,
	formData: FormData,
): Promise<ActionState<RefineResponse>> {
	const rawFormData = Object.fromEntries(formData.entries());

	const refineData = {
		flashcard: JSON.parse(rawFormData.flashcard as string),
		refineInstruction: rawFormData.refineInstruction,
	};

	const formValidated = RefineRequestSchema.safeParse(refineData);

	if (!formValidated.success) {
		return {
			ok: false,
			error: formValidated.error.issues[0].message ?? 'Invalid input',
		};
	}

	try {
		const cardResponse: ActionState<RefineResponse> = await refineFlashcard(
			formValidated.data,
		);

		if (!cardResponse) {
			return { ok: false, error: 'There was an error. Try again.' };
		}

		if (!cardResponse.ok) {
			return { ok: false, error: cardResponse.error };
		}
		console.log(cardResponse.data);

		return { ok: true, data: cardResponse.data };
	} catch (error) {
		console.error('Server action error: ', error);
		return {
			ok: false,
			error: 'A connection error occurred. Please try again',
		};
	}
}
