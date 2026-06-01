import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock firebase module before any imports
vi.mock('@/lib/firebase', () => ({
  firebaseConfig: {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test.appspot.com',
    messagingSenderId: '123456',
    appId: '1:123456:web:abc',
    measurementId: '',
  },
  getFirebaseProjectId: () => 'test-project',
  getFirebaseApiKey: () => 'test-api-key',
}))

// Mock storage module
vi.mock('@/lib/storage', () => ({
  getRegistros: vi.fn().mockResolvedValue([]),
  calcularConformidade: vi.fn().mockReturnValue(0),
  MESES: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

// Mock CSS modules
vi.mock('./page.module.css', () => ({
  default: {
    page: 'page',
    heroSection: 'heroSection',
    heroGlow: 'heroGlow',
    heroContent: 'heroContent',
    heroBadge: 'heroBadge',
    heroTitle: 'heroTitle',
    heroText: 'heroText',
    kpiGrid: 'kpiGrid',
    kpiCard: 'kpiCard',
    kpiLabel: 'kpiLabel',
    kpiValue: 'kpiValue',
    actions: 'actions',
    ctaLink: 'ctaLink',
    grid3: 'grid3',
    stepCard: 'stepCard',
    stepTitle: 'stepTitle',
    stepDesc: 'stepDesc',
    sectionCard: 'sectionCard',
    sectionTop: 'sectionTop',
    sectionEyebrow: 'sectionEyebrow',
    sectionTitle: 'sectionTitle',
    offerLink: 'offerLink',
    planGrid: 'planGrid',
    planCard: 'planCard',
    planCardHighlight: 'planCardHighlight',
    planProfile: 'planProfile',
    planName: 'planName',
    planDesc: 'planDesc',
    planPrice: 'planPrice',
    valueGrid: 'valueGrid',
    valueCard: 'valueCard',
    valueTitle: 'valueTitle',
    valueText: 'valueText',
    sectionCardBlue: 'sectionCardBlue',
    sectionEyebrowBlue: 'sectionEyebrowBlue',
    sectionTitleMb: 'sectionTitleMb',
    sectionText: 'sectionText',
    formGrid: 'formGrid',
    input: 'input',
    linkButtons: 'linkButtons',
    linkBtn: 'linkBtn',
    centerCard: 'centerCard',
    lastCard: 'lastCard',
    lastTop: 'lastTop',
    lastTitle: 'lastTitle',
    lastMeta: 'lastMeta',
    mutedSmall: 'mutedSmall',
    scoreWrap: 'scoreWrap',
    scoreValue: 'scoreValue',
    progress: 'progress',
    lastBottom: 'lastBottom',
    status: 'status',
    detailsBtn: 'detailsBtn',
    emptyCard: 'emptyCard',
    emptyText: 'emptyText',
    historyTitle: 'historyTitle',
    historyList: 'historyList',
    historyLink: 'historyLink',
    historyCard: 'historyCard',
    historyMain: 'historyMain',
    historySub: 'historySub',
    historyRight: 'historyRight',
    historyPct: 'historyPct',
    scoreGood: 'scoreGood',
    scoreWarn: 'scoreWarn',
    scoreBad: 'scoreBad',
    progressGood: 'progressGood',
    progressWarn: 'progressWarn',
    progressBad: 'progressBad',
    statusDraft: 'statusDraft',
    statusEnviado: 'statusEnviado',
    statusAprovado: 'statusAprovado',
    statusAjuste: 'statusAjuste',
  },
}))

import Home from '@/app/page'

describe('Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza o título SecPolicy HAMA', async () => {
    render(<Home />)
    expect(screen.getByText('SecPolicy HAMA')).toBeInTheDocument()
  })

  it('renderiza os KPIs', async () => {
    render(<Home />)
    expect(screen.getByText('Itens')).toBeInTheDocument()
    expect(screen.getByText('Categorias')).toBeInTheDocument()
    expect(screen.getByText('Histórico')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renderiza a seção de planos', async () => {
    render(<Home />)
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('renderiza o formulário de demo', async () => {
    render(<Home />)
    expect(screen.getByPlaceholderText('Instituição')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nome do contato')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Prazo esperado (ex.: 30 dias)')).toBeInTheDocument()
  })

  it('renderiza o link para iniciar checklist', async () => {
    render(<Home />)
    const link = screen.getByText('Iniciar checklist do mês')
    expect(link).toHaveAttribute('href', '/checklist/novo')
  })

  it('renderiza mensagem quando não há dados', async () => {
    render(<Home />)
    await waitFor(() => {
      expect(screen.getByText(/Nenhum checklist/)).toBeInTheDocument()
    })
  })

  it('renderiza os steps do fluxo demo', async () => {
    render(<Home />)
    expect(screen.getByText('1. Checklist mensal')).toBeInTheDocument()
    expect(screen.getByText('2. Score em tempo real')).toBeInTheDocument()
    expect(screen.getByText('3. PDF executivo')).toBeInTheDocument()
  })
})
