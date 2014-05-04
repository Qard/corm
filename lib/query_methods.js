const extend = require('util')._extend

/**
 * Fetch the data from mongo and mixin any changes
 */
exports.fetch = function* () {
  var data = yield this.collection.findById(this._id)
  extend(this, data)
}

/**
 * Save current model state to mongo
 */
exports.save = function* () {
  // Use update to sync model state of already persisted records
  if ( ! this.isNew()) {
    yield this.update()
    return
  }

  // Run the validator, with before and after hooks
  yield this.beforeValidate()
  yield this.validate()
  yield this.afterValidate()

  // Run before create + save hooks
  yield this.beforeCreate()
  yield this.beforeSave()

  // Insert the document
  var doc = extend({}, this)
  extend(this, yield this.collection.insert(doc))

  // Run after create + save hooks
  yield this.afterSave()
  yield this.afterCreate()
}

/**
 * Send updated model state to database
 *
 * @param {Object} data Extra data to add to the model before the send
 */
exports.update = function* (data) {
  // Reject updates on unsaved models
  if (this.isNew()) {
    throw new Error('cannot update unsaved model')
  }

  // Merge update data into the model, when supplied
  if (data) {
    extend(this, data)
  }

  // Run the validator, with before and after hooks
  yield this.beforeValidate()
  yield this.validate()
  yield this.afterValidate()

  // Run before update + save hooks
  yield this.beforeUpdate()
  yield this.beforeSave()

  // Update and re-fetch
  var doc = extend({}, this)
  yield this.collection.updateById(this._id, doc)
  yield this.fetch()

  // Run after update + save hooks
  yield this.afterSave()
  yield this.afterUpdate()
}

/**
 * Remove model state from database
 *
 * NOTE: The model remains usable, and saving will create a new record
 */
exports.remove = function* () {
  // Reject removals of unsaved models
  if (this.isNew()) {
    throw new Error('cannot remove unsaved model')
  }

  // Run before remove hook
  yield this.beforeRemove()

  // Remove the record from mongo
  yield this.collection.remove({
    _id: this._id
  })

  // Delete the id, making it a new model
  delete this._id

  // Run after remove hook
  yield this.afterRemove()
}

/**
 * Check if the model is linked to a mongo record yet
 */
exports.isNew = function () {
  return !this._id
}
