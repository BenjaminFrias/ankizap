import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from './input';

export default function InputFile() {
	return (
		<Field>
			<FieldLabel htmlFor="file" className="text-gray-600">
				File
			</FieldLabel>
			<Input id="file" type="file" name="file" />
		</Field>
	);
}
