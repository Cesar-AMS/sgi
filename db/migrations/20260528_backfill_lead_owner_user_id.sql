UPDATE leads l
JOIN users u
  ON u.id = CAST(l.Vendedor AS UNSIGNED)
SET
  l.owner_user_id = u.id,
  l.assigned_at = COALESCE(l.assigned_at, l.DataCriacao),
  l.assigned_by_user_id = COALESCE(l.assigned_by_user_id, u.id)
WHERE
  (l.owner_user_id IS NULL OR l.owner_user_id = 0)
  AND l.Vendedor REGEXP '^[0-9]+$';
