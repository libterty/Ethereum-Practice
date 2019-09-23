const Interpreter = require('./index');

const {
  STOP,
  ADD,
  SUB,
  MUL,
  DIV,
  PUSH,
  LT,
  GT,
  EQ,
  AND,
  OR,
  JUMP,
  JUMPI
} = Interpreter.OPCODE_MAP;

describe('Interpreter', () => {
  describe('runCode()', () => {
    describe('and the code includes ADD', () => {
      it('add two values', () => {
        expect(
          new Interpreter().runCode([PUSH, 2, PUSH, 3, ADD, STOP])
        ).toEqual(5);
      });
    });

    describe('and the code includes SUB', () => {
      it('add two values', () => {
        expect(
          new Interpreter().runCode([PUSH, 2, PUSH, 3, SUB, STOP])
        ).toEqual(1);
      });
    });

    describe('and the code includes MUL', () => {
      it('add two values', () => {
        expect(
          new Interpreter().runCode([PUSH, 2, PUSH, 3, MUL, STOP])
        ).toEqual(6);
      });
    });

    describe('and the code includes DIV', () => {
      it('add two values', () => {
        expect(
          new Interpreter().runCode([PUSH, 2, PUSH, 3, DIV, STOP])
        ).toEqual(1.5);
      });
    });

    describe('and the code includes LT', () => {
      it('add two values', () => {
        expect(new Interpreter().runCode([PUSH, 2, PUSH, 3, LT, STOP])).toEqual(
          0
        );
      });
    });

    describe('and the code includes GT', () => {
      it('add two values', () => {
        expect(new Interpreter().runCode([PUSH, 2, PUSH, 3, GT, STOP])).toEqual(
          1
        );
      });
    });

    describe('and the code includes EQ', () => {
      it('add two values', () => {
        expect(new Interpreter().runCode([PUSH, 2, PUSH, 2, EQ, STOP])).toEqual(
          1
        );
      });
    });

    describe('and the code includes AND', () => {
      it('ands two conditions', () => {
        expect(
          new Interpreter().runCode([PUSH, 1, PUSH, 0, AND, STOP])
        ).toEqual(0);
      });
    });

    describe('and the code includes OR', () => {
      it('or two conditions', () => {
        expect(new Interpreter().runCode([PUSH, 1, PUSH, 0, OR, STOP])).toEqual(
          1
        );
      });
    });

    describe('and the code includes JUMP', () => {
      it('jumps to destination', () => {
        expect(
          new Interpreter().runCode([
            PUSH,
            6,
            JUMP,
            PUSH,
            0,
            JUMP,
            PUSH,
            'JUMP successful',
            STOP
          ])
        ).toEqual('JUMP successful');
      });
    });

    describe('and the code includes JUMPI', () => {
      it('jumps to destination', () => {
        expect(
          new Interpreter().runCode([
            PUSH,
            8,
            PUSH,
            1,
            JUMPI,
            PUSH,
            0,
            JUMP,
            PUSH,
            'JUMP successful',
            STOP
          ])
        ).toEqual('JUMP successful');
      });
    });

    describe('and the code includes an invalid JUMP destination', () => {
      it('throw an error', () => {
        expect(() =>
          new Interpreter().runCode([
            PUSH,
            99,
            JUMP,
            PUSH,
            0,
            JUMP,
            PUSH,
            'JUMP successful',
            STOP
          ])
        ).toThrow('Invalid destination: 99');
      });
    });

    describe('and the code includes an invalid PUSH value', () => {
      it('throw an error', () => {
        expect(() => new Interpreter().runCode([PUSH, 0, PUSH])).toThrow(
          "The 'PUSH' instruction cannot be last"
        );
      });
    });

    describe('and the code includes an infinite loop', () => {
      it('throw an error', () => {
        expect(() => new Interpreter().runCode([PUSH, 0, JUMP, STOP])).toThrow(
          'Check for an infinite loop. Execution limit of 10000'
        );
      });
    });
  });
});
