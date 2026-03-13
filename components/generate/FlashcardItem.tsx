'use client';

import { Flashcard } from '@/types/types';
import RefinePopover from './RefinePopOver';
import { useActionState, useEffect, useState } from 'react';
import { refineAction } from '@/actions';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Check, Delete, Pen, X } from 'lucide-react';
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
	const [editedCard, setEditedCard] = useState({ ...card });

	const [refineState, dispatchRefine, isRefining] = useActionState(
		refineAction,
		null,
	);

	useEffect(() => {
		if (refineState?.ok && refineState.data) {
			onRefine({ ...refineState.data });
		}
	}, [refineState, onRefine]);

	const [isEditing, setIsEditing] = useState(false);

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

	return (
		<div className=" flex flex-col gap-2 p-4 bg-blue-300 rounded-2xl ">
			{isRefining ? (
				<h3 className="font-bold text-2xl text-blue-800">Refining card...</h3>
			) : (
				<>
					<p className="font-semibold text-sm text-blue-600 uppercase">Front</p>
					{isEditing === true ? (
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
					<p className="font-semibold text-sm text-blue-900 uppercase">Back</p>
					{isEditing === true ? (
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
			)}
		</div>
	);
}
