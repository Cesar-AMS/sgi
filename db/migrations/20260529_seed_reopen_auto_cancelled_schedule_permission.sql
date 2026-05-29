INSERT INTO permissions (permission_key, name, module, action, is_active)
SELECT 'atendimento.agendamento.reabrir_cancelado_automatico',
       'Reabrir agendamento cancelado automaticamente',
       'Atendimento',
       'reabrir_cancelado_automatico',
       1
WHERE NOT EXISTS (
    SELECT 1
    FROM permissions
    WHERE permission_key = 'atendimento.agendamento.reabrir_cancelado_automatico'
);
