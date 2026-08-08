export interface QuoteItem {
  reference: string | null;
  description: string;
  quantity: number;
  unit: string;
  unit_price_ht: number | null;
}

export interface QuoteAnalysis {
  items: QuoteItem[];
}
