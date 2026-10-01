import { moveFieldDefinition } from './field-definition-order';

const names = (fields: Array<{ name: string }>) =>
  fields.map((field) => field.name);
const fields = ['a', 'b', 'c', 'd'].map((name) => ({ name }));

describe('moveFieldDefinition', () => {
  it('moves a field up by swapping it with its predecessor', () => {
    expect(names(moveFieldDefinition(fields, 'c', 'up'))).toEqual([
      'a',
      'c',
      'b',
      'd',
    ]);
  });

  it('moves a field down by swapping it with its successor', () => {
    expect(names(moveFieldDefinition(fields, 'b', 'down'))).toEqual([
      'a',
      'c',
      'b',
      'd',
    ]);
  });

  it('does nothing for the first field moving up or the last field moving down', () => {
    expect(names(moveFieldDefinition(fields, 'a', 'up'))).toEqual(
      names(fields)
    );
    expect(names(moveFieldDefinition(fields, 'd', 'down'))).toEqual(
      names(fields)
    );
  });

  it('does nothing for an unknown field', () => {
    expect(names(moveFieldDefinition(fields, 'nope', 'up'))).toEqual(
      names(fields)
    );
  });

  it('does not mutate the list it is given, and keeps the other fields untouched', () => {
    const original = [...fields];
    const moved = moveFieldDefinition(fields, 'b', 'up');
    expect(fields).toEqual(original);
    expect(moved).not.toBe(fields);
    expect(moved[1]).toBe(fields[0]);
  });

  it('works for a single field and for an empty list', () => {
    expect(moveFieldDefinition([{ name: 'a' }], 'a', 'down')).toEqual([
      { name: 'a' },
    ]);
    expect(moveFieldDefinition([], 'a', 'up')).toEqual([]);
  });
});
