'use client';

import { ActionState, GenerationResponse, RefineResponse } from '@/types/types';
import { Check, Pen, X } from 'lucide-react';
import { Button } from '../ui/button';
import FlashcardItem from './FlashcardItem';
import { Input } from '../ui/input';
import { useCallback, useState } from 'react';
import downloadDeck from '@/lib/download-deck';

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

	const [editedName, setEditedName] = useState(deckName);
	const [isEditingName, setIsEditingName] = useState(false);

	const saveNameEdit = () => {
		if (editedName.trim() === '') {
			setEditedName(deckName.trim());
		}

		setDeckName(editedName.trim());
	};

	const onRefine = useCallback((refinedCard: RefineResponse) => {
		setFlashcards((prevState) =>
			prevState.map((card) =>
				card.id === refinedCard.id ? refinedCard : card,
			),
		);
	}, []);

	return (
		<section>
			{generateState.ok === true ? (
				<div>
					{isEditingName ? (
						<>
							<div>
								<Input
									value={editedName}
									onKeyDown={(e) => e.key === 'Enter' && saveNameEdit()}
									onChange={(e) => setEditedName(e.target.value)}
									autoFocus
								/>
								<Button
									variant={'secondary'}
									onClick={() => setIsEditingName(false)}
								>
									<X />
								</Button>
								<Button
									variant={'secondary'}
									onClick={() => {
										saveNameEdit();
										setIsEditingName(false);
									}}
								>
									<Check />
								</Button>
							</div>
						</>
					) : (
						<div className="flex gap-5">
							<h3 className="text-xl font-bold mb-5">{deckName}</h3>
							<Button
								variant={'secondary'}
								onClick={() => setIsEditingName(true)}
							>
								<Pen />
							</Button>
						</div>
					)}

					<section className="flex flex-col gap-5 ">
						{flashcards.map((card) => (
							<FlashcardItem key={card.id} card={card} onRefine={onRefine} />
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
