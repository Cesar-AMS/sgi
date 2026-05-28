# Auditoria de backfill de dono numerico dos Leads

Escopo: diagnostico para leads antigos com `owner_user_id` nulo. Nao executar UPDATE, backfill automatico ou bloqueio de acesso sem validacao operacional.

## Campos candidatos

- `leads.owner_user_id`, `coordinator_user_id`, `manager_user_id`, `assigned_at`, `assigned_by_user_id`: campos novos e confiaveis quando preenchidos.
- `leads.Vendedor`, `Coordenador`, `Gerente`: campos legados string, podem conter ID em texto, nome ou valor antigo.
- `lead_transfer_history.new_seller_id`: historico de transferencia com ID quando foi possivel converter responsavel para numero.
- `LeadSchedules.UserId`: responsavel numerico do agendamento/visita, vinculado ao lead.
- `LeadActivities.Author`: autor textual, util para auditoria, mas nao confiavel como dono.

## SQLs SELECT de diagnostico

### 1. Total de leads

```sql
SELECT COUNT(*) AS total_leads
FROM jmoficial.leads;
```

### 2. Leads sem dono numerico

```sql
SELECT COUNT(*) AS leads_sem_owner
FROM jmoficial.leads
WHERE owner_user_id IS NULL;
```

### 3. Distribuicao por Vendedor legado

```sql
SELECT
  COALESCE(NULLIF(TRIM(Vendedor), ''), '(vazio)') AS vendedor_legado,
  COUNT(*) AS total
FROM jmoficial.leads
WHERE owner_user_id IS NULL
GROUP BY COALESCE(NULLIF(TRIM(Vendedor), ''), '(vazio)')
ORDER BY total DESC, vendedor_legado;
```

### 4. Leads com Vendedor numerico

```sql
SELECT Id, Nome, Vendedor, DataCriacao
FROM jmoficial.leads
WHERE owner_user_id IS NULL
  AND TRIM(COALESCE(Vendedor, '')) REGEXP '^[0-9]+$'
ORDER BY DataCriacao DESC;
```

### 5. Leads com Vendedor textual

```sql
SELECT Id, Nome, Vendedor, DataCriacao
FROM jmoficial.leads
WHERE owner_user_id IS NULL
  AND TRIM(COALESCE(Vendedor, '')) <> ''
  AND TRIM(COALESCE(Vendedor, '')) NOT REGEXP '^[0-9]+$'
ORDER BY Vendedor, DataCriacao DESC;
```

### 6. Match de Vendedor numerico com users

```sql
SELECT
  l.Id AS lead_id,
  l.Nome AS lead_nome,
  l.Vendedor,
  u.id AS user_id,
  u.name AS user_name,
  u.hidden,
  u.access_enabled
FROM jmoficial.leads l
LEFT JOIN jmoficial.users u
  ON u.id = CAST(TRIM(l.Vendedor) AS UNSIGNED)
WHERE l.owner_user_id IS NULL
  AND TRIM(COALESCE(l.Vendedor, '')) REGEXP '^[0-9]+$'
ORDER BY l.DataCriacao DESC;
```

### 7. Match de Vendedor textual com users

```sql
SELECT
  l.Id AS lead_id,
  l.Nome AS lead_nome,
  l.Vendedor,
  COUNT(u.id) AS candidatos_encontrados,
  GROUP_CONCAT(CONCAT(u.id, ':', u.name) ORDER BY u.id SEPARATOR ' | ') AS candidatos
FROM jmoficial.leads l
LEFT JOIN jmoficial.users u
  ON LOWER(TRIM(u.name)) = LOWER(TRIM(l.Vendedor))
WHERE l.owner_user_id IS NULL
  AND TRIM(COALESCE(l.Vendedor, '')) <> ''
  AND TRIM(COALESCE(l.Vendedor, '')) NOT REGEXP '^[0-9]+$'
GROUP BY l.Id, l.Nome, l.Vendedor
ORDER BY candidatos_encontrados DESC, l.Vendedor, l.Id;
```

### 8. Homonimos em users

```sql
SELECT
  LOWER(TRIM(name)) AS nome_normalizado,
  COUNT(*) AS total_usuarios,
  GROUP_CONCAT(CONCAT(id, ':', name) ORDER BY id SEPARATOR ' | ') AS usuarios
FROM jmoficial.users
WHERE TRIM(COALESCE(name, '')) <> ''
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1
ORDER BY total_usuarios DESC, nome_normalizado;
```

