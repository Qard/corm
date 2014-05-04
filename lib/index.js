const extend = require('util')._extend
const monk = require('monk')

module.exports = function (url) {
  const connection = monk(url)

  return function (name, opts) {
    var collection = connection.get(name)
    opts = opts || {}

    Model.collectionName = name
    Model.prototype = opts.prototype || {}

    Object.defineProperty(Model, 'collection', {
      value: collection,
      configurable: false,
      enumerable: false,
      writable: false
    })

    function Model (doc) {
      if ( ! (this instanceof Model)) {
        return new Model(doc)
      }

      if (doc instanceof Array) {
        return doc.map(Model)
      }

      // Expose collection without it appearing in serialized objects
      Object.defineProperty(this, 'collection', {
        value: collection,
        configurable: false,
        enumerable: false,
        writable: false
      })

      extend(this, doc)
    }

    // Add methods and statics onto the constructor
    extend(Model.prototype, require('./query_methods'))
    extend(Model.prototype, require('./hook_methods'))
    extend(Model, require('./query_statics'))

    /**
     * Build a new model
     *
     * @param {Object} data Object of data to build record with
     */
    Model.build = function (data) {
      return new this(data)
    }

    /**
     * Validate the model
     *
     * Unlike how validation works in other model systems,
     * this adopts the "generator way" of throwing errors.
     * This means you can use basic language constructs
     * like try/catch blocks to make validation obvious.
     */
    Model.prototype.validate = function* () {}

    return Model
  }
}
