# Roadmap: issues prontas para abertura

Use cada bloco abaixo para abrir uma issue com o template `Proximo passo (roadmap)`.

## 1) Motor de conformidade por dominio com tendencia mensal

Titulo:
`[Roadmap] Motor de conformidade por dominio com tendencia mensal`

Labels sugeridas:
`roadmap`, `enhancement`, `plataforma-compliance`, `governanca`, `analytics`

Objetivo:

Implementar motor de calculo de conformidade por dominio (ex.: acesso, backup, endpoint), com comparativo mensal para leitura de tendencia e risco.

Escopo:

- [ ] Definir estrutura de dominio para itens do checklist.
- [ ] Calcular score por dominio e score global no fechamento do ciclo.
- [ ] Persistir metricas historicas por mes/unidade.
- [ ] Exibir tendencia (subiu, estavel, caiu) por dominio.

Criterios de aceite:

- [ ] Score por dominio exibido no checklist e no resumo mensal.
- [ ] Historico mensal consulta pelo menos os ultimos 12 ciclos.
- [ ] Tendencia calculada com base em pelo menos 3 pontos historicos.
- [ ] Regra de calculo documentada em codigo e README.

Dependencias:

- Modelagem de dados de dominios em `data/politicas.json`.

---

## 2) Modulo de evidencias por controle (anexo, validade, responsavel)

Titulo:
`[Roadmap] Modulo de evidencias por controle (anexo, validade, responsavel)`

Labels sugeridas:
`roadmap`, `enhancement`, `plataforma-compliance`, `governanca`, `auditoria`

Objetivo:

Permitir anexar e gerenciar evidencias por controle, com metadados de validade e responsabilidade para auditoria.

Escopo:

- [ ] Vincular evidencias a cada item do checklist.
- [ ] Registrar responsavel, data de coleta e data de validade.
- [ ] Permitir anexar mais de uma evidencia por controle.
- [ ] Exibir status de evidencia valida, vencendo e vencida.

Criterios de aceite:

- [ ] Cada controle aceita multiplas evidencias com metadados completos.
- [ ] Evidencias vencidas impactam visualmente o risco do controle.
- [ ] Auditor consegue consultar historico de evidencias por periodo.
- [ ] Arquivos e metadados permanecem vinculados apos nova versao do checklist.

Dependencias:

- Definicao de armazenamento de anexos e politica de retencao.

---

## 3) SLA e escalonamento de nao conformidades criticas

Titulo:
`[Roadmap] SLA e escalonamento de nao conformidades criticas`

Labels sugeridas:
`roadmap`, `enhancement`, `plataforma-compliance`, `governanca`, `automacao`

Objetivo:

Criar politica de prazo para tratamento de nao conformidades criticas, com escalonamento automatico quando o SLA for violado.

Escopo:

- [ ] Definir SLA por criticidade (alta, media, baixa).
- [ ] Calcular prazo restante por pendencia aberta.
- [ ] Disparar evento de escalonamento ao violar SLA.
- [ ] Exibir fila priorizada por risco e atraso.

Criterios de aceite:

- [ ] SLA configuravel por criticidade sem alteracao de codigo.
- [ ] Escalonamento registrado em trilha de auditoria.
- [ ] Pendencias fora do SLA aparecem no topo da fila.
- [ ] Relatorio mensal inclui taxa de cumprimento de SLA.

Dependencias:

- Integracao de notificacao (issue 5).

---

## 4) Fila de aprovacao multi-nivel (analista, gestor, comite)

Titulo:
`[Roadmap] Fila de aprovacao multi-nivel (analista, gestor, comite)`

Labels sugeridas:
`roadmap`, `enhancement`, `plataforma-compliance`, `governanca`, `workflow`

Objetivo:

Implementar fluxo formal de aprovacao com etapas e responsabilidades por perfil, garantindo governanca do fechamento mensal.

Escopo:

- [ ] Definir estados de workflow (rascunho, submetido, em revisao, aprovado, rejeitado).
- [ ] Implementar papeis e permissoes por etapa.
- [ ] Permitir comentarios de ajuste por aprovador.
- [ ] Registrar tempo por etapa do workflow.

Criterios de aceite:

- [ ] Nenhum checklist e fechado sem aprovacao do nivel requerido.
- [ ] Rejeicao retorna ao responsavel com justificativa obrigatoria.
- [ ] Historico de transicoes e autoria disponivel para auditoria.
- [ ] Dashboard mostra gargalos por etapa e tempo medio de aprovacao.

