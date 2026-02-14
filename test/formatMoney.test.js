jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn(),
    close: jest.fn(),
  })),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(() => false),
  writeFileSync: jest.fn(),
  writeFile: jest.fn(),
  readFileSync: jest.fn(() => '{"accounts":[]}'),
}));

const { formatMoney } = require('../src/index');

describe('formatMoney', () => {
  test('formats a positive number correctly', () => {
    expect(formatMoney(1200)).toBe('$1,200.00');
  });

  test('formats zero correctly', () => {
    expect(formatMoney(0)).toBe('$0.00');
  });

  test('formats a negative number', () => {
    expect(formatMoney(-500)).toBe('-$500.00');
  });

  test('shows NaN when given invalid input', () => {
    const result = formatMoney(NaN);
    expect(result).toContain('NaN');
  });
});
