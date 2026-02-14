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

const { depositFunds, data } = require('../src/index');

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

describe('depositFunds', () => {
  test('[TP-009] deposits valid amount correctly', async () => {
    setAnswers(['ACC-1000', '500', '']);
    await depositFunds();

    expect(data.accounts[0].balance).toBe(1500);
    expect(data.accounts[0].transactions).toHaveLength(1);
    expect(data.accounts[0].transactions[0].type).toBe('DEPOSIT');
  });

  test('[TP-010] rejects negative deposit', async () => {
    setAnswers(['ACC-1000', '-100', '']);
    await depositFunds();

    expect(data.accounts[0].balance).toBe(1000);
    expect(data.accounts[0].transactions).toHaveLength(0);
  });

  test('[TP-011] rejects non-numeric input', async () => {
    setAnswers(['ACC-1000', 'hello', '']);
    await depositFunds();

    expect(data.accounts[0].balance).toBe(1000);
    expect(data.accounts[0].transactions).toHaveLength(0);
  });

  test('[TP-012] rejects math expression as input', async () => {
    setAnswers(['ACC-1000', '5000-125+(5*3)', '']);
    await depositFunds();

    expect(data.accounts[0].balance).toBe(1000);
    expect(data.accounts[0].transactions).toHaveLength(0);
  });

  test('[TP-027] rejects zero deposit', async () => {
    setAnswers(['ACC-1000', '0', '']);
    await depositFunds();

    expect(data.accounts[0].balance).toBe(1000);
    expect(data.accounts[0].transactions).toHaveLength(0);
  });

  test('shows error when account not found', async () => {
    setAnswers(['ACC-9999', '']);
    await depositFunds();

    expect(data.accounts[0].balance).toBe(1000);
  });
});
