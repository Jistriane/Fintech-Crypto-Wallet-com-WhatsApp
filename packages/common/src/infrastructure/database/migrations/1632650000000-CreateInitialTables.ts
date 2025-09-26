import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1632650000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar enum types
    await queryRunner.query(`
      CREATE TYPE kyc_status_enum AS ENUM ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED');
      CREATE TYPE kyc_level_enum AS ENUM ('LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3');
      CREATE TYPE network_enum AS ENUM ('POLYGON', 'BSC');
      CREATE TYPE transaction_type_enum AS ENUM (
        'SWAP',
        'TRANSFER',
        'LIQUIDITY_ADD',
        'LIQUIDITY_REMOVE',
        'FIAT_DEPOSIT',
        'FIAT_WITHDRAWAL'
      );
      CREATE TYPE transaction_status_enum AS ENUM (
        'PENDING',
        'PROCESSING',
        'CONFIRMED',
        'FAILED',
        'CANCELLED'
      );
    `);

    // Criar tabela users
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255),
        kyc_status kyc_status_enum DEFAULT 'PENDING',
        kyc_level kyc_level_enum DEFAULT 'LEVEL_0',
        whatsapp_opt_in BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Criar tabela wallets
    await queryRunner.query(`
      CREATE TABLE wallets (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        address VARCHAR(42) UNIQUE NOT NULL,
        private_key_encrypted TEXT NOT NULL,
        network network_enum NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Criar tabela token_balances
    await queryRunner.query(`
      CREATE TABLE token_balances (
        id UUID PRIMARY KEY,
        wallet_id UUID REFERENCES wallets(id),
        token_address VARCHAR(42) NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        decimals INTEGER NOT NULL,
        network network_enum NOT NULL,
        balance NUMERIC(36, 18) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(wallet_id, token_address, network)
      );
    `);

    // Criar tabela transactions
    await queryRunner.query(`
      CREATE TABLE transactions (
        id UUID PRIMARY KEY,
        wallet_id UUID REFERENCES wallets(id),
        type transaction_type_enum NOT NULL,
        status transaction_status_enum DEFAULT 'PENDING',
        from_address VARCHAR(42) NOT NULL,
        to_address VARCHAR(42) NOT NULL,
        token_address VARCHAR(42) NOT NULL,
        amount NUMERIC(36, 18) NOT NULL,
        hash VARCHAR(66),
        failure_reason TEXT,
        confirmed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Criar índices
    await queryRunner.query(`
      CREATE INDEX idx_users_kyc_status ON users(kyc_status);
      CREATE INDEX idx_users_kyc_level ON users(kyc_level);
      CREATE INDEX idx_wallets_user_id ON wallets(user_id);
      CREATE INDEX idx_wallets_network ON wallets(network);
      CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
      CREATE INDEX idx_transactions_status ON transactions(status);
      CREATE INDEX idx_transactions_created_at ON transactions(created_at);
      CREATE INDEX idx_token_balances_wallet_id ON token_balances(wallet_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover tabelas
    await queryRunner.query(`
      DROP TABLE IF EXISTS transactions;
      DROP TABLE IF EXISTS token_balances;
      DROP TABLE IF EXISTS wallets;
      DROP TABLE IF EXISTS users;
    `);

    // Remover enum types
    await queryRunner.query(`
      DROP TYPE IF EXISTS transaction_status_enum;
      DROP TYPE IF EXISTS transaction_type_enum;
      DROP TYPE IF EXISTS network_enum;
      DROP TYPE IF EXISTS kyc_level_enum;
      DROP TYPE IF EXISTS kyc_status_enum;
    `);
  }
}
