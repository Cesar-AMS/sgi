-- Frente 7A: migration corretiva para bancos onde as tabelas financeiras
-- oficiais ja existiam antes das migrations oficiais recentes.
--
-- Necessaria para alinhar accounts_receivable/accounts_payable ao backend
-- robusto, que espera Status com CANCELLED/PROJECAO e filtros por deleted_at.
--
-- Segura para dados existentes: adiciona apenas colunas/indices ausentes e
-- amplia o ENUM mantendo WAITING/PAID validos, sem apagar ou atualizar registros.

SET @schema_name = 'jmoficial';

-- accounts_receivable: garantir deleted_at
SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE jmoficial.accounts_receivable ADD COLUMN deleted_at DATETIME NULL',
        'SELECT ''accounts_receivable.deleted_at already exists'' AS message'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'accounts_receivable'
      AND COLUMN_NAME = 'deleted_at'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- accounts_payable: garantir deleted_at
SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE jmoficial.accounts_payable ADD COLUMN deleted_at DATETIME NULL',
        'SELECT ''accounts_payable.deleted_at already exists'' AS message'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'accounts_payable'
      AND COLUMN_NAME = 'deleted_at'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ampliar ENUM de Status para suportar cancelamento e projecao.
-- Operacao preserva WAITING/PAID existentes e nao altera valores de linhas.
SET @sql = (
    SELECT IF(
        COLUMN_TYPE <> 'enum(''WAITING'',''PAID'',''CANCELLED'',''PROJECAO'')'
            OR IS_NULLABLE <> 'NO'
            OR COALESCE(COLUMN_DEFAULT, '') <> 'WAITING',
        'ALTER TABLE jmoficial.accounts_receivable MODIFY COLUMN Status ENUM(''WAITING'',''PAID'',''CANCELLED'',''PROJECAO'') NOT NULL DEFAULT ''WAITING''',
        'SELECT ''accounts_receivable.Status already supports required values'' AS message'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'accounts_receivable'
      AND COLUMN_NAME = 'Status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        COLUMN_TYPE <> 'enum(''WAITING'',''PAID'',''CANCELLED'',''PROJECAO'')'
            OR IS_NULLABLE <> 'NO'
            OR COALESCE(COLUMN_DEFAULT, '') <> 'WAITING',
        'ALTER TABLE jmoficial.accounts_payable MODIFY COLUMN Status ENUM(''WAITING'',''PAID'',''CANCELLED'',''PROJECAO'') NOT NULL DEFAULT ''WAITING''',
        'SELECT ''accounts_payable.Status already supports required values'' AS message'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'accounts_payable'
      AND COLUMN_NAME = 'Status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- accounts_receivable: garantir indice para filtros deleted_at IS NULL
SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'CREATE INDEX idx_accounts_receivable_deleted_at ON jmoficial.accounts_receivable (deleted_at)',
        'SELECT ''idx_accounts_receivable_deleted_at already exists'' AS message'
    )
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'accounts_receivable'
      AND INDEX_NAME = 'idx_accounts_receivable_deleted_at'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- accounts_payable: garantir indice para filtros deleted_at IS NULL
SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'CREATE INDEX idx_accounts_payable_deleted_at ON jmoficial.accounts_payable (deleted_at)',
        'SELECT ''idx_accounts_payable_deleted_at already exists'' AS message'
    )
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'accounts_payable'
      AND INDEX_NAME = 'idx_accounts_payable_deleted_at'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
