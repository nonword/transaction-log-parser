# Transaction Log Parser

This is a simple app demonstrating 1) parsing a binary log representing bank transactions into JSON and 2) running sample queries against the transformed result.

## Requirements

 * [Node](https://nodejs.org/en/download/) (This app has been tested against v6.11 & v8.10.)

## Setup

The following will install necessary dependencies:

```
npm install
```

## Usage

The following will parse `./data/txnlog.dat` and print a report.

```
npm run parse
```

### Advanced Usage

If you'd like to specify a custom binary log file or write the output to disk, `parse.js` has the following options:

```
node ./parse [--infile INFILE] [--outfile OUTFILE]
```

 * `INFILE`: Local path to binary file to parse. Default `./data/txnlog.dat`
 * `OUTFILE`: Local path to write parsed document. Default `/dev/null`

## Testing

[Standard JS](https://standardjs.com/) linting and a modest test suite can be run as follows:

```
npm test
```
