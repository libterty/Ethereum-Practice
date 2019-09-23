const Block = require('./block');
const { keccakHash } = require('../util')

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

        describe('mineBlock()', () => {
            let lastBlock, mineBlock;

            beforeEach(() => {
                lastBlock = Block.genesis();
                mineBlock = Block.mineBlock({ lastBlock, beneficiary: 'beneficiary' });
            });

            it('mines a block', () => {
                expect(mineBlock).toBeInstanceOf(Block);
            });

            it('mines a block that meets the proof of work requirement', () => {
                const target = Block.calculateBlockTargetHash({ lastBlock })
                const { blockHeaders } = mineBlock
                const { nonce } = blockHeaders
                const truncatedBlockHeaders = {...blockHeaders }
                delete truncatedBlockHeaders.nonce
                const header = keccakHash(truncatedBlockHeaders)
                const underTargetHash = keccakHash(header + nonce)

                expect(underTargetHash < target).toBe(true)
            })
        });

        describe('adjustDifficulty', () => {
            it('keeps the difficulty above 0', () => {
                expect(Block.adjustDifficulty({ lastBlock: { blockHeaders: { difficulty: 0 } }, timestamp: Date.now() })).toEqual(1)
            })

            it('increases the difficulty for a quickly mine block', () => {
                expect(Block.adjustDifficulty({ lastBlock: { blockHeaders: { difficulty: 5, timestamp: 1000 } }, timestamp: 3000 })).toEqual(6)
            })

            it('decreases the difficulty for a quickly mine block', () => {
                expect(Block.adjustDifficulty({ lastBlock: { blockHeaders: { difficulty: 5, timestamp: 1000 } }, timestamp: 20000 })).toEqual(4)
            })
        })
    });
});