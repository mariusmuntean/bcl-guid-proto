import { toBclGuidProto } from '../index';

test('1', () => {
  expect(toBclGuidProto('hi')).toBe('hi');
});
