package models

type QuoteItem struct {
	Reference   *string  `json:"reference"`
	Description string   `json:"description"`
	Quantity    *float64 `json:"quantity"`
	Unit        *string  `json:"unit"`
	UnitPriceHT *float64 `json:"unit_price_ht"`
}

type QuoteAnalysis struct {
	Items []QuoteItem `json:"items"`
}
