package api

import (
	"encoding/json"
	"net/http"

	"exercice-tech/internal/llm"
)

type AnalyzeRequest struct {
	Text string `json:"text"`
}

func AnalyzeQuote(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var request AnalyzeRequest

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if request.Text == "" {
		http.Error(w, "Text is required", http.StatusBadRequest)
		return
	}

	result, err := llm.GenerateQuoteAnalysis(request.Text)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(result)
}
