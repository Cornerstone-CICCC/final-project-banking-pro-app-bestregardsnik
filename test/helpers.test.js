const mockQuestion = jest.fn();
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: mockQuestion,
    close: jest.fn(),
  })),
}));

const mockFs = {
  existsSync: jest.fn(() => false),
  writeFileSync: jest.fn(),
  writeFile: jest.fn((p, d, cb) => { if (cb) cb(null); }),
  readFileSync: jest.fn(() => '{"accounts":[]}'),
};
jest.mock('fs', () => mockFs);

const {
  isValidAmount,
  generateAccountId,
  findAccountById,
  loadData,
  saveData,
  data,
} = require('../src/index');

beforeEach(() => {
  data.accounts = [];
  jest.spyOn(console, 'clear').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  mockFs.existsSync.mockReset();
  mockFs.writeFileSync.mockReset();
  mockFs.writeFile.mockReset();
  mockFs.readFileSync.mockReset();
  mockFs.writeFile.mockImplementation((p, d, cb) => { if (cb) cb(null); });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('findAccountById', () => {
  test('finds an existing account by ID', () => {
    data.accounts = [{ id: 'ACC-1234', holderName: 'Nik' }];
    const result = findAccountById('ACC-1234');
    expect(result).toBeDefined();
    expect(result.holderName).toBe('Nik');
  });

  test('returns undefined for non-existent ID', () => {
    data.accounts = [{ id: 'ACC-1234', holderName: 'Nik' }];
    const result = findAccountById('ACC-9999');
    expect(result).toBeUndefined();
  });
});

describe('generateAccountId', () => {
  test('generates an ID in the format ACC-XXXX', () => {
    const id = generateAccountId();
    expect(id).toMatch(/^ACC-\d{4}$/);
  });

  test('generates unique IDs (no duplicates with existing accounts)', () => {
    // Fill data with many accounts to force the duplicate check
    data.accounts = [];
    const id1 = generateAccountId();
    data.accounts.push({ id: id1 });
    const id2 = generateAccountId();
    expect(id1).not.toBe(id2);
  });
});

describe('loadData', () => {
  test('creates data file when it does not exist', () => {
    mockFs.existsSync.mockReturnValue(false);
    loadData();
    expect(mockFs.writeFileSync).toHaveBeenCalled();
  });

  test('reads data from existing file and populates accounts', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('{"accounts":[{"id":"ACC-1000","holderName":"Nik","balance":500}]}');
    loadData();
    // Verify data was loaded by finding the account through the app's own function
    const loaded = findAccountById('ACC-1000');
    expect(loaded).toBeDefined();
    expect(loaded.holderName).toBe('Nik');
    expect(loaded.balance).toBe(500);
  });

  test('handles corrupted JSON file gracefully', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('not valid json{{{');
    expect(() => loadData()).not.toThrow();
    // Should reset to empty — no accounts findable
    expect(findAccountById('ACC-1000')).toBeUndefined();
  });

  test('handles file with missing accounts array', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('{"something":"else"}');
    loadData();
    // Should reset to empty — no accounts findable
    expect(findAccountById('anything')).toBeUndefined();
  });
});

describe('isValidAmount', () => {
  test('accepts a valid positive number', () => {
    expect(isValidAmount('500')).toBe(true);
  });

  test('accepts a decimal number', () => {
    expect(isValidAmount('49.99')).toBe(true);
  });

  test('rejects empty input', () => {
    expect(isValidAmount('')).toBe(false);
  });

  test('rejects null/undefined', () => {
    expect(isValidAmount(null)).toBe(false);
    expect(isValidAmount(undefined)).toBe(false);
  });

  test('rejects negative numbers', () => {
    expect(isValidAmount('-500')).toBe(false);
  });

  test('rejects zero', () => {
    expect(isValidAmount('0')).toBe(false);
  });

  test('rejects non-numeric strings', () => {
    expect(isValidAmount('abc')).toBe(false);
    expect(isValidAmount('hello')).toBe(false);
  });

  test('rejects math expressions', () => {
    expect(isValidAmount('5000-125')).toBe(false);
    expect(isValidAmount('5000-125+(5*3)')).toBe(false);
  });
});

describe('saveData', () => {
  test('saves current accounts data to file', () => {
    // Load known data first so the module's internal data has our account
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('{"accounts":[{"id":"ACC-1000","holderName":"Nik","balance":500}]}');
    loadData();
    mockFs.writeFile.mockImplementation((p, d, cb) => { if (cb) cb(null); });
    saveData();
    // Check that writeFile received the correct JSON data
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData.accounts).toHaveLength(1);
    expect(writtenData.accounts[0].holderName).toBe('Nik');
  });

  test('handles write error gracefully', () => {
    mockFs.writeFile.mockImplementation((p, d, cb) => {
      if (cb) cb(new Error('disk full'));
    });
    // Should not crash
    expect(() => saveData()).not.toThrow();
  });
});
