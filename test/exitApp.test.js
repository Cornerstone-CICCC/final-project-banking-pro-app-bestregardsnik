const mockClose = jest.fn();
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn(),
    close: mockClose,
  })),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(() => false),
  writeFileSync: jest.fn(),
  writeFile: jest.fn((p, d, cb) => { if (cb) cb(null); }),
  readFileSync: jest.fn(() => '{"accounts":[]}'),
}));

const { exitApp } = require('../src/index');

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(process, 'exit').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('exitApp', () => {
  test('saves data and exits the app', async () => {
    await exitApp();

    expect(mockClose).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
