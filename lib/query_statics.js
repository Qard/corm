/**
 * Find a set of records in mongo and return a collection of models
 * 
 * @param {Object} query Object to query mongo with
 * @param {Object} options Options to pass to monk
 */
exports.find = function* (query, options) {
  var docs = yield this.collection.find(query, options)
  return new this(docs || [])
}

/**
 * Find one record and return the model
 * 
 * @param {Object} query Object to query mongo with
 * @param {Object} options Options to pass to monk
 */
exports.findOne = function* (query, options) {
  var doc = yield this.collection.findOne(query, options)
  if ( ! doc) return
  return new this(doc)
}

/**
 * Find one record by id and return the model
 * 
 * @param {ObjectId} id BSON ObjectID of a record
 * @param {Object} options Options to pass to monk
 */
exports.findById = function* (id, options) {
  var doc = yield this.collection.findById(id, options)
  if ( ! doc) return
  return new this(doc)
}

/**
 * Build and save a new model
 * 
 * @param {Object} data Object of data to create record with
 */
exports.create = function* (data) {
  var user = new this(data)
  yield user.save()
  return user
}

/**
 * Update all records matching the given query
 * 
 * @param {Object} query Object to query mongo with
 * @param {Object} data Object of complete data to overwrite record with
 * @param {Object} options Options to pass to monk
 */
exports.update = function* (query, data) {
  var users = yield this.find(query)
  return yield users.map(function (user) {
    return user.update(data)
  })
}

/**
 * Update the record matching the given id
 * 
 * @param {ObjectId} id BSON ObjectID of a record
 * @param {Object} data Object of complete data to overwrite record with
 * @param {Object} options Options to pass to monk
 */
exports.updateById = function* (id, data) {
  var user = yield this.findById(id)
  return yield user.update(data)
}

/**
 * Remove all records matching the given query
 * 
 * @param {Object} query Object to query mongo with
 * @param {Object} options Options to pass to monk
 */
exports.remove = function* (query) {
  var users = yield this.find(query)
  return yield users.map(function (user) {
    return user.remove()
  })
}

/**
 * Remove the record matching the given id
 * 
 * @param {ObjectId} id BSON ObjectID of a record
 * @param {Object} options Options to pass to monk
 */
exports.removeById = function* (id) {
  var user = yield this.findById(id)
  return yield user.remove()
}

/**
 * Count all records matching the given query
 * 
 * @param {Object} query Object to query mongo with
 */
exports.count = function* (query) {
  return yield this.collection.count(query || {})
}

/**
 * Define indexes for the model
 */
exports.index = function () {
  return this.collection.index.apply(collection, arguments)
}
