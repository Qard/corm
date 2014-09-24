var ObjectID = require('mongodb').ObjectID
var extend = require('util')._extend

/**
 * Find a set of records in mongo and return a collection of models
 *
 * @param {Object} query Object to query the database with
 * @param {Object} options Options to pass to monk
 */
exports.find = function* (query, options) {
  var collection = yield* this.getCollection()
  var docs = yield function (done) {
    collection.find(query, options || {}).toArray(done)
  }

  return new this(docs || [])
}

/**
 * Find one record and return the model
 *
 * @param {Object} query Object to query the database with
 * @param {Object} options Options to pass to monk
 */
exports.findOne = function* (query, options) {
  var collection = yield* this.getCollection()
  var doc = yield function (done) {
    collection.findOne(query, options || {}, done)
  }

  return doc && new this(doc)
}

/**
 * Find one record by id and return the model
 *
 * @param {String} id ID of the record
 * @param {Object} options Options to pass to monk
 */
exports.findById = function* (id, options) {
  var collection = yield* this.getCollection()
  var doc = yield function (done) {
    collection.findOne({
      _id: new ObjectID(id.toString())
    }, options || {}, done)
  }

  return doc && new this(doc)
}

/**
 * Find or create a record and return the model
 *
 * @param {Object} query Object to query the database with
 */
exports.findOrCreate = function* (query) {
  var doc = yield* this.findOne(query)
  if ( ! doc) {
    doc = yield* this.create(query)
  }

  return doc
}

/**
 * Create or update a record and return the model
 *
 * @param {Object} query Object to query the database with
 * @param {Object} data Data to add to the record
 */
exports.createOrUpdate = function* (query, data) {
  data = data || {}

  // First, attempt to find the record
  var doc = yield* this.findOne(query)
  if (doc) {
    yield* doc.update(data)

  // If that fails, create a new record
  } else {
    extend(query, data)
    doc = yield* this.create(query)
  }

  return doc
}

/**
 * Build and save a new model
 *
 * @param {Object} data Object of data to create record with
 */
exports.create = function* (data) {
  var user = new this(data)
  yield* user.save()
  return user
}

/**
 * Update all records matching the given query
 *
 * @param {Object} query Object to query the database with
 * @param {Object} data Object of complete data to overwrite record with
 */
exports.update = function* (query, data) {
  var users = yield* this.find(query)
  return yield users.map(function (user) {
    return user.update(data)
  })
}

/**
 * Update the record matching the given id
 *
 * @param {String} id ID of the record
 * @param {Object} data Object of complete data to overwrite record with
 */
exports.updateById = function* (id, data) {
  var user = yield* this.findById(id)
  return yield* user.update(data)
}

/**
 * Remove all records matching the given query
 *
 * @param {Object} query Object to query the database with
 */
exports.remove = function* (query) {
  var users = yield* this.find(query)
  return yield users.map(function (user) {
    return user.remove()
  })
}

/**
 * Remove the record matching the given id
 *
 * @param {String} id ID of the record
 */
exports.removeById = function* (id) {
  var user = yield* this.findById(id)
  return yield user.remove()
}

/**
 * Count all records matching the given query
 *
 * @param {Object} query Object to query the database with
 */
exports.count = function* (query) {
  var collection = yield* this.getCollection()
  return yield function (done) {
    collection.count(query || {}, done)
  }
}

/**
 * Define indexes for the model
 */
exports.index = function* (field, options) {
  var collection = yield* this.getCollection()
  return yield function (done) {
    collection.ensureIndex(field, options || {}, done)
  }
}
