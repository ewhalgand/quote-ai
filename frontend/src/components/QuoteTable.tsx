import type { QuoteItem } from '../types/quote';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from './ui/button';

interface QuoteTableProps {
  items: QuoteItem[];
  onItemsChange: (items: QuoteItem[]) => void;
}

export default function QuoteTable({ items, onItemsChange }: QuoteTableProps) {
  const updateItem = (
    index: number,
    field: keyof QuoteItem,
    value: string | number | null,
  ) => {
    onItemsChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const renderInput = (
    value: string | number | null,
    onChange: (value: string | number | null) => void,
    options?: { type?: string; step?: string },
  ) => (
    <input
      type={options?.type ?? 'text'}
      step={options?.step}
      value={value ?? ''}
      onFocus={(event) => {
        if (value === 0 || value === '0') {
          event.currentTarget.select();
        }
      }}
      onChange={(event) => {
        const rawValue = event.target.value;
        const nextValue =
          options?.type === 'number'
            ? rawValue === ''
              ? null
              : Number(rawValue)
            : rawValue === ''
              ? null
              : rawValue;

        onChange(nextValue);
      }}
    />
  );

  const totals = items.reduce(
    (acc, item) => {
      const totalHt =
        item.unit_price_ht !== null ? item.quantity * item.unit_price_ht : 0;

      acc.ht += totalHt;
      acc.tva += totalHt * 0.2;
      acc.ttc += totalHt * 1.2;

      return acc;
    },
    { ht: 0, tva: 0, ttc: 0 },
  );

  return (
    <section className="grid w-full max-w-6xl gap-2">
      <Table className="border">
        <TableHeader className="bg-blue-600">
          <TableRow>
            <TableHead className="w-25 text-white">Référence</TableHead>
            <TableHead className="text-white">Désignation</TableHead>
            <TableHead className="text-white">Qté</TableHead>
            <TableHead className="text-white">PU HT</TableHead>
            <TableHead className="text-right text-white">Total HT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => {
            const totalHt =
              item.unit_price_ht !== null
                ? item.quantity * item.unit_price_ht
                : null;

            return (
              <TableRow key={`${item.description}-${index}`}>
                <TableCell>
                  {renderInput(item.reference ?? null, (value) =>
                    updateItem(index, 'reference', value),
                  )}
                </TableCell>
                <TableCell>
                  {renderInput(item.description, (value) =>
                    updateItem(index, 'description', value),
                  )}
                </TableCell>
                <TableCell>
                  {renderInput(item.quantity, (value) =>
                    updateItem(index, 'quantity', value),
                  )}
                </TableCell>
                <TableCell>
                  {renderInput(item.unit_price_ht ?? null, (value) =>
                    updateItem(index, 'unit_price_ht', value),
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {totalHt !== null ? `${totalHt.toFixed(2)} €` : '0.00 €'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="flex flex-col items-end gap-3">
        <div className="flex flex-col gap-1 text-sm text-right">
          <div className="flex items-center justify-between gap-2.5 rounded px-2 py-1">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">
              Sous-total HT
            </div>
            <div>{totals.ht.toFixed(2)} €</div>
          </div>
          <div className="flex items-center justify-between gap-2.5 rounded px-2 py-1">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">
              TVA 20%
            </div>
            <div>{totals.tva.toFixed(2)} €</div>
          </div>
          <div className="flex items-center justify-between gap-2.5 rounded bg-slate-100 px-2 py-1">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">
              Total TTC
            </div>
            <div>{totals.ttc.toFixed(2)} €</div>
          </div>
        </div>

        <div className="flex w-full justify-start">
          <Button className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 cursor-pointer">
            Valider le tableau
          </Button>
        </div>
      </div>
    </section>
  );
}
