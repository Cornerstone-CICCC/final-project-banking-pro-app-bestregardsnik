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

const { transferFunds, data } = require('../src/index');

function setAnswers(answers) {
  let i = 0;
  mockQuestion.mockImplementation((q, cb) => cb(answers[i++]));
}

beforeEach(() => {
  data.accounts = [
    {
      id: 'ACC-1000',
      holderName: 'Alice',
      balance: 5000,
      createdAt: new Date().toISOString(),
      transactions: [],
    },
    {
      id: 'ACC-2000',
      holderName: 'Bob',
      balance: 1000,
      createdAt: new Date().toISOString(),
      transactions: [],
    },
  ];
  jest.spyOn(console, 'clear').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('transferFunds', () => {
  test('[TP-016] transfers between valid accounts', async () => {
    setAnswers(['ACC-1000', 'ACC-2000', '300', '']);
    await transferFunds();

    expect(data.accounts[0].balance).toBe(4700);
    expect(data.accounts[1].balance).toBe(1300);
  });

  test('[TP-017] rejects transfer to non-existent recipient', async () => {
    setAnswers(['ACC-1000', 'ACC-9999', '200', '']);
    const accountsBefore = data.accounts.length;
    await transferFunds();

    expect(data.accounts.length).toBe(accountsBefore);
    expect(data.accounts[0].balance).toBe(5000);
  });

  test('[TP-018] rejects transfer when insufficient funds', async () => {
    setAnswers(['ACC-1000', 'ACC-2000', '50000', '']);
    await transferFunds();

    expect(data.accounts[0].balance).toBe(5000);
    expect(data.accounts[1].balance).toBe(1000);
  });

  test('[TP-019] rejects self-transfer', async () => {
    setAnswers(['ACC-1000', 'ACC-1000', '100', '']);
    await transferFunds();

    expect(data.accounts[0].balance).toBe(5000);
    expect(data.accounts[0].transactions).toHaveLength(0);
  });

  test('shows error when source account not found', async () => {
    setAnswers(['ACC-9999', 'ACC-2000', '100', '']);
    await transferFunds();

    expect(data.accounts[0].balance).toBe(5000);
    expect(data.accounts[1].balance).toBe(1000);
  });

  test('records transactions for both accounts', async () => {
    setAnswers(['ACC-1000', 'ACC-2000', '501', '']);
    await transferFunds();

    expect(data.accounts[0].transactions).toHaveLength(1);
    expect(data.accounts[0].transactions[0].type).toBe('TRANSFER_OUT');
    expect(data.accounts[1].transactions).toHaveLength(1);
    expect(data.accounts[1].transactions[0].type).toBe('TRANSFER_IN');
  });

  test('rejects non-numeric transfer amount', async () => {
    setAnswers(['ACC-1000', 'ACC-2000', 'abc', '']);
    await transferFunds();

    expect(data.accounts[0].balance).toBe(5000);
    expect(data.accounts[1].balance).toBe(1000);
  });
});
