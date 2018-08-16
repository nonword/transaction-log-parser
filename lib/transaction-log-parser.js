const BaseParser = require('./base-parser')

const schema = require('../schemas/transaction-log.json')

class TransactionLogParser extends BaseParser {
  /**
  * Parses buffer using specification in ../schemas/transaction-log.json,
  * returns Object result.
  *
  * @returns {Object} An object with a `header` and `records` properties.
  */
  parse () {
    const result = {}

    result.header = this.parseFields(schema.header)

    result.records = []
    while (this.offset < this.buffer.length) {
      result.records.push(this.parseFields(schema.record))
    }

    return result
  }
}

module.exports = TransactionLogParser
