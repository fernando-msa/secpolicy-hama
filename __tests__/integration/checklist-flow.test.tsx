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

// Mock fetch for Firestore REST API
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: vi.fn().mockReturnValue({ id: 'novo' }),
  useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
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
        { id: 'infra_1', texto: 'Backup verificado', criticidade: 'Alta' },
      ],
    },
  ],
}))

// Mock pdf
vi.mock('@/lib/pdf', () => ({
  gerarPDF: vi.fn().mockResolvedValue(undefined),
}))

import ChecklistPage from '@/app/checklist/[id]/page'
import { useRouter } from 'next/navigation'

describe('Fluxo completo de checklist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()

    // Mock successful auth
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('accounts:signUp')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            localId: 'user-123',
            idToken: 'token-abc',
            refreshToken: 'refresh-xyz',
          }),
        })
      }
      if (url.includes(':runQuery')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      }
      if (url.includes('registros')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            name: 'projects/test/databases/(default)/documents/registros/new-doc-id',
            fields: {},
          }),
        })
      }
      if (url.includes('audit_logs')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
  })

  it('renderiza o checklist novo corretamente', async () => {
    render(<ChecklistPage />)
    expect(screen.getByText('Novo checklist')).toBeInTheDocument()
    expect(screen.getByText('Infraestrutura')).toBeInTheDocument()
    expect(screen.getByText('Backup verificado')).toBeInTheDocument()
  })

  it('permite preencher e enviar checklist', async () => {
    const user = userEvent.setup()
    const mockPush = vi.fn()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    render(<ChecklistPage />)

    // Preencher analista
    const analistaInput = screen.getByPlaceholderText('Seu nome')
    await user.type(analistaInput, 'Fernando')

    // Clicar no item para marcar como conforme
    const item = screen.getByText('Backup verificado')
    await user.click(item)

    // Enviar para aprovação
    await user.click(screen.getByText('Enviar para aprovação'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('salva rascunho no localStorage ao alterar dados', async () => {
    const user = userEvent.setup()
    render(<ChecklistPage />)

    const analistaInput = screen.getByPlaceholderText('Seu nome')
    await user.type(analistaInput, 'Fernando')

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'secpolicy_hama_rascunho',
        expect.any(String),
      )
    })
  })

  it('exibe alerta ao tentar salvar sem analista', async () => {
    const user = userEvent.setup()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<ChecklistPage />)

    await user.click(screen.getByText('Salvar rascunho'))

    expect(alertSpy).toHaveBeenCalledWith('Informe o nome do analista.')
    alertSpy.mockRestore()
  })

  it('atualiza estado ao marcar itens', async () => {
    const user = userEvent.setup()
    render(<ChecklistPage />)

    // Marcar item
    const item = screen.getByText('Backup verificado')
    await user.click(item)

    // Verificar que o item foi marcado (o checkbox deve estar marcado)
    await waitFor(() => {
      expect(screen.getByText('Concluídos')).toBeInTheDocument()
    })
  })
})
