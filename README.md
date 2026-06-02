# Finanças da Casa

Sistema para dividir custos de casa entre Diogo e Camila (50/50), com **planilha sincronizada em tempo real**.

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

Diogo paga R$ 500 de mercado → Camila deve R$ 250 para Diogo. Quando acertarem, marque **PAGO** naquele item.
