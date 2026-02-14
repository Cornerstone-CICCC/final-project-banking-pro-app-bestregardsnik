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

const { deleteAccount, data } = require('../src/index');

function setAnswers(answers) {
  let i = 0;
  mockQuestion.mockImplementation((q, cb) => cb(answers[i++]));
}

beforeEach(() => {
  data.accounts = [{
    id: 'ACC-1000',
    holderName: 'Test User',
    balance: 5000,
    createdAt: new Date().toISOString(),
    transactions: [],
  }];
  jest.spyOn(console, 'clear').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('deleteAccount', () => {
  test('[TP-021] deletes an account with zero balance', async () => {
    data.accounts[0].balance = 0;
    setAnswers(['ACC-1000', '']);
    await deleteAccount();

    expect(data.accounts).toHaveLength(0);
  });

  test('[TP-022] shows error for non-existent account', async () => {
    setAnswers(['ACC-9999', '']);
    await deleteAccount();

    expect(data.accounts).toHaveLength(1);
  });

  test('[TP-023] rejects deletion of account with remaining balance', async () => {
    expect(data.accounts[0].balance).toBe(5000);

    setAnswers(['ACC-1000', '']);
    await deleteAccount();

    expect(data.accounts).toHaveLength(1);
    expect(data.accounts[0].balance).toBe(5000);
  });
});
