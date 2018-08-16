const fs = require('fs')

const TransactionLogParser = require('../lib/transaction-log-parser')

describe('TransactionLogParser', () => {
  describe('#parse()', () => {
    it('parses known values for first record', (done) => {
      fs.readFile('./data/txnlog.dat', (err, data) => {
        expect(err).to.be.a('null')

        const parsed = new TransactionLogParser(data).parse()

        // From requirements:
        // > The first record in the file, when fully parsed, will look something like this:
        // >   | Record type | Unix timestamp | user ID             | amount in dollars |
        // >   | 'Debit'     | 1393108945     | 4136353673894269217 | 604.274335557087  |

        expect(parsed).to.be.a('object')
        expect(parsed.records).to.be.a('array')
        expect(parsed.records[0].recordType).to.equal('Debit')
        expect(parsed.records[0].timestamp).to.equal(1393108945)
        expect(parsed.records[0].userId).to.equal(4136353673894269217)
        expect(parsed.records[0].amount).to.equal(604.274335557087)

        done()
      })
    })
  })
})
