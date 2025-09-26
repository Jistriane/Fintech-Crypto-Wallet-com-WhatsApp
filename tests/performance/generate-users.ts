import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

interface TestUser {
  email: string;
  password: string;
  name: string;
  whatsappNumber: string;
}

// Generate 1000 test users
const users: TestUser[] = Array.from({ length: 1000 }, () => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
  name: faker.person.fullName(),
  whatsappNumber: '+55' + faker.string.numeric(11),
}));

// Save users to file
fs.writeFileSync(
  path.join(__dirname, 'users.json'),
  JSON.stringify(users, null, 2)
);
