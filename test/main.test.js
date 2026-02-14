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

const { main } = require('../src/index');

beforeEach(() => {
  jest.spyOn(console, 'clear').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('EXIT');
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('main', () => {
  test('handles invalid menu option and then exits', async () => {
    let i = 0;
    const answers = ['99', '', '9'];
    mockQuestion.mockImplementation((q, cb) => cb(answers[i++]));

    await expect(main()).rejects.toThrow('EXIT');
  });

  test('handles option 3 (list accounts) and then exits', async () => {
    let i = 0;
    const answers = ['3', '', '9'];
    mockQuestion.mockImplementation((q, cb) => cb(answers[i++]));

    await expect(main()).rejects.toThrow('EXIT');
  });

  test('handles option 2 (view account) and then exits', async () => {
    let i = 0;
    const answers = ['2', 'ACC-9999', '', '9'];
    mockQuestion.mockImplementation((q, cb) => cb(answers[i++]));

    await expect(main()).rejects.toThrow('EXIT');
  });

  test('handles option 7 (transaction history) and then exits', async () => {
    let i = 0;
    const answers = ['7', 'ACC-9999', '', '9'];
    mockQuestion.mockImplementation((q, cb) => cb(answers[i++]));

    await expect(main()).rejects.toThrow('EXIT');
  });

  test('handles option 1 (create account) and then exits', async () => {
    let i = 0;
    const answers = ['1', 'Nik', '1000', '', '9'];
    mockQuestion.mockImplementation((q, cb) => cb(answers[i++]));

    await expect(main()).rejects.toThrow('EXIT');
  });

  test('handles option 4 (deposit) and then exits', async () => {
    let i = 0;
    const answers = ['4', 'ACC-9999', '', '9'];
    mockQuestion.mockImplementation((q, cb) => cb(answers[i++]));

    await expect(main()).rejects.toThrow('EXIT');
  });

  test('handles option 5 (withdraw) and then exits', async () => {
    let i = 0;
    const answers = ['5', 'ACC-9999', '', '9'];
    mockQuestion.mockImplementation((q, cb) => cb(answers[i++]));

    await expect(main()).rejects.toThrow('EXIT');
  });

  test('handles option 6 (transfer) and then exits', async () => {
    let i = 0;
    const answers = ['6', 'ACC-9999', 'ACC-9998', '100', '', '9'];
    mockQuestion.mockImplementation((q, cb) => cb(answers[i++]));

    await expect(main()).rejects.toThrow('EXIT');
  });

  test('handles option 8 (delete) and then exits', async () => {
    let i = 0;
    const answers = ['8', 'ACC-9999', '', '9'];
    mockQuestion.mockImplementation((q, cb) => cb(answers[i++]));

    await expect(main()).rejects.toThrow('EXIT');
  });
});
