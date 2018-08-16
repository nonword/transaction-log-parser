class BaseParser {
  constructor (buffer) {
    this.offset = 0
    this.buffer = buffer
  }

  /**
  * @typedef Field
  * @property {String} name - Name of field (i.e. key in resulting JSON)
  * @property {string} type - Type of field. Must be one of:
  *   - string
  *   - float64
  *   - uint32
  *   - uint64
  *   - enum
  * @property {array<String>} enum - Relevant only when `type` is "enum".
  *   Associates values with field value by index.
  * @property {integer} length - Length of field
  * @property {array<FieldConditional>} - Array of conditionals to check, all
  *   of which must pass to proceed with parsing the field.
  */

  /**
  * @typedef FieldConditional
  * @property {string} property - Identifies the previously parsed property to
  *   inspect
  * @property {string} regexMatch - A regex that matches the named `property`
  *   if and only if the present field should be included.
  */

  /**
  * Parse array of fields.
  *
  * @param {array<Field>} fields - Array of fields to parse.
  */
  parseFields (fields) {
    return fields.reduce((record, field) => {
      if (this.fieldConditionalsMet(field.lookBehindConditionals, record)) {
        record[field.name] = this.parseField(field)
        this.offset += field.length
      }
      return record
    }, {})
  }

  /**
  * Parse a single field.
  *
  * @param {Field} field - Field to parse at current position in buffer.
  */
  parseField (field) {
    switch (field.type) {
      case 'uint32':
      case 'uint64':
        return this.buffer.readUIntBE(this.offset, field.length)
      case 'string':
        return this.buffer.slice(this.offset, field.length).toString()
      case 'float64':
        return this.buffer.readDoubleBE(this.offset)
      case 'enum':
        return field.enum[this.buffer.readInt8(this.offset)]
      default:
        return this.buffer.readInt8(this.offset)
    }
  }

  /**
  * Returns true if the given "look-behind" conditionals match given record.
  *
  * @param {array<FieldConditional>} conditionals - Array of conditionals to
  *   match, if any.
  * @param {Object} record - The current parsed object to inspect.
  */
  fieldConditionalsMet (conditionals = [], record) {
    return conditionals
      .reduce((otherConditionsMet, conditional) => {
        const propertyValue = record[conditional.property]
        return otherConditionsMet && (new RegExp(conditional.regexMatch)).test(propertyValue)
      }, true)
  }
}

module.exports = BaseParser
