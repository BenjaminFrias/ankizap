'use client';

import { ActionState, GenerationResponse, RefineResponse } from '@/types/types';
import { Check, Pen, X } from 'lucide-react';
import { Button } from '../ui/button';
import FlashcardItem from './FlashcardItem';
import { Input } from '../ui/input';
import { useCallback, useEffect, useState } from 'react';

type FlashcardResultsProps = {
	generateState: ActionState<GenerationResponse>;
};

export default function FlashcardResults({
	generateState,
}: FlashcardResultsProps) {
	const [flashcards, setFlashcards] = useState<GenerationResponse['cards']>([]);

	const [deckName, setDeckName] =
		useState<GenerationResponse['deckName']>('MyDeck');

	const [editedName, setEditedName] = useState('');
	const [isEditingName, setIsEditingName] = useState(false);

	useEffect(() => {
		if (generateState.ok) {
			setFlashcards(generateState.data.cards);
			setDeckName(generateState.data.deckName);
			setEditedName(generateState.data.deckName);
		}
	}, [generateState]);

	const saveNameEdit = () => {
		if (editedName.trim() === '') {
			setEditedName(deckName);
		}

		setDeckName(editedName);
	};

	const onRefine = useCallback((refinedCard: RefineResponse) => {
		setFlashcards((prevState) =>
			prevState.map((card) =>
				card.id === refinedCard.id ? refinedCard : card,
			),
		);
	}, []);

	const handleExportDeck = async () => {
		try {
			const response = await fetch('api/download-deck', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ deckName: deckName, cards: flashcards }),
			});

			if (!response.ok) {
				throw new Error('Failed to download deck');
			}

			const blob = await response.blob();

			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${deckName}.apkg`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Failed to fetch deck: ', error);
		}
	};

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
						<Button onClick={handleExportDeck}>Export Anki Deck</Button>
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
