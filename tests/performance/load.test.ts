import { check } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';
import { sleep } from 'k6';

// Custom metrics
const failureRate = new Rate('failed_requests');

// Test configuration
export const options = {
  // Test scenarios
  scenarios: {
    // Smoke test
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      tags: { test_type: 'smoke' },
    },
    // Load test
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 100 }, // Ramp up to 100 users
        { duration: '10m', target: 100 }, // Stay at 100 users
        { duration: '5m', target: 0 }, // Ramp down to 0
      ],
      tags: { test_type: 'load' },
    },
    // Stress test
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 100 }, // Ramp up to 100 users
        { duration: '5m', target: 100 }, // Stay at 100
        { duration: '3m', target: 200 }, // Ramp up to 200
        { duration: '5m', target: 200 }, // Stay at 200
        { duration: '3m', target: 300 }, // Ramp up to 300
        { duration: '5m', target: 300 }, // Stay at 300
        { duration: '3m', target: 0 }, // Ramp down to 0
      ],
      tags: { test_type: 'stress' },
    },
    // Spike test
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 }, // Ramp up to 50 users
        { duration: '3m', target: 50 }, // Stay at 50
        { duration: '1m', target: 300 }, // Spike to 300 users
        { duration: '3m', target: 300 }, // Stay at 300
        { duration: '1m', target: 50 }, // Drop to 50
        { duration: '3m', target: 50 }, // Stay at 50
        { duration: '2m', target: 0 }, // Ramp down to 0
      ],
      tags: { test_type: 'spike' },
    },
    // Soak test
    soak: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 50 }, // Ramp up to 50 users
        { duration: '4h', target: 50 }, // Stay at 50 for 4 hours
        { duration: '5m', target: 0 }, // Ramp down to 0
      ],
      tags: { test_type: 'soak' },
    },
  },
  // Thresholds
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete within 2s
    http_req_failed: ['rate<0.01'], // Less than 1% of requests can fail
    failed_requests: ['rate<0.05'], // Custom metric threshold
  },
};

// Test setup
const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api';
const USERS = JSON.parse(open('./users.json')); // Pre-generated test users
let userIndex = 0;

// Helper functions
function getNextUser() {
  const user = USERS[userIndex];
  userIndex = (userIndex + 1) % USERS.length;
  return user;
}

function getAuthToken() {
  const user = getNextUser();
  const loginRes = http.post(`${BASE_URL}/auth/login`, {
    email: user.email,
    password: user.password,
  });
  return loginRes.json('token');
}

