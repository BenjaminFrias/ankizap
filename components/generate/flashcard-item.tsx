'use client';

import { ActionState, FlashcardWithId, RefineResponse } from '@/types/types';
import RefinePopover from './refine-popover';
import { useActionState, useMemo, useState } from 'react';
import { refineAction } from '@/actions';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Check, Pen, X } from 'lucide-react';

type FlashcardItemProps = {
	card: FlashcardWithId;
	onRefine: (card: FlashcardWithId) => void;
};

export default function FlashcardItem({ card, onRefine }: FlashcardItemProps) {
	const [editedCard, setEditedCard] = useState({
		front: card.front,
		back: card.back,
	});

	const [refineState, dispatchRefine, isRefining] = useActionState(
		async (
			prevState: ActionState<RefineResponse> | null,
			formData: FormData,
		) => {
			const result = await refineAction(prevState, formData);

			if (result?.ok && result.data) {
				setEditedCard({
					...card,
					front: result.data.front,
					back: result.data.back,
				});
				onRefine(result.data);
			}
			return result;
		},
		null,
	);

	const cardData = useMemo(() => {
		return refineState?.ok ? refineState.data : card;
	}, [refineState, card]);

	const [isEditing, setIsEditing] = useState(false);

	const startEditing = () => {
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
		setEditedCard({ front: card.front, back: card.back });
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
							<p>{cardData.front}</p>
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
							<p>{cardData.back}</p>
							<Button variant={'secondary'} onClick={startEditing}>
								<Pen />
							</Button>
						</>
					)}

					{isEditing && (
						<>
							<Button variant={'secondary'} onClick={saveEdit}>
								<Check />
							</Button>
							<Button variant={'secondary'} onClick={cancelEdit}>
								<X />
							</Button>
						</>
					)}
					<RefinePopover card={card} refineFormAction={dispatchRefine} />
				</>
			)}
		</div>
	);
}
