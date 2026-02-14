// Mock readline — controls what the "user" types when the app asks questions
const mockQuestion = jest.fn();
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: mockQuestion,
    close: jest.fn(),
  })),
}));

// Mock fs — prevents reading/writing files during tests
jest.mock('fs', () => ({
  existsSync: jest.fn(() => false),
  writeFileSync: jest.fn(),
  writeFile: jest.fn((p, d, cb) => { if (cb) cb(null); }),
  readFileSync: jest.fn(() => '{"accounts":[]}'),
}));

const { createAccount, data } = require('../src/index');

// Helper: simulate user typing answers to each question
function setAnswers(answers) {
  let i = 0;
  mockQuestion.mockImplementation((q, cb) => cb(answers[i++]));
}

// Reset data before each test so tests don't affect each other
beforeEach(() => {
  data.accounts = [];
  jest.spyOn(console, 'clear').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('createAccount', () => {
  test('[TP-001] creates account with valid name and deposit', async () => {
    setAnswers(['Nik', '1200', '']);
    await createAccount();

    expect(data.accounts).toHaveLength(1);
    expect(data.accounts[0].holderName).toBe('Nik');
    expect(data.accounts[0].balance).toBe(1200);
    expect(data.accounts[0].id).toBeDefined();
    expect(data.accounts[0].transactions).toHaveLength(1);
    expect(data.accounts[0].transactions[0].type).toBe('DEPOSIT');
  });

  test('[TP-002] rejects empty name', async () => {
    setAnswers(['', '']);
    await createAccount();

    expect(data.accounts).toHaveLength(0);
  });

  test('[TP-003] rejects negative deposit', async () => {
    setAnswers(['Test', '-500', '']);
    await createAccount();

    expect(data.accounts).toHaveLength(0);
  });

  test('[TP-004] rejects non-numeric input', async () => {
    setAnswers(['Test', 'abc', '']);
    await createAccount();

    expect(data.accounts).toHaveLength(0);
  });

  test('rejects math expression as input', async () => {
    setAnswers(['Test', '5000-125', '']);
    await createAccount();

    expect(data.accounts).toHaveLength(0);
  });
});