# Finanças da Casa

Sistema simples para dividir custos de casa entre Diogo e Camila (50/50).

## Como usar

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (geralmente http://localhost:5173).

**Online:** https://diogotupi.github.io/financas-da-casa/

## Funcionalidades

- **Registrar gasto** — descrição, valor, quem pagou e data
- **Acerto de contas** — mostra quem deve quanto para quem (soma líquida dos itens pendentes)
- **Toggle PAGO** — marca item a item quando o acerto daquele gasto foi feito
- **Filtros** — Todos / Pendentes / Pagos
- **Persistência** — dados salvos no navegador (localStorage)

## Exemplo

Diogo paga R$ 500 de mercado → Camila deve R$ 250 para Diogo. Quando ela pagar, marque **PAGO** naquele item.