Dependencias:

- Definicao de perfis de acesso e estrategia de autenticacao/autorizacao.

---

## 5) Integracao de notificacoes (e-mail e eventos de workflow)

Titulo:
`[Roadmap] Integracao de notificacoes (e-mail e eventos de workflow)`

Labels sugeridas:
`roadmap`, `enhancement`, `plataforma-compliance`, `automacao`, `integracao`

Objetivo:

Automatizar comunicacao operacional com notificacoes por evento de workflow e por agenda mensal de compliance.

Escopo:

- [ ] Disparar notificacao em submissao, aprovacao, rejeicao e escalonamento.
- [ ] Implementar lembrete mensal de abertura/fechamento de ciclo.
- [ ] Configurar destinatarios por papel e unidade.
- [ ] Manter historico de envios por evento.

Criterios de aceite:

- [ ] Eventos criticos geram notificacao em ate 1 minuto.
- [ ] Falhas de envio sao registradas com reprocessamento.
- [ ] Administrador pode ativar/desativar categorias de notificacao.
- [ ] Evidencia de envio aparece na trilha de auditoria.

Dependencias:

- Definicao do provedor de envio e limites operacionais.

---

## 6) Dashboard executivo por unidade, risco e recorrencia

Titulo:
`[Roadmap] Dashboard executivo por unidade, risco e recorrencia`

Labels sugeridas:
`roadmap`, `enhancement`, `plataforma-compliance`, `analytics`, `gestao`

Objetivo:

Entregar painel executivo para leitura de risco, comparativo entre unidades e recorrencia de nao conformidades.

Escopo:

- [ ] Exibir score global e por dominio por unidade.
- [ ] Destacar nao conformidades recorrentes por periodo.
- [ ] Mostrar cumprimento de SLA e backlog aberto.
- [ ] Permitir filtro por periodo, unidade e criticidade.

Criterios de aceite:

- [ ] Gestor visualiza status consolidado sem abrir checklists individuais.
- [ ] Recorrencia considera historico de no minimo 6 meses.
- [ ] Filtros mantem consistencia entre cards e graficos.
- [ ] Dados exportaveis para comite executivo.

Dependencias:

- Motor de conformidade (issue 1) e SLA (issue 3).

---

## 7) Export estruturado para BI/Excel e trilha de auditoria externa

Titulo:
`[Roadmap] Export estruturado para BI/Excel e trilha de auditoria externa`

Labels sugeridas:
`roadmap`, `enhancement`, `plataforma-compliance`, `integracao`, `auditoria`

Objetivo:

Disponibilizar exportacao de dados em formato estruturado para analise externa e atendimento a auditorias.

Escopo:

- [ ] Exportar datasets de checklist, score, pendencias e evidencias.
- [ ] Definir layout padrao de colunas para BI/Excel.
- [ ] Permitir export por periodo, unidade e status.
- [ ] Incluir trilha de auditoria no pacote exportado.

Criterios de aceite:

- [ ] Arquivo exportado abre sem ajustes manuais em Excel.
- [ ] Campos obrigatorios de auditoria estao presentes (autor, data, versao, status).
- [ ] Exportacao respeita filtros aplicados no dashboard.
- [ ] Documento de dicionario de dados publicado no repositorio.

Dependencias:

- Definicao de governanca de dados e politica de compartilhamento externo.

---

## 8) Baseline de operacao: logs, monitoracao e alertas de disponibilidade

Titulo:
`[Roadmap] Baseline de operacao: logs, monitoracao e alertas de disponibilidade`

Labels sugeridas:
`roadmap`, `enhancement`, `plataforma-compliance`, `observabilidade`, `operacao`

Objetivo:

Estabelecer baseline de operacao para plataforma em producao com telemetria, logs e alertas para continuidade do servico.

Escopo:

- [ ] Instrumentar logs estruturados para eventos criticos.
- [ ] Definir metricas minimas (erro, latencia, disponibilidade).
- [ ] Configurar alertas para indisponibilidade e falha de workflow.
- [ ] Criar playbook de resposta a incidentes operacionais.

Criterios de aceite:

- [ ] Time recebe alerta em ate 5 minutos de indisponibilidade.
- [ ] Logs permitem rastrear transacao fim a fim por identificador.
- [ ] Painel operacional mostra saude dos principais fluxos.
- [ ] Playbook documentado e validado em simulacao.

Dependencias:

- Definicao de ferramenta de monitoracao/alerta e canais de resposta.
