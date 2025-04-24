-- =====================================================
-- Esquema SQL Mejorado para Sistema de Pagos con Referidos
-- Incluye:
-- • status (SMALLINT) con valores según entidad
-- • transaction_fee y type en transactions
-- • Restricciones y chequeos
-- • Índices de rendimiento
-- • Trigger para updated_at
-- Fecha de generación: 2025-04-21 16:30:46
-- =====================================================
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- si usas gen_random_uuid()
-------------------------------------------------------------
-- 1. users
-------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    type SMALLINT NOT NULL DEFAULT 0 CHECK (type IN (0, 1, 2)),
    status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- type: 0 = user | 1 = worker | 2 = admin
-- status: 0 = disabled | 1 = enabled
CREATE INDEX idx_users_email ON users(email);

-------------------------------------------------------------
-- 2. accounts
-------------------------------------------------------------
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    balance_pending NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    referrer_account_id UUID REFERENCES accounts(id),
    status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-------------------------------------------------------------
-- 3. transactions
-------------------------------------------------------------
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_transaction_id UUID,
    account_origin_id UUID REFERENCES accounts(id),
    account_destination_id UUID REFERENCES accounts(id),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    transaction_fee NUMERIC(12, 2) NOT NULL CHECK (transaction_fee >= 0),
    type SMALLINT NOT NULL DEFAULT 0 CHECK (type IN (0, 1, 2, 3)),
    status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (account_origin_id <> account_destination_id)
);

-- type:    0 = user_to_user | 1 = referral_commission | 2 = platform_fee | 3 = manual_adjustment
-- status:  0 = pending       | 1 = approved           | 2 = cancelled
CREATE INDEX idx_transactions_origin ON transactions(account_origin_id);

CREATE INDEX idx_transactions_destination ON transactions(account_destination_id);

-------------------------------------------------------------
-- 4. commissions
-------------------------------------------------------------
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    beneficiary_id UUID NOT NULL REFERENCES accounts(id),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commissions_beneficiary ON commissions(beneficiary_id);

-------------------------------------------------------------
-- Trigger para actualizar updated_at
-------------------------------------------------------------
CREATE
OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();

RETURN NEW;

END;

$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_set_updated_at BEFORE
UPDATE
    ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_accounts_set_updated_at BEFORE
UPDATE
    ON accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_transactions_set_updated_at BEFORE
UPDATE
    ON transactions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_commissions_set_updated_at BEFORE
UPDATE
    ON commissions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-------------------------------------------------------------
-- Función para recalcular balances
-------------------------------------------------------------
CREATE
OR REPLACE FUNCTION recalculate_account_balances() RETURNS TRIGGER AS $$ BEGIN -- Recalcular balance confirmado (status = 1 approved)
UPDATE
    accounts a
SET
    balance = (
        -- Suma todas las transacciones recibidas aprobadas
        COALESCE(
            (
                SELECT
                    SUM(amount)
                FROM
                    transactions t
                WHERE
                    t.account_destination_id = a.id
                    AND t.status = 1
            ),
            0
        ) - -- Resta todas las transacciones enviadas aprobadas
        COALESCE(
            (
                SELECT
                    SUM(amount)
                FROM
                    transactions t
                WHERE
                    t.account_origin_id = a.id
                    AND t.status = 1
            ),
            0
        )
    )
WHERE
    a.id IN (
        NEW.account_origin_id,
        NEW.account_destination_id
    );

-- Recalcular balance pendiente (status = 0 pending)
UPDATE
    accounts a
SET
    balance_pending = (
        -- Suma todas las transacciones recibidas pendientes
        COALESCE(
            (
                SELECT
                    SUM(amount)
                FROM
                    transactions t
                WHERE
                    t.account_destination_id = a.id
                    AND t.status = 0
            ),
            0
        ) - -- Resta todas las transacciones enviadas pendientes
        COALESCE(
            (
                SELECT
                    SUM(amount)
                FROM
                    transactions t
                WHERE
                    t.account_origin_id = a.id
                    AND t.status = 0
            ),
            0
        )
    )
WHERE
    a.id IN (
        NEW.account_origin_id,
        NEW.account_destination_id
    );

RETURN NEW;

END;

$$ LANGUAGE plpgsql;

-- Crear el trigger
CREATE TRIGGER trg_recalculate_account_balances
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION recalculate_account_balances();


-- Crear function para obtener el balance de un usuario
CREATE OR REPLACE FUNCTION get_account_balance(account_uuid UUID)
RETURNS NUMERIC(12,2) AS $$
DECLARE
  incoming NUMERIC(12,2);
  outgoing NUMERIC(12,2);
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO incoming
  FROM transactions
  WHERE account_destination_id = account_uuid AND status = 1;

  SELECT COALESCE(SUM(amount), 0)
  INTO outgoing
  FROM transactions
  WHERE account_origin_id = account_uuid AND status = 1;

  RETURN incoming - outgoing;
END;
$$ LANGUAGE plpgsql;
