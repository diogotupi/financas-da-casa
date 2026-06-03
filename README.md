# Finanças da Casa

Sistema para registrar e acompanhar os gastos de casa de Diogo e Camila, **mês a mês**, com planilha sincronizada em tempo real.

## Links

- **App:** https://diogotupi.github.io/financas-da-casa/
- **API de sync:** https://financas-da-casa-sync.vercel.app/api/expenses

Qualquer pessoa com o link vê e edita a mesma planilha (atualiza a cada ~1,2s).

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Como funciona a sincronização

- Os gastos ficam em `data/expenses.json` no repositório GitHub
- A API na Vercel lê/escreve esse arquivo via GitHub API
- O app faz polling rápido — quando um edita, o outro vê em segundos

## Exemplo

Em maio, Diogo registra mercado R$ 500 e Camila registra luz R$ 120. O site mostra o total de cada um naquele mês, lado a lado.
