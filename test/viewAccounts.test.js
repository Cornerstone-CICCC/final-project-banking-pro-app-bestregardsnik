const mockQuestion = jest.fn();
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: mockQuestion,
    close: jest.fn(),
  })),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(() => false),
  writeFileSync: jest.fn(),
  writeFile: jest.fn((p, d, cb) => { if (cb) cb(null); }),
  readFileSync: jest.fn(() => '{"accounts":[]}'),
}));

const {
  viewAccountDetails,
  listAllAccounts,
  viewTransactionHistory,
  data,
} = require('../src/index');

function setAnswers(answers) {
  let i = 0;
  mockQuestion.mockImplementation((q, cb) => cb(answers[i++]));
}

beforeEach(() => {
  data.accounts = [
    {
      id: 'ACC-1000',
      holderName: 'Test User',
      balance: 2500,
      createdAt: '2026-02-10T10:00:00.000Z',
      transactions: [
        {
          type: 'DEPOSIT',
          amount: 2500,
          timestamp: '2026-02-10T10:00:00.000Z',
          balanceAfter: 2500,
          description: 'Initial deposit',
        },
      ],
    },
  ];
  jest.spyOn(console, 'clear').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('viewAccountDetails', () => {
  test('[TP-005] displays details for an existing account', async () => {
    setAnswers(['ACC-1000', '']);
    await viewAccountDetails();

    // Check that account info was actually displayed
    const allOutput = console.log.mock.calls.map(c => String(c[0])).join('\n');
    expect(allOutput).toContain('ACC-1000');
    expect(allOutput).toContain('Test User');
  });

  test('[TP-006] shows error for non-existent account', async () => {
    setAnswers(['ACC-9999', '']);
    await viewAccountDetails();

    const allOutput = console.log.mock.calls.map(c => String(c[0])).join('\n');
    expect(allOutput).toContain('Account not found');
  });
});

describe('listAllAccounts', () => {
  test('[TP-007] displays table with all accounts', async () => {
    data.accounts.push({
      id: 'ACC-2000',
      holderName: 'Second User',
      balance: 500,
      createdAt: '2026-02-11T10:00:00.000Z',
      transactions: [],
    });

    setAnswers(['']);
    await listAllAccounts();

    const allOutput = console.log.mock.calls.map(c => String(c[0])).join('\n');
    // Check that account count is shown
    expect(allOutput).toContain('Total accounts: 2');
  });

  test('[TP-008] shows message when no accounts exist', async () => {
    data.accounts = [];
    setAnswers(['']);
    await listAllAccounts();

    const allOutput = console.log.mock.calls.map(c => String(c[0])).join('\n');
    expect(allOutput).toContain('No accounts found');
  });
});

describe('viewTransactionHistory', () => {
  test('[TP-020] displays transactions for an account', async () => {
    setAnswers(['ACC-1000', '']);
    await viewTransactionHistory();

    // The table output contains the transaction type
    const allOutput = console.log.mock.calls.map(c => String(c[0])).join('\n');
    expect(allOutput).toContain('DEPOSIT');
  });

  test('shows error for non-existent account', async () => {
    setAnswers(['ACC-9999', '']);
    await viewTransactionHistory();

    const allOutput = console.log.mock.calls.map(c => String(c[0])).join('\n');
    expect(allOutput).toContain('Account not found');
  });

  test('shows message when account has no transactions', async () => {
    data.accounts[0].transactions = [];
    setAnswers(['ACC-1000', '']);
    await viewTransactionHistory();

    const allOutput = console.log.mock.calls.map(c => String(c[0])).join('\n');
    expect(allOutput).toContain('No transactions found');
  });
});
