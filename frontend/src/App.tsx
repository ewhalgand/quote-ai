import { useState } from 'react';

import QuoteInput from './components/QuoteInput';
import QuoteTable from './components/QuoteTable';

import type { QuoteItem } from './types/quote';

function App() {
  const [text, setText] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = import.meta.env.VITE_API_URL;

  const analyzeQuote = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`Erreur API (${response.status}) : ${errorText}`);
      }

      const data = await response.json();

      setItems(data.items);
    } catch (error) {
      console.error(error);

      setError("Une erreur est survenue lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1 className="bg-blue-600 p-3 text-center text-2xl text-white">
        ✨ Quote AI
      </h1>

      <div className="mt-24 flex justify-center p-4">
        {items.length > 0 ? (
          <QuoteTable items={items} onItemsChange={setItems} />
        ) : (
          <div className="flex w-full max-w-2xl flex-col items-start gap-3">
            <QuoteInput
              text={text}
              loading={loading}
              onTextChange={setText}
              onAnalyze={analyzeQuote}
            />

            {error && <p className="text-red-600">{error}</p>}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
