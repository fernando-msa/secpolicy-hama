# SecPolicy HAMA

Plataforma de gestao mensal de conformidade de politicas de seguranca da informacao em instituicoes de saude.

Baseada em **ISO/IEC 27001** · Next.js 15 + TypeScript · Deploy na Vercel.

---

## Sobre

O **SecPolicy HAMA** foi desenvolvido para a **HAMA (Hospital e Maternidade de Aracaju)** com o objetivo de digitalizar o processo de conformidade com politicas de seguranca da informacao.

A ferramenta substitui planilhas manuais por um fluxo estruturado:

1. O analista preenche um checklist mensal com 22 itens em 5 categorias
2. A pontuacao de conformidade e calculada em tempo real
3. Um relatorio PDF e gerado automaticamente para aprovacao da gestao

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Cliente)                 │
│                                                     │
│  Next.js 15 (App Router) + React 18 + Tailwind CSS  │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Pagina   │  │ Checklist│  │  Gerador de PDF  │  │
│  │   Home    │  │  [id]    │  │    (jsPDF)       │  │
│  └────┬─────┘  └────┬─────┘  └──────────────────┘  │
│       │              │                               │
│       └──────┬───────┘                               │
│              │                                       │
│     ┌────────▼────────┐                              │
│     │  lib/storage.ts │                              │
│     │  (REST Client)  │                              │
│     └────────┬────────┘                              │
└──────────────┼──────────────────────────────────────┘
               │ HTTPS
               ▼
┌──────────────────────────────────────────────────────┐
│              Firebase (Backend Servico)               │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │  Authentication   │  │    Cloud Firestore       │  │
│  │  (Anonimo)        │  │  (registros + audit_logs)│  │
│  └──────────────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Caracteristicas da arquitetura:**
- **Sem API routes** — toda comunicacao e feita diretamente do browser para a API REST do Firestore
- **Autenticacao anonima** — cada visitante recebe um UID unico via Firebase Auth
- **Versionamento** — cada salvamento cria uma nova versao do documento, com trilha de auditoria
- **Draft local** — rascunhos sao salvos automaticamente no localStorage

## Stack Tecnologica

| Camada | Tecnologia | Versao |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 15.5 |
| Linguagem | TypeScript (strict) | 5.x |
| UI | React | 18 |
| Estilizacao | Tailwind CSS + CSS Modules | 3.4 |
| PDF | jsPDF (client-side) | 4.2 |
| Auth | Firebase Auth (REST API) | - |
| Banco | Cloud Firestore (REST API) | - |
| Deploy | Vercel | - |
| Testes | Vitest + Testing Library | - |

## Modelos de Dados

### RegistroChecklist
```typescript
{
  id: string
  policyId: string          // agrupa versoes da mesma politica
  uid: string               // ID do usuario Firebase
  version: number           // auto-incrementado a cada salvamento
  mes: string               // "01" a "12"
  ano: number
  dataPreenchimento: string // ISO timestamp
  analista: string
  respostas: RespostaItem[]
  status: 'rascunho' | 'enviado' | 'aprovado' | 'ajuste_solicitado'
  observacaoGestao?: string
}
```

### Categorias do Checklist (22 itens)

| Categoria | Itens | Cor |
|-----------|-------|-----|
| Infraestrutura e servidores | 5 | Azul |
| Controle de acesso | 5 | Roxo |
| Gestao de chamados | 4 | Teal |
| Dados de saude e LGPD | 4 | Vermelho |
| Rotinas e resposta a incidentes | 4 | Amarelo |

## Seguranca

### Modelo de seguranca atual
- **Autenticacao anonima** via Firebase Identity Toolkit REST API
- **Escopo por UID** — consultas ao Firestore filtram por `uid` do usuario autenticado
- **Firestore Security Rules** — camada de protecao no servidor (configuradas no console Firebase)
- **Security headers** — X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy

### Medidas implementadas
- Credenciais Firebase via variaveis de ambiente (sem hardcoded)
- Validação de propriedade em `getRegistroPorId()` (previne IDOR)
- Sanitizacao de IDs de entrada (regex alfanumerico)
- IDs gerados com `crypto.getRandomValues()` (nao previsiveis)
- Validação de comprimento maximo em campos de texto
- Mensagens de erro genericas (sem expor detalhes internos)

