const Block = require('./block');

describe('Block', () => {
  describe('calculateBlockTargetHash()', () => {
    it('calculates the maximum hash when the last block difficult is 1', () => {
      expect(
        Block.calculateBlockTargetHash({
          lastBlock: { blockHeaders: { difficulty: 1 } }
        })
      ).toEqual('f'.repeat(64));
    });
    // '000foo' > 'bason' ? 1 : 0
    it('calculates a low hash value when the last block difficulty is high', () => {
      expect(
        Block.calculateBlockTargetHash({
          lastBlock: { blockHeaders: { difficulty: 500 } }
        }) < '1'
      ).toBe(true);
    });
  });
});
