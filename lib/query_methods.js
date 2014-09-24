var ObjectID = require('mongodb').ObjectID
var extend = require('util')._extend

/**
 * Fetch the data from mongo and mixin any changes
 */
exports.fetch = function* () {
  yield* this.waitUntilReady()

  // Reject removals of unsaved models
  if (this.isNew()) {
    throw new Error('cannot fetch unsaved model')
  }

  // Run before fetch hook
  yield* this.beforeFetch()

  // Get remote state and merge into itself
  var self = this
  var data = yield function (done) {
    self.collection.findOne({
      _id: new ObjectID(self._id.toString())
    }, done)
  }
  extend(this, data)

  // Run after fetch hook
  yield* this.afterFetch()
}

/**
 * Save current model state to mongo
 */
exports.save = function* () {
  yield* this.waitUntilReady()

  // Use update to sync model state of already persisted records
  if ( ! this.isNew()) {
    yield* this.update()
    return
  }

  // Run the validator, with before and after hooks
  yield* this.beforeValidate()
  yield* this.validate()
  yield* this.afterValidate()

  // Run before create + save hooks
  yield* this.beforeCreate()
  yield* this.beforeSave()

  // Insert the document
  var self = this
  var doc = extend({}, this)
  var res = yield function (done) {
    self.collection.insert(doc, done)
  }
  extend(this, res[0])

  // Run after create + save hooks
  yield* this.afterSave()
  yield* this.afterCreate()
}

/**
 * Send updated model state to database
 *
 * @param {Object} data Extra data to add to the model before the send
 */
exports.update = function* (data) {
  yield* this.waitUntilReady()

  // Reject updates on unsaved models
  if (this.isNew()) {
    throw new Error('cannot update unsaved model')
  }

  // Merge update data into the model, when supplied
  if (data) {
    extend(this, data)
  }

  // Run the validator, with before and after hooks
  yield* this.beforeValidate()
  yield* this.validate()
  yield* this.afterValidate()

  // Run before update + save hooks
  yield* this.beforeUpdate()
  yield* this.beforeSave()

  // Update and re-fetch
  var self = this
  var doc = extend({}, this)
  yield function (done) {
    self.collection.update({
      _id: new ObjectID(self._id)
    }, doc, done)
  }
  yield* this.fetch()

  // Run after update + save hooks
  yield* this.afterSave()
  yield* this.afterUpdate()
}

/**
 * Remove model state from database
 *
 * NOTE: The model remains usable, and saving will create a new record
 */
exports.remove = function* () {
  yield* this.waitUntilReady()

  // Reject removals of unsaved models
  if (this.isNew()) {
    throw new Error('cannot remove unsaved model')
  }

  // Run before remove hook
  yield* this.beforeRemove()

  // Remove the record from mongo
  var self = this
  yield function (done) {
    self.collection.remove({
      _id: self._id
    }, done)
  }

  // Delete the id, making it a new model
  delete this._id

  // Run after remove hook
  yield* this.afterRemove()
}

/**
 * Check if the model is linked to a mongo record yet
 */
exports.isNew = function () {
  return !this._id
}
