import { Check, Pen, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

type DeckTitleInputProps = {
	deckName: string;
	onDeckChange: (deckName: string) => void;
};

export default function DeckTitleInput({
	deckName,
	onDeckChange,
}: DeckTitleInputProps) {
	const [editedName, setEditedName] = useState(deckName);
	const [isEditingName, setIsEditingName] = useState(false);

	const saveNameEdit = () => {
		const trimmed = editedName.trim();
		if (trimmed === '') {
			setEditedName(deckName);
			onDeckChange(deckName);
		} else {
			onDeckChange(trimmed);
		}
		setIsEditingName(false);
	};

	return isEditingName ? (
		<div>
			<Input
				value={editedName}
				onKeyDown={(e) => e.key === 'Enter' && saveNameEdit()}
				onChange={(e) => setEditedName(e.target.value)}
				autoFocus
				aria-label="deck name edit input"
			/>
			<Button
				variant={'secondary'}
				onClick={() => {
					setEditedName(deckName);
					setIsEditingName(false);
				}}
				aria-label="cancel deck name edit"
			>
				<X />
			</Button>
			<Button
				variant={'secondary'}
				onClick={saveNameEdit}
				aria-label="save deck name edit"
			>
				<Check />
			</Button>
		</div>
	) : (
		<div className="flex gap-5">
			<h3 className="text-xl font-bold mb-5">{deckName}</h3>
			<Button
				variant={'secondary'}
				onClick={() => setIsEditingName(true)}
				aria-label="edit deck name"
			>
				<Pen />
			</Button>
		</div>
	);
}
