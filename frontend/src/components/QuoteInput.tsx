import { Field, FieldDescription, FieldLabel } from '../components/ui/field';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';

interface QuoteInputProps {
  text: string;
  loading: boolean;
  onTextChange: (text: string) => void;
  onAnalyze: () => void;
}

export default function QuoteInput({
  text,
  loading,
  onTextChange,
  onAnalyze,
}: QuoteInputProps) {
  const buttonLabel = loading ? 'Analyse en cours...' : 'Analyser la demande';

  return (
    <section className="grid w-full max-w-2xl gap-2">
      <Field>
        <FieldLabel htmlFor="textarea-message" className="text-lg">
          Nouvelle demande
        </FieldLabel>
        <FieldDescription>Enter le mail à annalyser</FieldDescription>
        <Textarea
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder="Collez ici le contenu du mail ou la demande du client..."
          rows={12}
          className="border-blue-500 lg:h-40"
        />
      </Field>
      <div className="flex w-full justify-end">
        <Button
          className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          onClick={onAnalyze}
          disabled={loading || !text.trim()}
        >
          {buttonLabel}
        </Button>
      </div>
    </section>
  );
}
