import { _extend as extend } from 'util'
import mongo from 'promised-mongo'

module.exports = function (url, opts = {}) {
  const connection = mongo(url)
  const Promise = opts.promise || require('native-or-bluebird')

  function fixId (obj) {
    if (typeof obj._id === 'string') {
      obj._id = mongo.ObjectId(obj._id)
    }
    return obj
  }

  /**
   * Return a model builder for the database connection
   *
   * @param {String} name Collection name
   */
  return function (name) {
    let collection = connection.collection(name)

    class Model {

      /**
       * Model constructor
       *
       * @param {Object} data Data to construct new model instance with
       */
      constructor(doc) {
        // Expose collection without it appearing in serialized objects
        Object.defineProperty(this, 'collection', {
          value: collection,
          configurable: false,
          enumerable: false,
          writable: false
        })

        // Mix initialization data into instance
        extend(this, doc)
      }

      /**
       * Validate the model
       *
       * Unlike how validation works in other model systems,
       * this adopts the "generator way" of throwing errors.
       * This means you can use basic language constructs
       * like try/catch blocks to make validation obvious.
       */
      async validate() {}

      // Hooks
      async beforeValidate() {}
      async beforeCreate() {}
      async beforeUpdate() {}
      async beforeRemove() {}
      async beforeFetch() {}
      async beforeSave() {}
      async afterValidate() {}
      async afterCreate() {}
      async afterUpdate() {}
      async afterRemove() {}
      async afterFetch() {}
      async afterSave() {}

      /**
       * Fetch the data from mongo and mixin any changes
       */
      async fetch() {
        // Reject removals of unsaved models
        if (this.isNew()) {
          throw new Error('cannot fetch unsaved model')
        }

        // Run before fetch hook
        await this.beforeFetch()

        // Get remote state and merge into itself
        var data = await this.collection.findOne(fixId({ _id: this._id }))
        extend(this, data)

        // Run after fetch hook
        await this.afterFetch()
      }

      /**
       * Save current model state to mongo
       */
      async save() {
        // Use update to sync model state of already persisted records
        if ( ! this.isNew()) {
          await this.update()
          return
        }

        // Run the validator, with before and after hooks
        await this.beforeValidate()
        await this.validate()
        await this.afterValidate()

        // Run before create + save hooks
        await this.beforeCreate()
        await this.beforeSave()

        // Insert the document
        var doc = extend({}, this)
        extend(this, await this.collection.insert(fixId(doc)))

        // Run after create + save hooks
        await this.afterSave()
        await this.afterCreate()
      }

      /**
       * Send updated model state to database
       *
       * @param {Object} data Extra data to add to the model before the send
       */
      async update(data) {
        // Reject updates on unsaved models
        if (this.isNew()) {
          throw new Error('cannot update unsaved model')
        }

        // Merge update data into the model, when supplied
        if (data) {
          extend(this, data)
        }

        // Run the validator, with before and after hooks
        await this.beforeValidate()
        await this.validate()
        await this.afterValidate()

        // Run before update + save hooks
        await this.beforeUpdate()
        await this.beforeSave()

        // Update and re-fetch
        var doc = extend({}, this)
        await this.collection.update(fixId({ _id: this._id }), fixId(doc))
        await this.fetch()

        // Run after update + save hooks
        await this.afterSave()
        await this.afterUpdate()
      }

      /**
       * Remove model state from database
       *
       * NOTE: The model remains usable, and saving will create a new record
       */
      async remove() {
        // Reject removals of unsaved models
        if (this.isNew()) {
          throw new Error('cannot remove unsaved model')
        }

        // Run before remove hook
        await this.beforeRemove()

        // Remove the record from mongo
        await this.collection.remove(fixId({
          _id: this._id
        }))

        // Delete the id, making it a new model
        delete this._id

        // Run after remove hook
        await this.afterRemove()
      }

      /**
       * Check if the model is linked to a mongo record yet
       */
      isNew() {
        return !this._id
      }

      /**
       * Build a new model
       *
       * @param {Object} data Object of data to build record with
       */
      static build(data) {
        if (Array.isArray(data)) {
          return data.map((v) => new this(v))
        }
        return new this(data)
      }

      /**
       * Find a set of records in mongo and return a collection of models
       *
       * @param {Object} query Object to query the database with
       * @param {Object} options Options to pass to monk
       */
      static async find(query, options) {
        var docs = await this.collection.find(fixId(query), options)
        return this.build(docs)
      }

      /**
       * Find one record and return the model
       *
       * @param {Object} query Object to query the database with
       * @param {Object} options Options to pass to monk
       */
      static async findOne(query, options) {
        var doc = await this.collection.findOne(fixId(query), options)
        if ( ! doc) return
        return this.build(doc)
      }

      /**
       * Find one record by id and return the model
       *
       * @param {String} id ID of the record
       * @param {Object} options Options to pass to monk
       */
      static async findById(id, options) {
        var doc = await this.collection.findOne(fixId({ _id: id }), options)
        if ( ! doc) return
        return this.build(doc)
      }

      /**
       * Find or create a record and return the model
       *
       * @param {Object} query Object to query the database with
       */
      static async findOrCreate(query) {
        var doc = await this.findOne(query)
        if ( ! doc) {
          doc = await this.create(query)
        }
        return doc
      }

      /**
       * Create or update a record and return the model
       *
       * @param {Object} query Object to query the database with
       * @param {Object} data Data to add to the record
       */
      static async createOrUpdate(query, data) {
        data = data || {}

        // First, attempt to find the record
        var doc = await this.findOne(query)
        if (doc) {
          await doc.update(data)

        // If that fails, create a new record
        } else {
          extend(query, data)
          doc = await this.create(query)
        }

        return doc
      }

      /**
       * Build and save a new model
       *
       * @param {Object} data Object of data to create record with
       */
      static async create(data) {
        var doc = this.build(data)
        await doc.save()
        return doc
      }

      /**
       * Update all records matching the given query
       *
       * @param {Object} query Object to query the database with
       * @param {Object} data Object of complete data to overwrite record with
       */
      static async update(query, data) {
        var users = await this.find(query)
        return await Promise.all(users.map((user) => user.update(data)))
      }

      /**
       * Update the record matching the given id
       *
       * @param {String} id ID of the record
       * @param {Object} data Object of complete data to overwrite record with
       */
      static async updateById(id, data) {
        var user = await this.findOne({ _id: id })
        return await user.update(data)
      }

      /**
       * Remove all records matching the given query
       *
       * @param {Object} query Object to query the database with
       */
      static async remove(query) {
        var users = await this.find(query)
        return await Promise.all(users.map((user) => user.remove()))
      }

      /**
       * Remove the record matching the given id
       *
       * @param {String} id ID of the record
       */
      static async removeById(id) {
        var user = await this.findOne({ _id: id })
        return await user.remove()
      }

      /**
       * Count all records matching the given query
       *
       * @param {Object} query Object to query the database with
       */
      static async count(query) {
        return await this.collection.count(fixId(query || {}))
      }

      /**
       * Define indexes for the model
       */
      // static index() {
      //   return this.collection.index.apply(collection, arguments)
      // }
    }

    // Attach collection at class level
    Object.defineProperty(Model, 'collection', {
      value: collection,
      configurable: false,
      enumerable: false,
      writable: false
    })

    return Model
  }
}
