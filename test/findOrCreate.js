var MongoClient = require('mongodb').MongoClient
var corm = require('../')

describe('findOrCreate', function () {
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

  // Clear all users before the test
  before(function* () {
    yield function (done) {
      UserCollection.remove({}, done)
    }
  })

  // Clear all users after each test
  afterEach(function* () {
    yield function (done) {
      UserCollection.remove({}, done)
    }
  })

  it('should find if record exists', function* () {
    var data = { name: 'me' }

    // Create a record to find
    var created = yield function (done) {
      UserCollection.insert(data, done)
    }
    created = created[0]

    // Find the record
    var found = yield User.findOrCreate(data)

    // Should be an instance of the User model
    found.should.be.instanceOf(User)
    found.should.have.property('_id')
    found._id.toString().should.equal(created._id.toString())
    found.should.have.property('name', data.name)
  })

  it('should create if record does not exist', function* () {
    var data = { name: 'me' }

    // Create a record to find
    var created = yield User.findOrCreate(data)

    // Find the record
    var found = yield function (done) {
      UserCollection.findOne(data, done)
    }

    // Should be an instance of the User model
    created.should.be.instanceOf(User)
    created.should.have.property('_id')
    created._id.toString().should.equal(found._id.toString())
    created.should.have.property('name', data.name)
  })
})
