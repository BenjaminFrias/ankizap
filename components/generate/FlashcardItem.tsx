'use client';

import { ActionState, Flashcard, RefineResponse } from '@/types/types';
import RefinePopover from './RefinePopOver';
import { useActionState, useState } from 'react';
import { refineAction } from '@/actions';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Check, Pen, X } from 'lucide-react';
import DeletePopOver from './DeletePopOver';
import ConfirmationCard from './ConfirmationCard';
import RefineCardLoading from './RefineCardLoading';

type FlashcardItemProps = {
	card: Flashcard;
	onRefine: (card: Flashcard) => void;
	onDelete: (card: Flashcard) => void;
};

export default function FlashcardItem({
	card,
	onRefine,
	onDelete,
}: FlashcardItemProps) {
	const [waitingConfirmation, setWaitingConfirmation] = useState(false);
	const [refineResult, dispatchRefine, isRefining] = useActionState(
		async (
			prevState: ActionState<RefineResponse> | null,
			formData: FormData,
		) => {
			const result = await refineAction(prevState, formData);

			if (result.ok) {
				setWaitingConfirmation(true);
			}

			return result;
		},
		null,
	);
	const [editedCard, setEditedCard] = useState({ ...card });
	const [isEditing, setIsEditing] = useState(false);

	const refinedCard =
		refineResult?.ok && refineResult.data ? refineResult.data : null;

	const startCardEdit = () => {
		setEditedCard({ ...card });
		setIsEditing(true);
	};

	const saveCardEdit = () => {
		if (editedCard.front.trim() === '' && editedCard.back.trim() === '') {
			return;
		}

		onRefine({ ...card, front: editedCard.front, back: editedCard.back });
		setIsEditing(false);
	};

	const cancelEdit = () => {
		setIsEditing(false);
	};

	const confirmRefinedCard = (confirm: boolean) => {
		if (confirm && refinedCard) {
			onRefine({ ...refinedCard });
		}
		setWaitingConfirmation(false);
	};

	if (isRefining) {
		return <RefineCardLoading />;
	}

	// Confirmation card
	if (waitingConfirmation && refinedCard) {
		return (
			<ConfirmationCard card={refinedCard} onConfirm={confirmRefinedCard} />
		);
	}

	// Actual card
	return (
		<div className="flex flex-col gap-2 p-4 bg-blue-300 rounded-2xl">
			<>
				<p className="font-semibold text-sm text-blue-900 uppercase">Front</p>

				{/* Front edit inputs */}
				{isEditing ? (
					<Input
						value={editedCard.front}
						onKeyDown={(e) => e.key === 'Enter' && saveCardEdit()}
						onChange={(e) => {
							setEditedCard({ ...editedCard, front: e.target.value });
						}}
						aria-label="edit front card input"
						autoFocus
					/>
				) : (
					<>
						<p>{card.front}</p>
					</>
				)}

				<hr />

				<p className="font-semibold text-sm text-blue-900 uppercase">Back</p>

				{/* Back edit inputs */}
				{isEditing ? (
					<Input
						value={editedCard.back}
						onKeyDown={(e) => e.key === 'Enter' && saveCardEdit()}
						onChange={(e) =>
							setEditedCard({ ...editedCard, back: e.target.value })
						}
						aria-label="edit back card input"
					/>
				) : (
					<>
						<p>{card.back}</p>
						<Button
							variant={'secondary'}
							onClick={startCardEdit}
							aria-label="edit card"
						>
							<Pen />
						</Button>
					</>
				)}

				{/* Confirmation buttons */}
				{isEditing ? (
					<>
						<Button
							variant={'secondary'}
							onClick={saveCardEdit}
							aria-label="save card edit"
						>
							<Check />
						</Button>
						<Button
							variant={'secondary'}
							onClick={cancelEdit}
							aria-label="cancel card edit"
						>
							<X />
						</Button>
					</>
				) : (
					<>
						<RefinePopover card={card} refineFormAction={dispatchRefine} />
						<DeletePopOver onDelete={() => onDelete(card)} />
					</>
				)}
			</>
		</div>
	);
}