### Limitacoes conhecidas
- Autenticacao e totalmente anonima — sem identificacao de usuario
- Tokens armazenados em localStorage (susceptivel a XSS)
- Sem refresh de tokens implementado
- Todas as regras de seguranca dependem do Firestore Security Rules

## Inicio Rapido

### Pre-requisitos
- Node.js 18+
- Projeto Firebase com Authentication (anonimo) e Firestore habilitados

### Instalacao

```bash
# Clonar o repositorio
git clone https://github.com/fernando-msa/secpolicy-hama.git
cd secpolicy-hama

# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.example .env.local
# Edite .env.local com as credenciais do seu projeto Firebase

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` no navegador.

### Variaveis de Ambiente

| Variavel | Obrigatoria | Descricao |
|----------|-------------|-----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Sim | API Key do Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Sim | Dominio de autenticacao |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Sim | ID do projeto Firebase |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Sim | Bucket de armazenamento |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sim | ID do remetente de mensagens |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Sim | ID do aplicativo Firebase |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Nao | ID do Google Analytics |

## Estrutura do Projeto

```
secpolicy-hama/
├── app/
│   ├── layout.tsx              # Layout raiz (fontes, metadata)
│   ├── page.tsx                # Home (dashboard + landing)
│   ├── page.module.css         # Estilos da home
│   ├── globals.css             # Design system (tema escuro)
│   └── checklist/
│       └── [id]/
│           └── page.tsx        # Pagina de checklist
├── lib/
│   ├── firebase.ts             # Config Firebase
│   ├── storage.ts              # Camada de dados (Firestore REST + localStorage)
│   ├── pdf.ts                  # Gerador de PDF (jsPDF)
│   └── types.ts                # Definicoes de tipos TypeScript
├── data/
│   └── politicas.json          # Itens do checklist (5 categorias, 22 itens)
├── __tests__/                  # Testes automatizados
│   ├── setup.ts                # Configuracao do Testing Library
│   ├── lib/                    # Testes unitarios
│   ├── app/                    # Testes de componentes
│   └── integration/            # Testes de integracao
├── docs/                       # Documentacao do produto
├── public/
│   └── robots.txt              # Controle de indexacao
├── .env.example                # Template de variaveis de ambiente
├── vitest.config.ts            # Configuracao do framework de testes
├── next.config.js              # Configuracao do Next.js
├── tailwind.config.js          # Configuracao do Tailwind CSS
└── package.json
```

## Comandos

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de producao
npm run start        # Servidor de producao
npm run lint         # Linting com ESLint
npm run test         # Testes em modo watch
npm run test:run     # Executar testes uma vez
npm run test:coverage # Testes com cobertura
```

## Personalizar o Checklist

Edite o arquivo `data/politicas.json` para adicionar, remover ou modificar itens:

```json
{
  "id": "nova_categoria",
  "label": "Nome da Categoria",
  "descricao": "Descricao da categoria",
  "cor": "blue",
  "items": [
    {
      "id": "item_1",
      "texto": "Descricao do item de verificacao",
      "criticidade": "Alta"
    }
  ]
}
```

Cores disponiveis: `blue`, `purple`, `teal`, `red`, `amber`.

Criticidades: `Alta`, `Media`, `Baixa`.

## Deploy na Vercel

1. Conecte o repositorio GitHub na [Vercel](https://vercel.com)
2. Configure as variaveis de ambiente na dashboard da Vercel
3. O deploy e automatico a cada push na branch `main`

## Roadmap

- [ ] Autenticacao por e-mail/senha ou SSO
- [ ] API routes com Firebase Admin SDK (server-side)
- [ ] Dashboard de gestao com visao multi-usuario
- [ ] Notificacoes e alertas de prazo
- [ ] Integracao com GLPI e outras ferramentas de TISM
- [ ] Exportacao de relatorios em lote
- [ ] Suporte multi-tenant para outras instituicoes
- [ ] Testes E2E com Playwright

## Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes de contribuicao.

## Autor

**Fernando S. De Santana Junior**
Analista de Infraestrutura na HAMA (Hospital e Maternidade de Aracaju)

## Licenca

MIT — veja [LICENSE](LICENSE) para detalhes.
