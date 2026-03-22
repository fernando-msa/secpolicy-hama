'use client'

import { RegistroChecklist } from './types'
import { Categoria } from './types'
import { calcularConformidade, MESES } from './storage'

export async function gerarPDF(
  registro: RegistroChecklist,
  categorias: Categoria[]
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const totalItens = categorias.reduce((acc, c) => acc + c.items.length, 0)
  const pct = calcularConformidade(registro.respostas, totalItens)
  const conformes = registro.respostas.filter(r => r.conforme).length
  const criticos = categorias.flatMap(c =>
    c.items.filter(i => i.criticidade === 'Alta')
  ).filter(i => !registro.respostas.find(r => r.itemId === i.id)?.conforme).length

  const mesLabel = MESES[parseInt(registro.mes) - 1]
  const dataFormatada = new Date(registro.dataPreenchimento).toLocaleDateString('pt-BR')

  const W = 210
  let y = 0

  // Cabeçalho
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, W, 42, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('SecPolicy HAMA', 14, 16)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Relatório de Conformidade em Segurança da Informação', 14, 24)
  doc.text(`${mesLabel} / ${registro.ano}  ·  Analista: ${registro.analista}  ·  Emitido em ${dataFormatada}`, 14, 32)

  // Badge de status
  const statusCor = pct >= 70 ? [22, 163, 74] : pct >= 40 ? [217, 119, 6] : [220, 38, 38]
  const statusLabel = pct >= 70 ? 'Boa conformidade' : pct >= 40 ? 'Conformidade parcial' : 'Conformidade crítica'
  doc.setFillColor(...statusCor as [number, number, number])
  doc.roundedRect(W - 62, 10, 48, 10, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(statusLabel, W - 38, 16.5, { align: 'center' })

  y = 52

  // Cards de métricas
  const cards = [
    { label: 'Conformidade geral', valor: `${pct}%`, cor: statusCor },
    { label: 'Itens conformes', valor: `${conformes} / ${totalItens}`, cor: [59, 130, 246] },
    { label: 'Críticos pendentes', valor: String(criticos), cor: criticos > 0 ? [220, 38, 38] : [22, 163, 74] },
    { label: 'Referência', valor: 'ISO/IEC 27001', cor: [100, 116, 139] },
  ]

  const cardW = (W - 28 - 9) / 4
  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + 3)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(x, y, cardW, 20, 2, 2, 'F')
    doc.setFillColor(...card.cor as [number, number, number])
    doc.roundedRect(x, y, cardW, 2, 1, 1, 'F')
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(card.label, x + cardW / 2, y + 8, { align: 'center' })
    doc.setTextColor(...card.cor as [number, number, number])
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(card.valor, x + cardW / 2, y + 16, { align: 'center' })
  })

  y += 28

  // Barra de progresso
  doc.setFillColor(226, 232, 240)
  doc.roundedRect(14, y, W - 28, 5, 2, 2, 'F')
  doc.setFillColor(...statusCor as [number, number, number])
  doc.roundedRect(14, y, Math.max(4, (W - 28) * pct / 100), 5, 2, 2, 'F')

  y += 12

  // Detalhamento por categoria
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('Detalhamento por categoria', 14, y)
  y += 6

  const CORES_CAT: Record<string, [number, number, number]> = {
    blue:   [59, 130, 246],
    purple: [139, 92, 246],
    teal:   [20, 184, 166],
    red:    [239, 68, 68],
    amber:  [245, 158, 11],
  }

  for (const cat of categorias) {
    const respostasCat = registro.respostas.filter(r =>
      cat.items.some(i => i.id === r.itemId)
    )
    const pctCat = calcularConformidade(respostasCat, cat.items.length)
    const cor = CORES_CAT[cat.cor] ?? [100, 116, 139]

    if (y > 250) { doc.addPage(); y = 14 }

    // Header da categoria
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(14, y, W - 28, 8, 2, 2, 'F')
    doc.setFillColor(...cor)
    doc.roundedRect(14, y, 3, 8, 1, 1, 'F')
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(cat.label, 20, y + 5.5)
    doc.setTextColor(...cor)
    doc.setFontSize(9)
    doc.text(`${pctCat}%`, W - 14, y + 5.5, { align: 'right' })
    y += 10

    // Itens
    for (const item of cat.items) {
      if (y > 270) { doc.addPage(); y = 14 }
      const resposta = registro.respostas.find(r => r.itemId === item.id)
      const conforme = resposta?.conforme ?? false

      doc.setFillColor(conforme ? 240, 253, 244 : 254, 242, 242)
      doc.roundedRect(14, y, W - 28, 7, 1, 1, 'F')

      // Ícone
      doc.setFillColor(conforme ? 22, 163, 74 : 239, 68, 68)
      doc.circle(18.5, y + 3.5, 1.5, 'F')

      // Criticidade badge
      const critCor: Record<string, [number, number, number]> = {
        Alta:  [254, 226, 226],
        Média: [254, 243, 199],
        Baixa: [220, 252, 231],
      }
      const critTxt: Record<string, [number, number, number]> = {
        Alta:  [153, 27, 27],
        Média: [146, 64, 14],
        Baixa: [21, 128, 61],
      }
      const cw = item.criticidade === 'Média' ? 11 : 9
      const cx = W - 14 - cw
      doc.setFillColor(...(critCor[item.criticidade] ?? [240, 240, 240]) as [number, number, number])
      doc.roundedRect(cx, y + 1.5, cw, 4, 1, 1, 'F')
      doc.setTextColor(...(critTxt[item.criticidade] ?? [80, 80, 80]) as [number, number, number])
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text(item.criticidade, cx + cw / 2, y + 4.5, { align: 'center' })

      doc.setTextColor(conforme ? 21, 128, 61 : 153, 27, 27)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      const maxW = W - 28 - 10 - cw - 2
      const linhas = doc.splitTextToSize(item.texto, maxW)
      doc.text(linhas[0], 22, y + 4.5)
      y += 8
    }
    y += 3
  }

  // Observação da gestão
  if (registro.observacaoGestao) {
    if (y > 240) { doc.addPage(); y = 14 }
    doc.setFillColor(239, 246, 255)
    doc.roundedRect(14, y, W - 28, 20, 2, 2, 'F')
    doc.setTextColor(59, 130, 246)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('Observação da gestão', 18, y + 7)
    doc.setTextColor(30, 64, 175)
    doc.setFont('helvetica', 'normal')
    const obs = doc.splitTextToSize(registro.observacaoGestao, W - 36)
    doc.text(obs.slice(0, 2), 18, y + 13)
    y += 24
  }

  // Rodapé
  doc.setFillColor(248, 250, 252)
  doc.rect(0, 282, W, 15, 'F')
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('SecPolicy HAMA  ·  Baseado em ISO/IEC 27001  ·  Documento gerado automaticamente', W / 2, 290, { align: 'center' })

  doc.save(`secpolicy_hama_${registro.mes}_${registro.ano}.pdf`)
}
