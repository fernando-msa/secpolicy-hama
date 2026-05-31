import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
  firebaseProjectId: 'test-project',
  firebaseApiKey: 'test-api-key',
}))

// Mock storage module
vi.mock('@/lib/storage', () => ({
  ensureUser: vi.fn().mockResolvedValue({ uid: 'test-uid', idToken: 'test-token' }),
  getRascunho: vi.fn().mockReturnValue(null),
  salvarRascunho: vi.fn(),
  salvarRegistro: vi.fn().mockResolvedValue({ id: 'new-id' }),
  limparRascunho: vi.fn(),
  getRegistroPorId: vi.fn().mockResolvedValue(null),
  calcularConformidade: vi.fn().mockReturnValue(0),
  gerarId: vi.fn().mockReturnValue('policy_test_123'),
  MESES: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
}))

// Mock pdf module
vi.mock('@/lib/pdf', () => ({
  gerarPDF: vi.fn().mockResolvedValue(undefined),
}))

// Mock next/navigation
const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }))
vi.mock('next/navigation', () => ({
  useParams: vi.fn().mockReturnValue({ id: 'novo' }),
  useRouter: vi.fn().mockReturnValue({ push: mockPush }),
}))

// Mock politicas.json
vi.mock('@/data/politicas.json', () => ({
  default: [
    {
      id: 'infra',
      label: 'Infraestrutura',
      descricao: 'Servidores',
      cor: 'blue',
      items: [
        { id: 'infra_1', texto: 'Item de teste 1', criticidade: 'Alta' },
        { id: 'infra_2', texto: 'Item de teste 2', criticidade: 'Media' },
      ],
    },
    {
      id: 'acesso',
      label: 'Controle de acesso',
      descricao: 'Acessos',
      cor: 'purple',
      items: [
        { id: 'acesso_1', texto: 'Item de teste 3', criticidade: 'Alta' },
      ],
    },
  ],
}))

import ChecklistPage from '@/app/checklist/[id]/page'

describe('ChecklistPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza o título Novo checklist', async () => {
    render(<ChecklistPage />)
    expect(screen.getByText('Novo checklist')).toBeInTheDocument()
  })

  it('renderiza as categorias', async () => {
    render(<ChecklistPage />)
    expect(screen.getByText('Infraestrutura')).toBeInTheDocument()
    expect(screen.getByText('Controle de acesso')).toBeInTheDocument()
  })

  it('renderiza os itens da categoria aberta', async () => {
    render(<ChecklistPage />)
    expect(screen.getByText('Item de teste 1')).toBeInTheDocument()
    expect(screen.getByText('Item de teste 2')).toBeInTheDocument()
  })

  it('renderiza os badges de criticidade', async () => {
    render(<ChecklistPage />)
    expect(screen.getAllByText('Alta')).toHaveLength(1) // apenas da categoria aberta
    expect(screen.getByText('Media')).toBeInTheDocument()
  })

  it('renderiza o campo de analista', async () => {
    render(<ChecklistPage />)
    expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument()
  })

  it('renderiza os botões de ação', async () => {
    render(<ChecklistPage />)
    expect(screen.getByText('Baixar PDF')).toBeInTheDocument()
    expect(screen.getByText('Salvar rascunho')).toBeInTheDocument()
    expect(screen.getByText('Enviar para aprovação')).toBeInTheDocument()
  })

  it('exibe alerta ao salvar sem analista', async () => {
    const user = userEvent.setup()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<ChecklistPage />)
    await user.click(screen.getByText('Enviar para aprovação'))
    expect(alertSpy).toHaveBeenCalledWith('Informe o nome do analista.')
    alertSpy.mockRestore()
  })

  it('permite preender nome do analista', async () => {
    const user = userEvent.setup()
    render(<ChecklistPage />)
    const input = screen.getByPlaceholderText('Seu nome')
    await user.type(input, 'Fernando')
    expect(input).toHaveValue('Fernando')
  })

  it('renderiza métricas de conformidade', async () => {
    render(<ChecklistPage />)
    expect(screen.getByText('Conformidade')).toBeInTheDocument()
    expect(screen.getByText('Concluídos')).toBeInTheDocument()
    expect(screen.getByText('Críticos pendentes')).toBeInTheDocument()
  })

  it('renderiza UID do usuário', async () => {
    render(<ChecklistPage />)
    expect(screen.getByText(/Usuário autenticado/)).toBeInTheDocument()
  })
})
