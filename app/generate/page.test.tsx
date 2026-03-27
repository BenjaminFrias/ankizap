import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from './page';
import { ActionState, GenerationResponse, RefineResponse } from '@/types/types';
import { generateAction, refineAction } from '../../actions';

jest.mock('../../actions', () => ({
	generateAction: jest.fn(),
	refineAction: jest.fn(),
}));

const mockGenerateAction = generateAction as jest.Mock;
const mockRefineAction = refineAction as jest.Mock;

const mockDeckName = 'deck name';
const mockGenerationResultSuccess: ActionState<GenerationResponse> = {
	ok: true,
	data: {
		deckName: mockDeckName,
		cards: [
			{ id: '1', front: 'Q1', back: 'A1', type: 'basic' },
			{ id: '2', front: 'Q2', back: 'A2', type: 'basic' },
		],
	},
};

const mockGenerationResultError: ActionState<GenerationResponse> = {
	ok: false,
	error: 'Error generating flashcards',
};

const mockRefineResultSuccess: ActionState<RefineResponse> = {
	ok: true,
	data: { id: '1', front: 'Question 1', back: 'Answer 1', type: 'basic' },
};

describe('Generate Page', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	// Unit tests
	describe('basic rendering', () => {
		it('shows generate form with all the input fields', () => {
			render(<Page />);

			expect(screen.getByRole('textbox')).toBeInTheDocument();

			const cardCountSelect = screen.getByRole('combobox', {
				name: /card count input/i,
			});

			const cardTypeSelect = screen.getByRole('combobox', {
				name: /card type input/i,
			});

			expect(cardCountSelect).toBeInTheDocument();
			expect(cardTypeSelect).toBeInTheDocument();

			expect(
				screen.getByRole('group', { name: /source type input group/i }),
			).toBeInTheDocument();

			expect(
				screen.getByRole('button', { name: /generate/i }),
			).toBeInTheDocument();

			expect(
				screen.getByRole('button', { name: /generate/i }),
			).not.toBeDisabled();
		});
	});

	// Integration tests
	describe('generation flow', () => {
		it('shows flashcards on success', async () => {
			mockGenerateAction.mockResolvedValue(mockGenerationResultSuccess);

			const user = userEvent.setup();
			render(<Page />);

			await user.type(screen.getByRole('textbox'), 'Photosynthesis');
			await user.click(screen.getByRole('button', { name: /generate/i }));

			expect(await screen.findByText('Q1')).toBeInTheDocument();
			expect(screen.getByText('Q2')).toBeInTheDocument();
			expect(screen.getByText(mockDeckName)).toBeInTheDocument();
		});

		it('shows error when generation fails', async () => {
			mockGenerateAction.mockResolvedValue(mockGenerationResultError);

			const user = userEvent.setup();
			render(<Page />);

			await user.type(screen.getByRole('textbox'), 'Photosynthesis');
			await user.click(screen.getByRole('button', { name: /generate/i }));

			expect(
				await screen.findByText('Error generating flashcards'),
			).toBeInTheDocument();

			expect(screen.queryByText('Q1')).not.toBeInTheDocument();
			expect(screen.queryByText('Q2')).not.toBeInTheDocument();
			expect(screen.queryByText(mockDeckName)).not.toBeInTheDocument();
		});
	});

	describe('editing', () => {
		it('can edit deck name', async () => {
			mockGenerateAction.mockResolvedValue(mockGenerationResultSuccess);

			const user = userEvent.setup();
			render(<Page />);

			await user.type(screen.getByRole('textbox'), 'Photosynthesis');
			await user.click(screen.getByRole('button', { name: /generate/i }));

			expect(await screen.findByText(mockDeckName)).toBeInTheDocument();

			await user.click(screen.getByRole('button', { name: /edit deck name/i }));

			for (let i = 0; i < mockDeckName.length; i++) {
				await user.keyboard('{Backspace}');
			}

			await user.type(
				screen.getByRole('textbox', { name: /deck name edit input/i }),
				'Photosynthesis',
			);

			await user.click(
				screen.getByRole('button', { name: /save deck name edit/i }),
			);

			expect(screen.getByText('Photosynthesis')).toBeInTheDocument();
		});

		it('can edit card', async () => {
			mockGenerateAction.mockResolvedValue(mockGenerationResultSuccess);

			const user = userEvent.setup();
			render(<Page />);

			await user.type(screen.getByRole('textbox'), 'Photosynthesis');
			await user.click(screen.getByRole('button', { name: /generate/i }));

			expect(await screen.findByText('Q1')).toBeInTheDocument();
			const editBtns = screen.getAllByRole('button', {
				name: /edit card/i,
			});

			// Input fields should NOT BE in document
			expect(
				screen.queryByRole('textbox', { name: /edit front card input/i }),
			).not.toBeInTheDocument();

			await user.click(editBtns[0]);

			// Input fields should BE in document
			expect(
				await screen.findByRole('textbox', { name: /edit front card input/i }),
			).toBeInTheDocument();

			// Edit card
			await user.type(
				screen.getByRole('textbox', { name: /edit front card input/i }),
				': Question 1',
			);
			await user.type(
				screen.getByRole('textbox', { name: /edit back card input/i }),
				': Answer 1',
			);

			// Save edit
			await user.click(screen.getByRole('button', { name: /save card edit/i }));

			// Expect changes
			expect(screen.queryByText('Q1: Question 1')).toBeInTheDocument();
			expect(screen.queryByText('A1: Answer 1')).toBeInTheDocument();
		});

		// Create edit card test and cancel edit
		it('can cancel card edit', async () => {
			mockGenerateAction.mockResolvedValue(mockGenerationResultSuccess);

			const user = userEvent.setup();
			render(<Page />);

			await user.type(screen.getByRole('textbox'), 'Photosynthesis');
			await user.click(screen.getByRole('button', { name: /generate/i }));

			expect(await screen.findByText('Q1')).toBeInTheDocument();
			const editBtns = screen.getAllByRole('button', {
				name: /edit card/i,
			});

			await user.click(editBtns[0]);

			// Edit card
			await user.type(
				screen.getByRole('textbox', { name: /edit front card input/i }),
				': Question 1',
			);
			await user.type(
				screen.getByRole('textbox', { name: /edit back card input/i }),
				': Answer 1',
			);

			// cancel edit
			await user.click(
				screen.getByRole('button', { name: /cancel card edit/i }),
			);

			// Expect changes
			expect(screen.queryByText('Q1: Question 1')).not.toBeInTheDocument();
			expect(screen.queryByText('A1: Answer 1')).not.toBeInTheDocument();
			expect(screen.queryByText('Q1')).toBeInTheDocument();
			expect(screen.queryByText('A1')).toBeInTheDocument();
		});
	});

	describe('refinement', () => {
		it('can refine and accept refined card', async () => {
			mockGenerateAction.mockResolvedValue(mockGenerationResultSuccess);
			mockRefineAction.mockResolvedValue(mockRefineResultSuccess);

			const user = userEvent.setup();
			render(<Page />);

			await user.type(screen.getByRole('textbox'), 'Photosynthesis');
			await user.click(screen.getByRole('button', { name: /generate/i }));

			expect(await screen.findByText('Q1')).toBeInTheDocument();

			const refineBtns = screen.getAllByRole('button', {
				name: /refine card/i,
			});

			await user.click(refineBtns[0]);

			expect(
				screen.getByRole('form', { name: /refine form/i }),
			).toBeInTheDocument();

			// Type refine prompt
			await user.type(
				screen.getByRole('textbox', { name: /refine card input/i }),
				'refine card',
			);

			// Submit refine form
			await user.click(
				screen.getByRole('button', { name: /submit refine form button/i }),
			);

			// Confirmation card appears
			expect(
				await screen.findByRole('region', { name: 'confirmation card' }),
			).toBeInTheDocument();

			await user.click(
				screen.getByRole('button', { name: 'accept refined card' }),
			);

			expect(screen.queryByText('Question 1')).toBeInTheDocument();
			expect(screen.queryByText('Q1')).not.toBeInTheDocument();
		});

		it('can reject card after refinement', async () => {
			mockGenerateAction.mockResolvedValue(mockGenerationResultSuccess);
			mockRefineAction.mockResolvedValue(mockRefineResultSuccess);

			const user = userEvent.setup();
			render(<Page />);

			await user.type(screen.getByRole('textbox'), 'Photosynthesis');
			await user.click(screen.getByRole('button', { name: /generate/i }));

			expect(await screen.findByText('Q1')).toBeInTheDocument();

			const refineBtns = screen.getAllByRole('button', {
				name: /refine card/i,
			});

			await user.click(refineBtns[0]);

			expect(
				screen.getByRole('form', { name: /refine form/i }),
			).toBeInTheDocument();

			// Type refine prompt
			await user.type(
				screen.getByRole('textbox', { name: /refine card input/i }),
				'refine card',
			);

			// Submit refine form
			await user.click(
				screen.getByRole('button', { name: /submit refine form button/i }),
			);

			// Confirmation card appears
			expect(
				await screen.findByRole('region', { name: 'confirmation card' }),
			).toBeInTheDocument();

			await user.click(
				screen.getByRole('button', { name: 'reject refined card' }),
			);

			expect(screen.queryByText('Question 1')).not.toBeInTheDocument();
			expect(screen.queryByText('Q1')).toBeInTheDocument();
		});

		it('shows error when entering invalid refine prompt', async () => {
			mockGenerateAction.mockResolvedValue(mockGenerationResultSuccess);
			mockRefineAction.mockResolvedValue(mockRefineResultSuccess);

			const user = userEvent.setup();
			render(<Page />);

			await user.type(screen.getByRole('textbox'), 'Photosynthesis');
			await user.click(screen.getByRole('button', { name: /generate/i }));

			expect(await screen.findByText('Q1')).toBeInTheDocument();

			const refineBtns = screen.getAllByRole('button', {
				name: /refine card/i,
			});

			await user.click(refineBtns[0]);

			expect(
				screen.getByRole('form', { name: /refine form/i }),
			).toBeInTheDocument();

			// Type refine prompt
			await user.type(
				screen.getByRole('textbox', { name: /refine card input/i }),
				'abc',
			);

			// Submit refine form
			await user.click(
				screen.getByRole('button', { name: /submit refine form button/i }),
			);

			expect(
				await screen.findByText(/Please write a valid prompt\./i),
			).toBeInTheDocument();
		});
	});

	describe('deletion', () => {
		it('can delete a card after confirming', async () => {
			mockGenerateAction.mockResolvedValue(mockGenerationResultSuccess);

			const user = userEvent.setup();
			render(<Page />);

			await user.type(screen.getByRole('textbox'), 'Photosynthesis');
			await user.click(screen.getByRole('button', { name: /generate/i }));

			expect(await screen.findByText('Q1')).toBeInTheDocument();
			expect(screen.getByText('Q2')).toBeInTheDocument();

			const deleteButtons = screen.getAllByRole('button', {
				name: /delete card/i,
			});
			await user.click(deleteButtons[0]);

			expect(
				screen.getByRole('button', { name: /confirm deletion/i }),
			).toBeInTheDocument();

			await user.click(
				screen.getByRole('button', { name: /confirm deletion/i }),
			);

			expect(screen.queryByText('Q1')).not.toBeInTheDocument();
			expect(screen.getByText('Q2')).toBeInTheDocument();
		});

		it('does not delete a card when deletion is canceled', async () => {
			mockGenerateAction.mockResolvedValue(mockGenerationResultSuccess);

			const user = userEvent.setup();
			render(<Page />);

			await user.type(screen.getByRole('textbox'), 'Photosynthesis');
			await user.click(screen.getByRole('button', { name: /generate/i }));

			expect(await screen.findByText('Q1')).toBeInTheDocument();
			expect(screen.getByText('Q2')).toBeInTheDocument();

			const deleteButtons = screen.getAllByRole('button', {
				name: /delete card/i,
			});
			await user.click(deleteButtons[0]);

			expect(
				screen.getByRole('button', { name: /cancel deletion/i }),
			).toBeInTheDocument();

			await user.click(
				screen.getByRole('button', { name: /cancel deletion/i }),
			);

			expect(screen.queryByText('Q1')).toBeInTheDocument();
			expect(screen.getByText('Q2')).toBeInTheDocument();
		});

		it('cannot delete all cards', async () => {
			mockGenerateAction.mockResolvedValue(mockGenerationResultSuccess);

			const user = userEvent.setup();
			render(<Page />);

			await user.type(screen.getByRole('textbox'), 'Photosynthesis');
			await user.click(screen.getByRole('button', { name: /generate/i }));

			expect(await screen.findByText('Q1')).toBeInTheDocument();
			expect(screen.getByText('Q2')).toBeInTheDocument();

			await user.click(
				screen.getAllByRole('button', {
					name: /delete card/i,
				})[0],
			);

			await user.click(
				screen.getByRole('button', { name: /confirm deletion/i }),
			);

			await user.click(
				screen.getAllByRole('button', {
					name: /delete card/i,
				})[0],
			);

			await user.click(
				screen.getByRole('button', { name: /confirm deletion/i }),
			);

			expect(
				await screen.findByText('Deck must have at least one card.'),
			).toBeInTheDocument();
		});
	});
});
