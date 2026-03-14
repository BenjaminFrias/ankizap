'use client';

import { ActionState, Flashcard, RefineResponse } from '@/types/types';
import RefinePopover from './RefinePopOver';
import { useActionState, useState } from 'react';
import { refineAction } from '@/actions';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Check, Pen, X } from 'lucide-react';
import DeletePopOver from './DeletePopOver';

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
	const [refineState, dispatchRefine, isRefining] = useActionState(
		async (
			prevState: ActionState<RefineResponse> | null,
			formData: FormData,
		) => {
			const result = await refineAction(prevState, formData);
			setWaitingConfirmation(true);

			return result;
		},
		null,
	);
	const [editedCard, setEditedCard] = useState({ ...card });
	const [isEditing, setIsEditing] = useState(false);

	const refinedCard =
		refineState?.ok && refineState.data ? refineState.data : null;

	const startEditing = () => {
		setEditedCard({ ...card });
		setIsEditing(true);
	};

	const saveEdit = () => {
		if (editedCard.front.trim() === '' && editedCard.back.trim() === '') {
			return;
		}

		onRefine({ ...card, front: editedCard.front, back: editedCard.back });
		setIsEditing(false);
	};

	const cancelEdit = () => {
		setIsEditing(false);
	};

	const confirmRefinement = (confirm: boolean) => {
		if (confirm && refinedCard) {
			onRefine({ ...refinedCard });
		}
		setWaitingConfirmation(false);
	};

	// Classes for card
	const cardWrapperClass = 'flex flex-col gap-2 p-4 bg-blue-300 rounded-2xl';
	const labelClass = 'font-semibold text-sm text-blue-900 uppercase';

	if (isRefining) {
		return (
			<div className={cardWrapperClass}>
				<h3 className="font-bold text-2xl text-blue-800">Refining card...</h3>
			</div>
		);
	}

	// Confirmation card
	if (waitingConfirmation && refinedCard) {
		return (
			<div className={cardWrapperClass}>
				<div>Confirmation card</div>
				<p className={labelClass}>Front</p>
				<p>{refinedCard.front}</p>
				<p className={labelClass}>Back</p>
				<p>{refinedCard.back}</p>
				<Button
					onClick={() => {
						confirmRefinement(true);
					}}
				>
					Accept card
				</Button>
				<Button
					onClick={() => {
						confirmRefinement(false);
					}}
				>
					Reject card
				</Button>
			</div>
		);
	}

	// Actual card
	return (
		<div className={cardWrapperClass}>
			<>
				<p className={labelClass}>Front</p>

				{/* Front edit inputs */}
				{isEditing ? (
					<Input
						value={editedCard.front}
						onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
						onChange={(e) => {
							setEditedCard({ ...editedCard, front: e.target.value });
						}}
						autoFocus
					/>
				) : (
					<>
						<p>{card.front}</p>
					</>
				)}

				<hr />

				<p className={labelClass}>Back</p>

				{/* Back edit inputs */}
				{isEditing ? (
					<Input
						value={editedCard.back}
						onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
						onChange={(e) =>
							setEditedCard({ ...editedCard, back: e.target.value })
						}
						autoFocus
					/>
				) : (
					<>
						<p>{card.back}</p>
						<Button variant={'secondary'} onClick={startEditing}>
							<Pen />
						</Button>
					</>
				)}

				{/* Confirmation buttons */}
				{isEditing ? (
					<>
						<Button variant={'secondary'} onClick={saveEdit}>
							<Check />
						</Button>
						<Button variant={'secondary'} onClick={cancelEdit}>
							<X />
						</Button>
					</>
				) : (
					<RefinePopover card={card} refineFormAction={dispatchRefine} />
				)}

				<DeletePopOver onDelete={() => onDelete(card)} />
			</>
		</div>
	);
}
