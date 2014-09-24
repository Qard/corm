var MongoClient = require('mongodb').MongoClient
var should = require('should')
var corm = require('../')

describe('remove', function () {
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

  // Create a test user before each test
  var testUser
  beforeEach(function* () {
    testUser = yield function (done) {
      UserCollection.insert({
        name: 'test'
      }, function (err, res) {
        done(err, res && res[0])
      })
    }
  })

  it('should remove a model', function* () {
    var user = new User(testUser)
    user.should.have.property('name', 'test')
    user.should.have.property('_id')

    // Should have no _id after remove
    yield user.remove()
    user.should.not.have.property('_id')

    // The data should have been removed from the database
    var found = yield function (done) {
      UserCollection.findOne({
        _id: testUser._id
      }, done)
    }
    should.not.exist(found)
  })

  it('should remove by id', function* () {
    yield User.removeById(testUser._id)

    // The data should have been removed from the database
    var found = yield function (done) {
      UserCollection.findOne({
        _id: testUser._id
      }, done)
    }
    should.not.exist(found)
  })

  it('should remove by criteria', function* () {
    yield User.remove({
      name: testUser.name
    })

    // The data should have been removed from the database
    var found = yield function (done) {
      UserCollection.findOne({
        _id: testUser._id
      }, done)
    }
    should.not.exist(found)
  })

  it('should not remove a model without an id', function* () {
    var model = new User({})
    var err
    try {
      yield model.remove()
    } catch (e) {
      err = e
    }

    err.should.be.an.instanceof(Error)
    err.should.have.property('message', 'cannot remove unsaved model')
  })
})
