// Mock das variáveis de ambiente
process.env.NODE_ENV = 'test';
process.env.MASTER_KEY = 'test_master_key';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NOTUS_API_KEY = 'test_notus_key';

// Mock do Redis
jest.mock('@common/infrastructure/cache/RedisCache', () => {
  const mockRedis = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    hget: jest.fn(),
    hset: jest.fn(),
    hincrby: jest.fn(),
    hgetall: jest.fn(),
    keys: jest.fn(),
    multi: jest.fn().mockReturnThis(),
    exec: jest.fn()
  };

  return {
    RedisCache: {
      getInstance: jest.fn().mockReturnValue(mockRedis),
      generateKey: jest.fn().mockImplementation((...parts) => parts.join(':')),
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      getOrSet: jest.fn()
    }
  };
});

// Mock do TypeORM
jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    DataSource: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(true),
      getRepository: jest.fn()
    }))
  };
});

// Mock do Ethers
jest.mock('ethers', () => {
  return {
    ethers: {
      Wallet: {
        createRandom: jest.fn().mockReturnValue({
          address: '0x1234567890123456789012345678901234567890',
          privateKey: '0x1234567890123456789012345678901234567890123456789012345678901234'
        })
      },
      providers: {
        JsonRpcProvider: jest.fn().mockImplementation(() => ({
          getBlockNumber: jest.fn().mockResolvedValue(1000000),
          getGasPrice: jest.fn().mockResolvedValue('50000000000'),
          getBalance: jest.fn().mockResolvedValue('1000000000000000000'),
          getTransactionReceipt: jest.fn()
        }))
      },
      Contract: jest.fn(),
      utils: {
        parseUnits: jest.fn().mockImplementation((value, decimals) => value),
        formatUnits: jest.fn().mockImplementation((value, decimals) => value.toString()),
        isHexString: jest.fn().mockImplementation(value => value.startsWith('0x')),
        id: jest.fn().mockImplementation(value => `0x${value}`)
      }
    }
  };
});

// Mock do Express
jest.mock('express', () => {
  const mockExpress = jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    listen: jest.fn()
  }));

  mockExpress.Router = jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }));

  mockExpress.json = jest.fn();
  mockExpress.urlencoded = jest.fn();

  return mockExpress;
});

// Configuração global do Jest
jest.setTimeout(10000); // 10 segundos

// Limpar todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
