
-- =====================================================
-- 1. USUÁRIOS
-- =====================================================

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX users_email_unique
ON users (LOWER(email));


-- =====================================================
-- 2. PRODUTOS / MATERIAIS
-- =====================================================

CREATE TABLE products (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    name VARCHAR(150) NOT NULL,
    category VARCHAR(80),

    unit VARCHAR(10) NOT NULL
        CHECK (
            unit IN (
                'unidade',
                'par',
                'caixa',
                'frasco',
                'ml',
                'g'
            )
        ),

    quantity NUMERIC(12,3) NOT NULL DEFAULT 0
        CHECK (quantity >= 0),

    minimum_quantity NUMERIC(12,3) NOT NULL DEFAULT 0
        CHECK (minimum_quantity >= 0),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unidades de contagem exigem números inteiros.
    CONSTRAINT products_integer_units CHECK (
        unit IN ('ml', 'g')
        OR (
            quantity = TRUNC(quantity)
            AND minimum_quantity = TRUNC(minimum_quantity)
        )
    )
);

-- Evita nomes duplicados entre produtos ativos
-- do mesmo usuário, ignorando maiúsculas/minúsculas.
CREATE UNIQUE INDEX products_user_name_unique
ON products (user_id, LOWER(name))
WHERE is_active = TRUE;

CREATE INDEX products_user_id_idx
ON products (user_id);


-- =====================================================
-- 3. MOVIMENTAÇÕES DE ESTOQUE
-- =====================================================

CREATE TABLE stock_movements (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    product_id BIGINT NOT NULL
        REFERENCES products(id) ON DELETE RESTRICT,

    type VARCHAR(10) NOT NULL
        CHECK (type IN ('entrada', 'saida')),

    quantity NUMERIC(12,3) NOT NULL
        CHECK (quantity > 0),

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX stock_movements_product_date_idx
ON stock_movements (product_id, created_at DESC);

CREATE INDEX stock_movements_user_date_idx
ON stock_movements (user_id, created_at DESC);


-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- IMPORTANTE:
-- O estoque NÃO é atualizado automaticamente por um
-- trigger. O Node.js fará as operações de estoque
-- usando transações no PostgreSQL.
