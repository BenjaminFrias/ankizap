import { z } from 'zod';

export const CardType = ['basic', 'reversed'] as const;

export const FlashcardSchema = z.object({
	id: z.string().length(5).describe('A unique 5-character ID'),
	front: z.string().min(1, 'The front is required'),
	back: z.string().min(1, 'The back is required'),
	type: z.enum(CardType),
});

export const FlashcardArraySchema = z.array(FlashcardSchema);
export type Flashcard = z.infer<typeof FlashcardSchema>;

export const GenerationResponseSchema = z.array(FlashcardSchema);
export type GenerationResponse = z.infer<typeof GenerationResponseSchema>;

export const GenerationRequestSchema = z.object({
	inputContent: z.string().min(10, 'Content must be at least 10 characters.'),
	cardCount: z.coerce
		.number()
		.min(1, 'Please select at least 1 card to generate.')
		.max(30, 'Limit is 30 cards per generation'),
	cardType: z.enum(CardType),
});
export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;

export const RefineRequestSchema = z.object({
	flashcard: FlashcardSchema,
	userInstruction: z.string().min(5, 'Please write a valid refine prompt.'),
});
export type RefineRequest = z.infer<typeof RefineRequestSchema>;

export const RefineResponseSchema = FlashcardSchema;

export type ActionState<T> =
	| { ok: true; data: T }
	| { ok: false; error: string };
