'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import categorias from '@/data/politicas.json'
import { Categoria, RegistroChecklist, RespostaItem } from '@/lib/types'
import {
  getRascunho, salvarRascunho, salvarRegistro,
  limparRascunho, getRegistroPorId, calcularConformidade,
  gerarId, MESES
} from '@/lib/storage'
import { gerarPDF } from '@/lib/pdf'

const CATS = categorias as Categoria[]
const totalItens = CATS.reduce((acc, c) => acc + c.items.length, 0)

const COR_VAR: Record<string, string> = {
  blue: 'var(--blue)', purple: 'var(--purple)', teal: 'var(--teal)',
  red: 'var(--red)', amber: 'var(--amber)',
}
const COR_DIM: Record<string, string> = {
  blue: 'var(--blue-dim)', purple: 'var(--purple-dim)', teal: 'var(--teal-dim)',
  red: 'var(--red-dim)', amber: 'var(--amber-dim)',
}

export default function ChecklistPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const isNovo = id === 'novo'

  const [analista, setAnalista] = useState('')
  const [mes, setMes] = useState(String(new Date().getMonth() + 1).padStart(2, '0'))
  const [ano, setAno] = useState(new Date().getFullYear())
  const [respostas, setRespostas] = useState<Record<string, boolean>>({})
  const [catAberta, setCatAberta] = useState<string>(CATS[0].id)
  const [salvando, setSalvando] = useState(false)
  const [registro, setRegistro] = useState<RegistroChecklist | null>(null)
  const [gerandoPDF, setGerandoPDF] = useState(false)

  const soLeitura = !isNovo && registro?.status === 'aprovado'

  useEffect(() => {
    if (isNovo) {
      const rascunho = getRascunho()
      if (rascunho) {
        if (rascunho.analista) setAnalista(rascunho.analista)
        if (rascunho.mes) setMes(rascunho.mes)
        if (rascunho.ano) setAno(rascunho.ano)
        if (rascunho.respostas) {
          const map: Record<string, boolean> = {}
          rascunho.respostas.forEach((r: RespostaItem) => { map[r.itemId] = r.conforme })
          setRespostas(map)
        }
      }
    } else {
      const reg = getRegistroPorId(id)
      if (reg) {
        setRegistro(reg)
        setAnalista(reg.analista)
        setMes(reg.mes)
        setAno(reg.ano)
        const map: Record<string, boolean> = {}
        reg.respostas.forEach(r => { map[r.itemId] = r.conforme })
        setRespostas(map)
      }
    }
  }, [id, isNovo])

  useEffect(() => {
    if (!isNovo) return
    salvarRascunho({
      analista, mes, ano,
      respostas: Object.entries(respostas).map(([itemId, conforme]) => ({ itemId, conforme }))
    })
  }, [analista, mes, ano, respostas, isNovo])

  function toggle(itemId: string) {
    if (soLeitura) return
    setRespostas(prev => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  function buildRegistro(status: RegistroChecklist['status']): RegistroChecklist {
    return {
      id: registro?.id ?? gerarId(),
      mes, ano,
      dataPreenchimento: new Date().toISOString(),
      analista,
      respostas: Object.entries(respostas).map(([itemId, conforme]) => ({ itemId, conforme })),
      status,
      observacaoGestao: registro?.observacaoGestao,
    }
  }

  async function salvar(status: RegistroChecklist['status']) {
    if (!analista.trim()) return alert('Informe o nome do analista.')
    setSalvando(true)
    const reg = buildRegistro(status)
    salvarRegistro(reg)
    if (isNovo) limparRascunho()
    await new Promise(r => setTimeout(r, 400))
    setSalvando(false)
    router.push('/')
  }

  async function baixarPDF() {
    setGerandoPDF(true)
    const reg = buildRegistro(registro?.status ?? 'rascunho')
    await gerarPDF(reg, CATS)
    setGerandoPDF(false)
  }

  const pct = calcularConformidade(
    Object.entries(respostas).map(([itemId, conforme]) => ({ itemId, conforme })),
    totalItens
  )
  const criticos = CATS.flatMap(c => c.items.filter(i => i.criticidade === 'Alta'))
    .filter(i => !respostas[i.id]).length

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Topo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button className="btn" style={{ padding: '6px 10px' }} onClick={() => router.push('/')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600 }}>
            {isNovo ? 'Novo checklist' : `${MESES[parseInt(mes) - 1]} ${ano}`}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {isNovo ? 'Preencha os itens abaixo e envie para aprovação.' : `Preenchido por ${analista}`}
          </p>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'Conformidade', valor: `${pct}%`, cor: pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : 'var(--red)' },
          { label: 'Concluídos', valor: `${Object.values(respostas).filter(Boolean).length} / ${totalItens}`, cor: 'var(--text)' },
          { label: 'Críticos pendentes', valor: String(criticos), cor: criticos > 0 ? 'var(--red)' : 'var(--green)' },
        ].map(m => (
          <div key={m.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: m.cor }}>{m.valor}</div>
          </div>
        ))}
      </div>

      {/* Dados do preenchimento */}
      {isNovo && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 14, color: 'var(--text-muted)' }}>Identificação</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Analista</label>
              <input
                value={analista}
                onChange={e => setAnalista(e.target.value)}
                placeholder="Seu nome"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)',
                  background: 'var(--bg-subtle)', border: '1px solid var(--border-md)',
                  color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Mês</label>
              <select
                value={mes}
                onChange={e => setMes(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)',
                  background: 'var(--bg-subtle)', border: '1px solid var(--border-md)',
                  color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: 13, outline: 'none'
                }}
              >
                {MESES.map((m, i) => (
                  <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Ano</label>
              <input
                type="number"
                value={ano}
                onChange={e => setAno(Number(e.target.value))}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)',
                  background: 'var(--bg-subtle)', border: '1px solid var(--border-md)',
                  color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: 13, outline: 'none'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Categorias */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {CATS.map(cat => {
          const respostasCat = cat.items.map(i => ({ itemId: i.id, conforme: !!respostas[i.id] }))
          const pctCat = calcularConformidade(respostasCat, cat.items.length)
          const aberta = catAberta === cat.id
          const cor = COR_VAR[cat.cor]
          const corDim = COR_DIM[cat.cor]

          return (
            <div key={cat.id} className="card" style={{ overflow: 'hidden', borderColor: aberta ? cor : 'var(--border)' }}>
              <button
                onClick={() => setCatAberta(aberta ? '' : cat.id)}
                style={{
                  width: '100%', padding: '16px 20px', background: 'none', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  color: 'var(--text)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cor }} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{cat.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.descricao}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: cor }}>{pctCat}%</span>
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    style={{ transform: aberta ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-muted)' }}
                  >
                    <path d="M2 5l5 4 5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>

              {aberta && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '8px 20px 16px' }}>
                  {cat.items.map(item => {
                    const checked = !!respostas[item.id]
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggle(item.id)}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12,
                          padding: '10px 0',
                          borderBottom: '1px solid var(--border)',
                          cursor: soLeitura ? 'default' : 'pointer',
                          opacity: soLeitura ? 0.8 : 1,
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                          border: `1.5px solid ${checked ? cor : 'var(--border-md)'}`,
                          background: checked ? corDim : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s'
                        }}>
                          {checked && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2.5 2.5L8 3" stroke={cor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span style={{
                          fontSize: 13, flex: 1, lineHeight: 1.5,
                          color: checked ? 'var(--text-muted)' : 'var(--text)',
                          textDecoration: checked ? 'line-through' : 'none',
                          transition: 'all 0.15s'
                        }}>
                          {item.texto}
                        </span>
                        <span className={`badge badge-${item.criticidade.toLowerCase().replace('é', 'e')}`}>
                          {item.criticidade}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Ações */}
      {!soLeitura && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button className="btn" onClick={baixarPDF} disabled={gerandoPDF}>
            {gerandoPDF ? 'Gerando PDF...' : 'Baixar PDF'}
          </button>
          <button className="btn" onClick={() => salvar('rascunho')} disabled={salvando}>
            Salvar rascunho
          </button>
          <button className="btn-primary btn" onClick={() => salvar('enviado')} disabled={salvando}>
            {salvando ? 'Enviando...' : 'Enviar para aprovação'}
          </button>
        </div>
      )}

      {soLeitura && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={baixarPDF} disabled={gerandoPDF}>
            {gerandoPDF ? 'Gerando...' : 'Baixar PDF'}
          </button>
        </div>
      )}
    </main>
  )
}
