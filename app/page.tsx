'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRegistros, calcularConformidade, MESES } from '@/lib/storage'
import { RegistroChecklist } from '@/lib/types'
import categorias from '@/data/politicas.json'

const totalItens = categorias.reduce((acc, c) => acc + c.items.length, 0)

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  enviado: 'Aguardando aprovação',
  aprovado: 'Aprovado',
  ajuste_solicitado: 'Ajuste solicitado',
}

const STATUS_COR: Record<string, string> = {
  rascunho: 'var(--text-faint)',
  enviado: 'var(--amber)',
  aprovado: 'var(--green)',
  ajuste_solicitado: 'var(--red)',
}

export default function Home() {
  const [registros, setRegistros] = useState<RegistroChecklist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRegistros()
      .then(setRegistros)
      .finally(() => setLoading(false))
  }, [])

  const ultimo = registros[0]
  const pctUltimo = ultimo ? calcularConformidade(ultimo.respostas, totalItens) : null

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--blue-dim)',
              border: '1px solid var(--blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5L2 4v4c0 3.3 2.5 5.7 6 6.5 3.5-.8 6-3.2 6-6.5V4L8 1.5z" stroke="var(--blue)" strokeWidth="1.2" fill="none" />
              <path d="M5.5 8l1.8 1.8 3.2-3.6" stroke="var(--blue)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>SecPolicy HAMA</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Gestão mensal de políticas de segurança da informação · ISO/IEC 27001</p>
      </div>

      {loading ? (
        <div className="card fade-up" style={{ padding: '24px 28px', marginBottom: 24, textAlign: 'center' }}>
          Carregando dados do Firestore...
        </div>
      ) : ultimo && pctUltimo !== null ? (
        <div className="card fade-up" style={{ padding: '24px 28px', marginBottom: 24, borderColor: 'var(--border-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Último checklist</p>
              <p style={{ fontSize: 20, fontWeight: 600 }}>{MESES[parseInt(ultimo.mes) - 1]} {ultimo.ano}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Analista: {ultimo.analista} · {new Date(ultimo.dataPreenchimento).toLocaleDateString('pt-BR')} · v{ultimo.version}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 40, fontWeight: 600, color: pctUltimo >= 70 ? 'var(--green)' : pctUltimo >= 40 ? 'var(--amber)' : 'var(--red)' }}>{pctUltimo}%</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>conformidade</div>
            </div>
          </div>

          <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 3, margin: '16px 0 12px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                borderRadius: 3,
                width: `${pctUltimo}%`,
                background: pctUltimo >= 70 ? 'var(--green)' : pctUltimo >= 40 ? 'var(--amber)' : 'var(--red)',
                transition: 'width 0.6s ease',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_COR[ultimo.status] ?? 'var(--text-muted)' }}>● {STATUS_LABEL[ultimo.status]}</span>
            <Link href={`/checklist/${ultimo.id}`}>
              <button className="btn" style={{ fontSize: 12 }}>Ver detalhes</button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="card fade-up" style={{ padding: '32px 28px', marginBottom: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>Nenhum checklist preenchido ainda. Comece agora.</p>
        </div>
      )}

      <Link href="/checklist/novo">
        <button className="btn-primary btn" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14, marginBottom: 36 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
          Iniciar checklist do mês
        </button>
      </Link>

      {registros.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Histórico</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {registros.map((r, i) => {
              const pct = calcularConformidade(r.respostas, totalItens)
              return (
                <Link key={r.id} href={`/checklist/${r.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="card fade-up"
                    style={{
                      padding: '14px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      animationDelay: `${i * 40}ms`,
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{MESES[parseInt(r.mes) - 1]} {r.ano}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>{r.analista} · v{r.version}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_COR[r.status] ?? 'var(--text-muted)' }}>{STATUS_LABEL[r.status]}</span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : 'var(--red)' }}>{pct}%</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </main>
  )
}
