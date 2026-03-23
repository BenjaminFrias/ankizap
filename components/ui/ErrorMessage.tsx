type ErrorMessageProps = {
	message: string;
	className?: string;
};

export default function ErrorMessage({
	message,
	className,
}: ErrorMessageProps) {
	return (
		<div
			role="alert"
			className={className ?? 'p-4 bg-red-100 text-red-700 rounded-lg my-5'}
		>
			{message}
		</div>
	);
}
