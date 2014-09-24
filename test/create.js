var MongoClient = require('mongodb').MongoClient
var corm = require('../')

describe('create', function () {
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

  // Clear all users after each test
  afterEach(function* () {
    yield function (done) {
      UserCollection.remove({}, done)
    }
  })

  it('should create a model', function* () {
    var user = yield User.create({ name: 'test' })

    // Should be a User model instance
    // with _id and matching name value
    user.should.be.instanceOf(User)
    user.should.have.property('name', 'test')
    user.should.have.property('_id')

    // Should have been stored in the database
    var found = yield function (done) {
      UserCollection.findOne({ name: 'test' }, done)
    }
    found._id.toString().should.equal(user._id.toString())
    found.should.have.property('name', 'test')
  })

  it('should build and save a model', function* () {
    var user = User.build({ name: 'test' })

    // Should be a User model instance
    // with no _id yet and matching name value
    user.should.be.instanceOf(User)
    user.should.have.property('name', 'test')
    user.should.not.have.property('_id')

    // After saving, the model should have an _id
    yield user.save()
    user.should.have.property('_id')

    // Should have been stored in the database
    var found = yield function (done) {
      UserCollection.findOne({ name: 'test' }, done)
    }
    found._id.toString().should.equal(user._id.toString())
    found.should.have.property('name', 'test')
  })
})
