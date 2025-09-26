import { test as base } from '@playwright/test';
import { faker } from '@faker-js/faker';

export type TestFixtures = {
  mockUser: {
    email: string;
    password: string;
    name: string;
    whatsappNumber: string;
  };
  mockWallet: {
    address: string;
    network: string;
    balance: {
      [key: string]: string;
    };
  };
  mockTransaction: {
    id: string;
    type: string;
    token: string;
    amount: string;
    status: string;
    timestamp: number;
  };
};

export const test = base.extend<TestFixtures>({
  mockUser: async ({}, use) => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.person.fullName(),
      whatsappNumber: '+5511999999999',
    };
    await use(user);
  },

  mockWallet: async ({}, use) => {
    const wallet = {
      address: '0x' + faker.string.hexadecimal({ length: 40 }).slice(2),
      network: 'polygon',
      balance: {
        MATIC: '1000000000000000000', // 1 MATIC
        USDC: '1000000', // 1 USDC
      },
    };
    await use(wallet);
  },

  mockTransaction: async ({}, use) => {
    const transaction = {
      id: '0x' + faker.string.hexadecimal({ length: 64 }).slice(2),
      type: 'SEND',
      token: 'MATIC',
      amount: '0.1',
      status: 'COMPLETED',
      timestamp: Date.now(),
    };
    await use(transaction);
  },
});

export { expect } from '@playwright/test';
