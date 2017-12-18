/* eslint-disable no-undef */
const processData = require('../processData');

describe('processData', () => {
  it('should convert data correctly', () => {
    data = {
      values: [[5, 5], [1, 1]],
    };
    columns = ['a', 'b'];
    const actualData = processData(data, columns);
    const expectedData = [{ a: 5, b: 5 }, { a: 1, b: 1 }];
    expect(actualData).toEqual(expectedData);
  });
});
