var MongoClient = require('mongodb').MongoClient
var extend = require('util')._extend

module.exports = function (url) {
  var ready = false
  var delayed = []
  var connection

  // Optional protocol prefix
  if ( ! /^mongodb:\/\//.test(url)) {
    url = 'mongodb://' + url
  }

  // Connect to the database
  MongoClient.connect(url, function (err, db) {
    ready = true
    connection = db

    // Trigger
    delayed.splice(0).forEach(function (fn) {
      fn()
    })
  })

  /**
   * Return a model builder for the database connection
   *
   * @param {String} name Collection name
   * @param {Object} options Options to use in model construction
   *  @param {Object} options.prototype Custom prototype to attach
   */
  return function (name, options) {
    var collection
    options = options || {}

    // Allow prototype to get mixed in
    Model.prototype = options.prototype || {}

    /**
     * Model constructor
     *
     * @param {Object} data Data to construct new model instance with
     */
    function Model (doc) {
      if ( ! (this instanceof Model)) {
        return new Model(doc)
      }

      // Use array of document data to construct a model list
      if (doc instanceof Array) {
        return doc.map(Model)
      }

      // Mix initialization data into instance
      extend(this, doc)
    }

    // Helper to ensure readiness before continuing
    Model.waitUntilReady = Model.prototype.waitUntilReady = function* () {
      // Push yield callback into delayed task list
      // this will get run once connected
      if ( ! ready) {
        yield delayed.push.bind(delayed)
      }

      // Ensure the collection is defined
      if ( ! collection) {
        collection = connection.collection(name)
      }

      // Expose collection property, if not done already
      // NOTE: This runs for Model AND Model.prototype
      if ( ! this.collection) {
        Object.defineProperty(this, 'collection', {
          value: collection
        })
      }
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
