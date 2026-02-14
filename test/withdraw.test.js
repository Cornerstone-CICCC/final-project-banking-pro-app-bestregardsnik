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

const { withdrawFunds, data } = require('../src/index');

function setAnswers(answers) {
  let i = 0;
  mockQuestion.mockImplementation((q, cb) => cb(answers[i++]));
}

beforeEach(() => {
  data.accounts = [{
    id: 'ACC-1000',
    holderName: 'Test User',
    balance: 1000,
    createdAt: new Date().toISOString(),
    transactions: [],
  }];
  jest.spyOn(console, 'clear').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('withdrawFunds', () => {
  test('[TP-013] withdraws valid amount correctly', async () => {
    setAnswers(['ACC-1000', '200', '']);
    await withdrawFunds();

    expect(data.accounts[0].balance).toBe(800);
    expect(data.accounts[0].transactions).toHaveLength(1);
    expect(data.accounts[0].transactions[0].type).toBe('WITHDRAWAL');
  });

  test('[TP-014] rejects withdrawal when insufficient funds', async () => {
    setAnswers(['ACC-1000', '6000', '']);
    await withdrawFunds();

    expect(data.accounts[0].balance).toBe(1000);
    expect(data.accounts[0].transactions).toHaveLength(0);
  });

  test('[TP-015] rejects negative withdrawal', async () => {
    setAnswers(['ACC-1000', '-500', '']);
    await withdrawFunds();

    expect(data.accounts[0].balance).toBe(1000);
    expect(data.accounts[0].transactions).toHaveLength(0);
  });

  test('shows error when account not found', async () => {
    setAnswers(['ACC-9999', '']);
    await withdrawFunds();

    expect(data.accounts[0].balance).toBe(1000);
  });
});
