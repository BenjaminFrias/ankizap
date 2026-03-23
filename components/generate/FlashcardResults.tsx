'use client';

import { ActionState, Flashcard, GenerationResponse } from '@/types/types';
import { Button } from '../ui/button';
import FlashcardItem from './FlashcardItem';
import { useCallback, useState } from 'react';
import downloadDeck from '@/lib/download-deck';
import DeckTitleInput from './DeckTitleInput';
import ErrorMessage from '../ui/ErrorMessage';

type FlashcardResultsProps = {
	generationResult: ActionState<GenerationResponse>;
};

export default function FlashcardResults({
	generationResult,
}: FlashcardResultsProps) {
	const [flashcards, setFlashcards] = useState<GenerationResponse['cards']>(
		generationResult.ok ? generationResult.data.cards : [],
	);

	const [deckName, setDeckName] = useState<GenerationResponse['deckName']>(
		generationResult.ok ? generationResult.data.deckName : 'MyDeck',
	);

	const [localError, setLocalError] = useState<string | null>(null);

	const handleRefine = useCallback((refinedCard: Flashcard) => {
		setLocalError(null);
		setFlashcards((prevState) =>
			prevState.map((card) =>
				card.id === refinedCard.id ? refinedCard : card,
			),
		);
	}, []);

	const handleDelete = (cardToDelete: Flashcard) => {
		setLocalError(null);

		if (flashcards.length <= 1) {
			setLocalError('Deck must have at least one card.');
			return;
		}

		setFlashcards((prev) => prev.filter((card) => card.id !== cardToDelete.id));
	};

	const handleDeckNameChange = (name: string) => {
		setLocalError(null);
		setDeckName(name);
	};

	if (!generationResult.ok) {
		return <ErrorMessage message={generationResult.error} />;
	}

	return (
		<section>
			<DeckTitleInput deckName={deckName} onDeckChange={handleDeckNameChange} />

			{localError && <ErrorMessage message={localError} />}

			<div className="flex flex-col gap-5 ">
				{flashcards.map((card) => (
					<FlashcardItem
						key={card.id}
						card={card}
						onRefine={handleRefine}
						onDelete={handleDelete}
					/>
				))}
			</div>

			<div>
				<Button onClick={() => downloadDeck({ deckName, flashcards })}>
					Export Anki Deck
				</Button>
			</div>
		</section>
	);
}
