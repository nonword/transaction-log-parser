const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))

const TransactionLogParser = require('./lib/transaction-log-parser')

const infile = argv.infile || './data/txnlog.dat'

console.log(`Reading from ${infile}`)

fs.readFile(infile, (err, data) => {
  if (err) {
    console.error('Error: ', err)
    process.exit()
  }

  const result = (new TransactionLogParser(data)).parse()

  if (argv.outfile) {
    console.log(`Writing to ${argv.outfile}`)
    fs.writeFileSync(argv.outfile, JSON.stringify(result, null, 2))
  }

  console.log([
    `Finished parsing ${result.records.length} record(s)`,
    `from "${result.header.magicString}" v${result.header.version}`
  ].join(' ') + '\n')

  // Generate report:
  const report = {}

  report['What is the total amount in dollars of debits?'] = result.records
    .filter((record) => record.recordType === 'Debit')
    .reduce((sum, record) => sum + record.amount, 0)

  report['What is the total amount in dollars of credits?'] = result.records
    .filter((record) => record.recordType === 'Credit')
    .reduce((sum, record) => sum + record.amount, 0)

  report['How many autopays were started?'] = result.records
    .filter((record) => record.recordType === 'StartAutopay')
    .length

  report['How many autopays were ended?'] = result.records
    .filter((record) => record.recordType === 'EndAutopay')
    .length

  report['What is balance of user ID 2456938384156277127?'] = result.records
    .filter((record) => record.userId === 2456938384156277127)
    .reduce((sum, record) => sum + (record.type === 'Debit' ? -1 : 1) * record.amount, 0)

  const reportForDisplay = Object.keys(report)
    .map((label) => `${label}\n${report[label]}`)
    .join('\n\n')

  console.log('Report:\n')
  console.log(reportForDisplay)
})
