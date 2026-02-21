'use client';

import { ActionState, FlashcardWithId, RefineResponse } from '@/types/types';
import RefinePopover from './refine-popover';
import { useActionState } from 'react';
import { refineAction } from '@/actions';

type FlashcardItemProps = {
	card: FlashcardWithId;
	onRefine: (card: FlashcardWithId) => void;
};

export default function FlashcardItem({ card, onRefine }: FlashcardItemProps) {
	const [refineState, dispatchRefine, isRefining] = useActionState(
		async (
			prevState: ActionState<RefineResponse> | null,
			formData: FormData,
		) => {
			const result = await refineAction(prevState, formData);

			if (result?.ok && result.data) {
				onRefine(result.data);
			}
			return result;
		},
		null,
	);

	return (
		<div className=" flex flex-col gap-2 p-4 bg-blue-300 rounded-2xl ">
			{isRefining ? (
				<h3 className="font-bold text-2xl text-blue-800">Refining card...</h3>
			) : (
				<>
					<p className="font-semibold text-sm text-blue-600 uppercase">Front</p>
					<p>{refineState?.ok ? refineState.data.front : card.front}</p>
					<hr />
					<p className="font-semibold text-sm text-blue-900 uppercase">Back</p>

					<p>{refineState?.ok ? refineState.data.back : card.back}</p>

					<RefinePopover card={card} refineFormAction={dispatchRefine} />
				</>
			)}
		</div>
	);
}
