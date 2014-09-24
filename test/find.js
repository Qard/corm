var MongoClient = require('mongodb').MongoClient
var corm = require('../')

describe('find', function () {
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

  // Add some test users first
  var users = []
  before(function* () {
    var names = ['test1', 'test2', 'other']
    users = yield names.map(function (name) {
      return function (done) {
        UserCollection.insert({ name: name }, function (err, res) {
          done(err, res && res[0])
        })
      }
    })
  })

  // Clear all users after the test
  after(function* () {
    yield function (done) {
      UserCollection.remove({}, done)
    }
  })

  it('should find a model by id', function* () {
    var found = yield User.findById(users[0]._id)

    // Should be an instance of the User model
    // and have matching _id and name values
    found.should.be.instanceOf(User)
    found.should.have.property('_id')
    found._id.toString().should.equal(users[0]._id.toString())
    found.should.have.property('name', users[0].name)
  })

  it('should find a model by criteria', function* () {
    var found = yield User.findOne({
      name: users[1].name
    })

    // Should be an instance of the User model
    // and have matching _id and name values
    found.should.be.instanceOf(User)
    found.should.have.property('_id')
    found._id.toString().should.equal(users[1]._id.toString())
    found.should.have.property('name', users[1].name)
  })

  it('should find many models by criteria', function* () {
    var found = yield User.find({
      name: /^test/
    })

    // Should not find the "other" record
    found.should.have.lengthOf(2)

    // Each record should be a User model instance
    // and have matching _id and name values
    found.forEach(function (user, i) {
      user.should.be.instanceOf(User)
      user.should.have.property('_id')
      user._id.toString().should.equal(users[i]._id.toString())
      user.should.have.property('name', users[i].name)
    })
  })

  it('should not fetch a model without an id', function* () {
    var model = new User({})
    var err
    try {
      yield model.fetch()
    } catch (e) {
      err = e
    }

    err.should.be.an.instanceof(Error)
    err.should.have.property('message', 'cannot fetch unsaved model')
  })
})
