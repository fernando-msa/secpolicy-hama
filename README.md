# SecPolicy HAMA

Gestão mensal de políticas de segurança da informação para o HAMA.  
Baseado em ISO/IEC 27001 · Next.js 14 + TypeScript · Deploy no Vercel.

---

## Funcionalidades

- Checklist mensal com 5 categorias e 22 itens
- Criticidade por item (Alta / Média / Baixa)
- Pontuação de conformidade em tempo real
- Geração de relatório PDF completo
- Histórico de todos os meses preenchidos
- Fluxo de aprovação: Analista → Gestão
- Auto-save de rascunho no navegador

---

## Setup local

```bash
# 1. Clonar ou criar o projeto
npx create-next-app@14 secpolicy-hama --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd secpolicy-hama

# 2. Substituir os arquivos gerados pelos arquivos deste projeto
# (copie: app/, data/, lib/, globals.css)

# 3. Instalar dependência extra
npm install jspdf

# 4. Rodar localmente
npm run dev
```

Abra http://localhost:3000

---

## Deploy no Vercel

```bash
# 1. Instalar Vercel CLI (se não tiver)
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Deploy
vercel --prod
```

Ou conecte o repositório GitHub diretamente no painel do Vercel.  
Não há variáveis de ambiente necessárias para a versão básica.

---

## Estrutura

```
secpolicy-hama/
├── app/
│   ├── layout.tsx           # Layout raiz com fontes
│   ├── page.tsx             # Dashboard / histórico
│   ├── globals.css          # Design system (CSS variables)
│   └── checklist/
│       └── [id]/
│           └── page.tsx     # Preenchimento e visualização
├── data/
│   └── politicas.json       # Itens do checklist (editável)
└── lib/
    ├── types.ts             # Tipos TypeScript
    ├── storage.ts           # localStorage + cálculos
    └── pdf.ts               # Geração de PDF com jsPDF
```

---

## Personalizar itens

Edite `data/politicas.json` para adicionar, remover ou alterar categorias e itens.  
Cada item tem:
- `id` — identificador único (não altere após ter dados salvos)
- `texto` — descrição do item
- `criticidade` — `"Alta"` | `"Média"` | `"Baixa"`

---

## Próximos passos sugeridos

- [ ] Integração com Resend para envio de e-mail automático após envio
- [ ] Página `/gestao` para a chefia aprovar/solicitar ajustes
- [ ] Export para Excel além de PDF
- [ ] Notificação no dia 1° do mês via e-mail

---

## Tecnologias

| Lib | Uso |
|-----|-----|
| Next.js 14 | Framework React |
| TypeScript | Tipagem |
| jsPDF | Geração de PDF no cliente |
| localStorage | Persistência sem banco |
| DM Sans / DM Mono | Tipografia |
