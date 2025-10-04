#!/usr/bin/env node

/**
 * Script para gerar chaves seguras para produção
 * Execute: node scripts/generate-secure-keys.js
 */

const crypto = require('crypto');

console.log('🔐 GERADOR DE CHAVES SEGURAS PARA MAINNET');
console.log('==========================================\n');

// Gerar JWT Secret (64 caracteres)
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET=' + jwtSecret);

// Gerar Refresh Token Secret (64 caracteres)
const refreshTokenSecret = crypto.randomBytes(32).toString('hex');
console.log('REFRESH_TOKEN_SECRET=' + refreshTokenSecret);

// Gerar Master Key (128 caracteres)
const masterKey = crypto.randomBytes(64).toString('hex');
console.log('MASTER_KEY=' + masterKey);

// Gerar Encryption Key (32 caracteres)
const encryptionKey = crypto.randomBytes(16).toString('hex');
console.log('ENCRYPTION_KEY=' + encryptionKey);

// Gerar senha forte para banco de dados
const dbPassword = crypto.randomBytes(16).toString('base64').replace(/[+/=]/g, '');
console.log('DB_PASSWORD=' + dbPassword);

// Gerar senha forte para Redis
const redisPassword = crypto.randomBytes(16).toString('base64').replace(/[+/=]/g, '');
console.log('REDIS_PASSWORD=' + redisPassword);

console.log('\n==========================================');
console.log('⚠️  IMPORTANTE:');
console.log('1. Salve essas chaves em local seguro');
console.log('2. NUNCA commite essas chaves no Git');
console.log('3. Use um gerenciador de senhas');
console.log('4. Configure essas chaves nos seus serviços');
console.log('==========================================');
