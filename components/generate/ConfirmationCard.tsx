import { Flashcard } from '@/types/types';
import { Button } from '../ui/button';

type ConfirmationCardProps = {
	card: Flashcard;
	onConfirm: (decision: boolean) => void;
};

export default function ConfirmationCard({
	card,
	onConfirm,
}: ConfirmationCardProps) {
	return (
		<div
			className="flex flex-col gap-2 p-4 bg-blue-300 rounded-2xl"
			role="region"
			aria-label="confirmation card"
		>
			<h2>Confirmation card</h2>

			<p className="font-semibold text-sm text-blue-900 uppercase">Front</p>
			<p>{card.front}</p>

			<p className="font-semibold text-sm text-blue-900 uppercase">Back</p>
			<p>{card.back}</p>

			<Button
				onClick={() => {
					onConfirm(true);
				}}
				aria-label="accept refined card"
			>
				Accept card
			</Button>
			<Button
				onClick={() => {
					onConfirm(false);
				}}
				aria-label="reject refined card"
			>
				Reject card
			</Button>
		</div>
	);
}