### 9. Ultimo LeadSchedule por lead com UserId

```sql
SELECT
  x.LeadId AS lead_id,
  l.Nome AS lead_nome,
  l.Vendedor AS vendedor_legado,
  x.UserId AS schedule_user_id,
  u.name AS schedule_user_name,
  x.ScheduledAt AS ultimo_agendamento,
  x.TipoAgenda,
  x.Status
FROM (
  SELECT ls.*,
         ROW_NUMBER() OVER (PARTITION BY ls.LeadId ORDER BY ls.ScheduledAt DESC, ls.Id DESC) AS rn
  FROM jmoficial.LeadSchedules ls
  WHERE ls.LeadId IS NOT NULL
    AND ls.UserId IS NOT NULL
    AND ls.UserId > 0
) x
JOIN jmoficial.leads l ON l.Id = x.LeadId
LEFT JOIN jmoficial.users u ON u.id = x.UserId
WHERE x.rn = 1
  AND l.owner_user_id IS NULL
ORDER BY x.ScheduledAt DESC;
```

### 10. Historico de transferencia com novo vendedor numerico

```sql
SELECT
  h.lead_id,
  l.Nome AS lead_nome,
  l.Vendedor AS vendedor_legado,
  h.new_seller_id,
  u.name AS new_seller_name,
  h.created_at,
  h.change_reason
FROM jmoficial.lead_transfer_history h
JOIN jmoficial.leads l ON l.Id = h.lead_id
LEFT JOIN jmoficial.users u ON u.id = h.new_seller_id
WHERE l.owner_user_id IS NULL
  AND h.new_seller_id IS NOT NULL
ORDER BY h.lead_id, h.created_at DESC, h.id DESC;
```

### 11. Candidatos conflitantes por schedule e transferencia

```sql
SELECT
  l.Id AS lead_id,
  l.Nome AS lead_nome,
  last_schedule.UserId AS schedule_user_id,
  last_transfer.new_seller_id AS transfer_user_id
FROM jmoficial.leads l
LEFT JOIN (
  SELECT LeadId, UserId
  FROM (
    SELECT ls.LeadId,
           ls.UserId,
           ROW_NUMBER() OVER (PARTITION BY ls.LeadId ORDER BY ls.ScheduledAt DESC, ls.Id DESC) AS rn
    FROM jmoficial.LeadSchedules ls
    WHERE ls.UserId IS NOT NULL AND ls.UserId > 0
  ) s
  WHERE rn = 1
) last_schedule ON last_schedule.LeadId = l.Id
LEFT JOIN (
  SELECT lead_id, new_seller_id
  FROM (
    SELECT h.lead_id,
           h.new_seller_id,
           ROW_NUMBER() OVER (PARTITION BY h.lead_id ORDER BY h.created_at DESC, h.id DESC) AS rn
    FROM jmoficial.lead_transfer_history h
    WHERE h.new_seller_id IS NOT NULL
  ) t
  WHERE rn = 1
) last_transfer ON last_transfer.lead_id = l.Id
WHERE l.owner_user_id IS NULL
  AND last_schedule.UserId IS NOT NULL
  AND last_transfer.new_seller_id IS NOT NULL
  AND last_schedule.UserId <> last_transfer.new_seller_id
ORDER BY l.Id;
```

## Regra recomendada

1. Nao mexer em leads com `owner_user_id` preenchido.
2. Sugerir preenchimento automatico somente quando houver um unico candidato numerico confiavel.
3. Prioridade sugerida para proposta de dono:
   - ultimo registro de transferencia com `new_seller_id`;
   - ultimo `LeadSchedules.UserId` valido;
   - `Vendedor` numerico que bate com `users.id`, desde que usuario exista e esteja apto.
4. `Vendedor` textual deve ir para revisao manual, mesmo quando houver match por nome.
5. Qualquer conflito entre transferencia, schedule e vendedor legado deve ir para revisao manual.

## Estrategias possiveis

- Conservadora: preencher apenas casos 100% confiaveis e deixar o restante nulo.
- Manual: gerar CSV/Excel com candidatos para validacao do diretor antes de UPDATE.
- Sem backfill: manter antigos sem dono e aplicar regras de dono apenas para leads novos.

## Itens de revisao manual

- `Vendedor` textual.
- Usuarios homonimos.
- Usuario candidato `hidden = 1` ou `access_enabled = 0`.
- Conflito entre ultimo schedule e ultima transferencia.
- Lead sem schedule, sem transferencia e sem vendedor numerico.
