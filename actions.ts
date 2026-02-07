'use server';

import { generateFlashcards } from './lib/generateFlashcards';
import { ActionState, GenerationRequestSchema } from './types/types';

export async function generateAction(
	prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
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
