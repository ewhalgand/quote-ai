package llm

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"exercice-tech/internal/models"
)

const groqURL = "https://api.groq.com/openai/v1/chat/completions"

type groqRequest struct {
	Model          string         `json:"model"`
	Messages       []groqMessage  `json:"messages"`
	ResponseFormat responseFormat `json:"response_format"`
}

type groqMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type responseFormat struct {
	Type       string           `json:"type"`
	JSONSchema jsonSchemaConfig `json:"json_schema"`
}

type jsonSchemaConfig struct {
	Name   string         `json:"name"`
	Strict bool           `json:"strict"`
	Schema map[string]any `json:"schema"`
}

type groqResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func GenerateQuoteAnalysis(text string) (*models.QuoteAnalysis, error) {
	apiKey := os.Getenv("GROQ_API_KEY")

	if apiKey == "" {
		return nil, fmt.Errorf("GROQ_API_KEY is not set")
	}

	requestBody := groqRequest{
		Model: "openai/gpt-oss-20b",

		Messages: []groqMessage{
			{
				Role: "system",
				Content: `Tu es un assistant spécialisé dans l'extraction de données à partir de demandes commerciales.

Ta tâche consiste uniquement à identifier les produits explicitement demandés dans le texte et à extraire les informations certaines qui peuvent être utilisées pour préparer un devis.

RÈGLE PRINCIPALE :
N'invente, ne déduis et n'interprète aucune information qui n'est pas explicitement et clairement présente dans le texte.

Pour chaque produit identifié, extrais :

- la référence uniquement si elle est explicitement mentionnée ;
- la désignation du produit ;
- la quantité uniquement si elle est explicitement donnée et suffisamment précise ;
- l'unité uniquement si elle est explicitement connue ou directement identifiable sans ambiguïté ;
- le prix unitaire HT uniquement s'il est explicitement fourni.

QUANTITÉS :
Une quantité approximative, incertaine, implicite ou ambiguë doit être considérée comme inconnue et avoir la valeur null.

Une information exprimée sous forme de conditionnement, de volume, de palette, de lot ou toute autre unité dont le contenu exact n'est pas connu ne doit jamais être convertie en quantité de produits.

Si aucune quantité exploitable n'est disponible, utilise null.
N'utilise jamais 0 pour représenter une quantité inconnue.

UNITÉS :
Si l'unité ne peut pas être déterminée avec certitude, utilise null.

PRIX :
N'extrais un prix que s'il est explicitement présent dans le texte.
Ne déduis jamais un prix à partir d'informations précédentes, approximatives ou contextuelles.

RÉFÉRENCES :
Ne génère jamais de référence.
Si aucune référence n'est explicitement fournie, utilise null.

PRODUITS :
Identifie uniquement les produits clairement mentionnés dans la demande.
Une information de quantité ou de conditionnement qui ne permet pas d'identifier clairement un produit ne doit pas créer une nouvelle ligne de produit.

INFORMATIONS INCONNUES :
Toute information absente, ambiguë, approximative ou incertaine doit avoir la valeur null.

Ne mets jamais 0 pour représenter une information inconnue.

IMPORTANT :
- Ne calcule aucun total.
- Ne calcule pas la TVA.
- Ne modifie pas les informations explicitement fournies.
- Ne complète jamais les informations manquantes par des suppositions.
- Une demande peut contenir plusieurs produits.
- Retourne uniquement les données demandées dans le schéma JSON.`,
			},
			{
				Role:    "user",
				Content: text,
			},
		},

		ResponseFormat: responseFormat{
			Type: "json_schema",

			JSONSchema: jsonSchemaConfig{
				Name:   "quote_analysis",
				Strict: true,
				Schema: quoteSchema(),
			},
		},
	}

	body, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf(
			"failed to encode Groq request: %w",
			err,
		)
	}

	req, err := http.NewRequest(
		http.MethodPost,
		groqURL,
		bytes.NewBuffer(body),
	)
	if err != nil {
		return nil, fmt.Errorf(
			"failed to create Groq request: %w",
			err,
		)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	response, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf(
			"Groq request failed: %w",
			err,
		)
	}
	defer response.Body.Close()

	responseBody, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf(
			"failed to read Groq response: %w",
			err,
		)
	}

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return nil, fmt.Errorf(
			"Groq returned status %d: %s",
			response.StatusCode,
			string(responseBody),
		)
	}

	var groqResp groqResponse

	if err := json.Unmarshal(responseBody, &groqResp); err != nil {
		return nil, fmt.Errorf(
			"failed to decode Groq response: %w",
			err,
		)
	}

	if len(groqResp.Choices) == 0 {
		return nil, fmt.Errorf("Groq returned no choices")
	}

	content := groqResp.Choices[0].Message.Content

	if content == "" {
		return nil, fmt.Errorf("Groq returned an empty response")
	}

	var result models.QuoteAnalysis

	if err := json.Unmarshal(
		[]byte(content),
		&result,
	); err != nil {
		return nil, fmt.Errorf(
			"failed to decode Groq JSON: %w",
			err,
		)
	}

	return &result, nil
}

func quoteSchema() map[string]any {
	return map[string]any{
		"type": "object",

		"properties": map[string]any{
			"items": map[string]any{
				"type": "array",

				"items": map[string]any{
					"type": "object",

					"properties": map[string]any{
						"reference": map[string]any{
							"type": []string{"string", "null"},
						},

						"description": map[string]any{
							"type": "string",
						},

						"quantity": map[string]any{
							"type": []string{"number", "null"},
						},

						"unit": map[string]any{
							"type": []string{"string", "null"},
						},

						"unit_price_ht": map[string]any{
							"type": []string{"number", "null"},
						},
					},

					"required": []string{
						"reference",
						"description",
						"quantity",
						"unit",
						"unit_price_ht",
					},

					"additionalProperties": false,
				},
			},
		},

		"required": []string{
			"items",
		},

		"additionalProperties": false,
	}
}