// Main test function
export default function () {
  const token = getAuthToken();
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  // Group: Authentication
  {
    const loginRes = http.post(`${BASE_URL}/auth/login`, {
      email: getNextUser().email,
      password: getNextUser().password,
    });
    check(loginRes, {
      'login successful': (r) => r.status === 200,
      'login time OK': (r) => r.timings.duration < 1000,
    });
    failureRate.add(loginRes.status !== 200);
  }

  // Group: Wallet Operations
  {
    // Get wallet balance
    const balanceRes = http.get(`${BASE_URL}/wallet/balance`, params);
    check(balanceRes, {
      'balance successful': (r) => r.status === 200,
      'balance time OK': (r) => r.timings.duration < 1000,
    });
    failureRate.add(balanceRes.status !== 200);

    // Get transaction history
    const historyRes = http.get(`${BASE_URL}/wallet/transactions`, params);
    check(historyRes, {
      'history successful': (r) => r.status === 200,
      'history time OK': (r) => r.timings.duration < 1000,
    });
    failureRate.add(historyRes.status !== 200);

    // Send transaction
    const sendRes = http.post(`${BASE_URL}/wallet/send`, {
      toAddress: '0x1234567890123456789012345678901234567890',
      token: 'MATIC',
      amount: '0.1',
    }, params);
    check(sendRes, {
      'send successful': (r) => r.status === 200,
      'send time OK': (r) => r.timings.duration < 2000,
    });
    failureRate.add(sendRes.status !== 200);
  }

  // Group: KYC Operations
  {
    // Get KYC status
    const kycStatusRes = http.get(`${BASE_URL}/kyc/status`, params);
    check(kycStatusRes, {
      'kyc status successful': (r) => r.status === 200,
      'kyc status time OK': (r) => r.timings.duration < 1000,
    });
    failureRate.add(kycStatusRes.status !== 200);

    // Submit KYC documents
    const formData = {
      idFront: open('./fixtures/id_front.jpg', 'b'),
      idBack: open('./fixtures/id_back.jpg', 'b'),
      selfie: open('./fixtures/selfie.jpg', 'b'),
    };
    const kycSubmitRes = http.post(`${BASE_URL}/kyc/submit/1`, formData, params);
    check(kycSubmitRes, {
      'kyc submit successful': (r) => r.status === 200,
      'kyc submit time OK': (r) => r.timings.duration < 3000,
    });
    failureRate.add(kycSubmitRes.status !== 200);
  }

  // Group: DeFi Operations
  {
    // Get swap quote
    const quoteRes = http.get(
      `${BASE_URL}/defi/swap/quote?fromToken=MATIC&toToken=USDC&amount=1000000000000000000`,
      params
    );
    check(quoteRes, {
      'quote successful': (r) => r.status === 200,
      'quote time OK': (r) => r.timings.duration < 1000,
    });
    failureRate.add(quoteRes.status !== 200);

    // Execute swap
    const swapRes = http.post(`${BASE_URL}/defi/swap`, {
      fromToken: 'MATIC',
      toToken: 'USDC',
      amount: '1000000000000000000',
      slippage: 0.5,
    }, params);
    check(swapRes, {
      'swap successful': (r) => r.status === 200,
      'swap time OK': (r) => r.timings.duration < 2000,
    });
    failureRate.add(swapRes.status !== 200);

    // Get liquidity pools
    const poolsRes = http.get(`${BASE_URL}/defi/pools`, params);
    check(poolsRes, {
      'pools successful': (r) => r.status === 200,
      'pools time OK': (r) => r.timings.duration < 1000,
    });
    failureRate.add(poolsRes.status !== 200);

    // Add liquidity
    const addLiquidityRes = http.post(`${BASE_URL}/defi/liquidity/add`, {
      tokenA: 'MATIC',
      tokenB: 'USDC',
      amountA: '1000000000000000000',
      amountB: '1000000',
      slippage: 0.5,
    }, params);
    check(addLiquidityRes, {
      'add liquidity successful': (r) => r.status === 200,
      'add liquidity time OK': (r) => r.timings.duration < 2000,
    });
    failureRate.add(addLiquidityRes.status !== 200);
  }

  // Group: WhatsApp Integration
  {
    // Link WhatsApp
    const linkRes = http.post(`${BASE_URL}/whatsapp/link`, {
      phoneNumber: '+5511999999999',
    }, params);
    check(linkRes, {
      'link successful': (r) => r.status === 200,
      'link time OK': (r) => r.timings.duration < 1000,
    });
    failureRate.add(linkRes.status !== 200);

    // Verify WhatsApp
    const verifyRes = http.post(`${BASE_URL}/whatsapp/verify`, {
      code: '123456',
    }, params);
    check(verifyRes, {
      'verify successful': (r) => r.status === 200,
      'verify time OK': (r) => r.timings.duration < 1000,
    });
    failureRate.add(verifyRes.status !== 200);

    // Update notification preferences
    const preferencesRes = http.put(`${BASE_URL}/notifications/preferences`, {
      transactionsSent: true,
      transactionsReceived: true,
      swaps: true,
      liquidity: true,
      kyc: true,
      security: true,
    }, params);
    check(preferencesRes, {
      'preferences successful': (r) => r.status === 200,
      'preferences time OK': (r) => r.timings.duration < 1000,
    });
    failureRate.add(preferencesRes.status !== 200);
  }

  // Sleep between iterations
  sleep(1);
}
