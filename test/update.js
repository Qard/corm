var MongoClient = require('mongodb').MongoClient
var corm = require('../')

describe('update', function () {
  var UserCollection
  var db

  // Create a corm connection
  var model = corm('localhost/test')
  var User = model('users')

  // Connect to mongo
  before(function (done) {
    MongoClient.connect('mongodb://localhost/test', function (err, _db) {
      if (err) return done(err)
      db = _db
      UserCollection = db.collection('users')
      done()
    })
  })

  it('should update a model', function* () {
    // Should create a user
    var user = yield User.create({
      name: 'test'
    })
    user.should.have.property('name', 'test')

    // Should have changed the name property
    yield user.update({ name: 'updated' })
    user.should.have.property('name', 'updated')

    // Should have updated in the database
    var found = yield function (done) {
      UserCollection.findOne({
        _id: user._id
      }, done)
    }
    found.should.have.property('name', 'updated')

    // Remove the test data
    yield user.remove()
  })

  it('should update by id', function* () {
    // Create test record in the database
    var user = yield function (done) {
      UserCollection.insert({
        name: 'test'
      }, done)
    }
    user = user[0]

    // Should have changed the name property
    yield User.updateById(user._id, {
      name: 'updated'
    })

    // Should have updated in the database
    var found = yield function (done) {
      UserCollection.findOne({
        _id: user._id
      }, done)
    }
    found.should.have.property('name', 'updated')

    // Remove the test data
    yield function (done) {
      UserCollection.remove({
        _id: user._id
      }, done)
    }
  })

  it('should update by criteria', function* () {
    // Create test record in the database
    var user = yield function (done) {
      UserCollection.insert({
        name: 'test'
      }, done)
    }
    user = user[0]

    // Should have changed the name property
    yield User.update({
      name: user.name
    }, {
      name: 'updated'
    })

    // Should have updated in the database
    var found = yield function(done) {
      UserCollection.findOne({
        _id: user._id
      }, done)
    }
    found.should.have.property('name', 'updated')

    // Remove the test data
    yield function (done) {
      UserCollection.remove({
        _id: user._id
      }, done)
    }
  })

  it('should not update a model without an id', function* () {
    var model = new User({})
    var err
    try {
      yield model.update()
    } catch (e) {
      err = e
    }

    err.should.be.an.instanceof(Error)
    err.should.have.property('message', 'cannot update unsaved model')
  })
})
