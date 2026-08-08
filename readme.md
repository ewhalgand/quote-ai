# Quote AI

Petit projet permettant d'extraire les produits d'un mail grâce à un LLM, de les modifier dans un tableau puis de générer un devis PDF.

## Stack

- React + TypeScript
- Go
- Groq (LLM)
- Pas de base de données

## Structure

```text
.
├── frontend/   # React
└── backend/    # Go + API + LLM
```

## Installation

### 1. Cloner le projet

```bash
git clone <repo>
cd <repo>
```

### 2. Backend

```bash
cd backend
go mod download
```

Créer un fichier `.env` :

```env
GROQ_API_KEY=gsk_...
```

Lancer :

```bash
go run ./cmd/server
```

Le backend tourne sur `http://localhost:8080`.

### 3. Frontend

Dans un autre terminal :

```bash
cd frontend
npm install
```

Créer `.env` :

```env
VITE_API_URL=http://localhost:8080
```

Lancer :

```bash
npm run dev
```

Les données ne sont pas sauvegardées en base de données.
