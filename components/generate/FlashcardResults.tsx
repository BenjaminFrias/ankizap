'use client';

import { ActionState, Flashcard, GenerationResponse } from '@/types/types';
import { Button } from '../ui/button';
import FlashcardItem from './FlashcardItem';
import { useCallback, useState } from 'react';
import downloadDeck from '@/lib/download-deck';
import DeckTitleInput from './DeckTitleInput';

type FlashcardResultsProps = {
	generateState: ActionState<GenerationResponse>;
};

export default function FlashcardResults({
	generateState,
}: FlashcardResultsProps) {
	const [flashcards, setFlashcards] = useState<GenerationResponse['cards']>(
		generateState.ok ? generateState.data.cards : [],
	);

	const [deckName, setDeckName] = useState<GenerationResponse['deckName']>(
		generateState.ok ? generateState.data.deckName : 'MyDeck',
	);

	const handleRefine = useCallback((refinedCard: Flashcard) => {
		setFlashcards((prevState) =>
			prevState.map((card) =>
				card.id === refinedCard.id ? refinedCard : card,
			),
		);
	}, []);

	const handleDelete = useCallback((cardToDelete: Flashcard) => {
		setFlashcards((prev) => prev.filter((card) => card.id !== cardToDelete.id));
	}, []);

	return (
		<section>
			{generateState.ok === true ? (
				<div>
					<DeckTitleInput deckName={deckName} onDeckChange={setDeckName} />

					<section className="flex flex-col gap-5 ">
						{flashcards.map((card) => (
							<FlashcardItem
								key={card.id}
								card={card}
								onRefine={handleRefine}
								onDelete={handleDelete}
							/>
						))}
					</section>

					<section>
						<Button onClick={() => downloadDeck({ deckName, flashcards })}>
							Export Anki Deck
						</Button>
					</section>
				</div>
			) : (
				<div className="p-4 bg-red-100 text-red-700 rounded-lg">
					{generateState.error}
				</div>
			)}
		</section>
	);
}
