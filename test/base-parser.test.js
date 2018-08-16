const BaseParser = require('../lib/base-parser')

describe('BaseParser', () => {
  describe('#parseField()', () => {
    it('throws if out of range', () => {
      const buffer = Buffer.alloc(2)
      buffer.writeUInt16BE(1979, 0)

      const parser = new BaseParser(buffer)
      const parseFieldCall = () => parser.parseField({ type: 'uint32', length: 4 })

      expect(parseFieldCall).to.throw()
    })

    it('parses a uint32', () => {
      const num = 4294967295

      const buffer = Buffer.alloc(4)
      buffer.writeUInt32BE(num, 0)
      const result = (new BaseParser(buffer)).parseField({ type: 'uint32', length: 4 })

      expect(result).to.be.a('number')
      expect(result).to.equal(num)
    })

    it('parses a uint64', () => {
      const num = Math.min(9223372036854775807, Number.MAX_SAFE_INTEGER)

      const buffer = Buffer.alloc(8)
      buffer.writeUIntBE(num, 0, 8)
      const result = (new BaseParser(buffer)).parseField({ type: 'uint64', length: 8 })

      expect(result).to.be.a('number')
      expect(result).to.equal(num)
    })

    it('parses a string', () => {
      const value = 'Skalawag'

      const buffer = Buffer.from(value)
      const result = (new BaseParser(buffer)).parseField({ type: 'string', length: 8 })

      expect(result).to.be.a('string')
      expect(result).to.equal(value)
    })

    it('parses a float64', () => {
      const num = 604.274335557087

      const buffer = Buffer.alloc(8)
      buffer.writeDoubleBE(num, 0, 8)
      const result = (new BaseParser(buffer)).parseField({ type: 'float64', length: 8 })

      expect(result).to.be.a('number')
      expect(result).to.equal(num)
    })

    it('parses an enum', () => {
      const num = 0x2

      const buffer = Buffer.alloc(1)
      buffer.writeInt8(num, 0, 1)
      const result = (new BaseParser(buffer)).parseField({ type: 'enum', enum: ['First', 'Second', 'Third'] })

      expect(result).to.be.a('string')
      expect(result).to.equal('Third')
    })

    it('parses an int8 when type unset ', () => {
      const num = 0x2

      const buffer = Buffer.alloc(1)
      buffer.writeInt8(num, 0, 1)
      const result = (new BaseParser(buffer)).parseField({})

      expect(result).to.be.a('number')
      expect(result).to.equal(2)
    })
  })

  describe('#parseFields()', () => {
    it('parses a succession of fields from a single buffer', () => {
      const values = ['Skalawag', 4294967295, 604.274335557087]

      const buffer = Buffer.alloc(8 + 4 + 16)

      buffer.write(values[0], 0, 8)
      buffer.writeUInt32BE(values[1], 8, 8)
      buffer.writeDoubleBE(values[2], 12, 16)

      const result = (new BaseParser(buffer)).parseFields([
        { name: 'first', type: 'string', length: 8 },
        { name: 'second', type: 'uint32', length: 4 },
        { name: 'third', type: 'float64', length: 16 }
      ])

      expect(result).to.be.a('object')
      expect(result.first).to.be.a('string')
      expect(result.first).to.equal(values[0])
      expect(result.second).to.be.a('number')
      expect(result.second).to.equal(values[1])
      expect(result.third).to.be.a('number')
      expect(result.third).to.equal(values[2])
    })

    it('parses a conditional field when lookbehind conditional met', () => {
      const values = ['Skalawag', 4294967295]

      const buffer = Buffer.alloc(8 + 4)

      buffer.write(values[0], 0, 8)
      buffer.writeUInt32BE(values[1], 8, 8)

      const result = (new BaseParser(buffer)).parseFields([
        { name: 'first', type: 'string', length: 8 },
        {
          name: 'second',
          type: 'uint32',
          length: 4,
          lookBehindConditionals: [
            {
              property: 'first',
              regexMatch: '^Skala'
            }
          ]
        }
      ])

      expect(result).to.be.a('object')
      expect(result.first).to.be.a('string')
      expect(result.first).to.equal(values[0])
      expect(result.second).to.be.a('number')
      expect(result.second).to.equal(values[1])
    })

    it('does not parse a conditional field when lookbehind conditional not met', () => {
      const values = ['Skalawag', 4294967295]

      const buffer = Buffer.alloc(8 + 4)

      buffer.write(values[0], 0, 8)
      buffer.writeUInt32BE(values[1], 8, 8)

      const result = (new BaseParser(buffer)).parseFields([
        { name: 'first', type: 'string', length: 8 },
        {
          name: 'second',
          type: 'uint32',
          length: 4,
          // Make parsing this field conditional on `first` equaling "not-found"
          lookBehindConditionals: [
            {
              property: 'first',
              regexMatch: '^not-found$'
            }
          ]
        }
      ])

      expect(result).to.be.a('object')
      expect(result.first).to.be.a('string')
      expect(result.first).to.equal(values[0])
      // Because all lookBehindConditionals fail, `second` should not parse
      expect(result.second).to.be.a('undefined')
    })
  })
})
