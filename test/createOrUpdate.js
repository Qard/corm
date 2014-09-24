var MongoClient = require('mongodb').MongoClient
var corm = require('../')

describe('createOrUpdate', function () {
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

  it('should create new record', function* () {
    var query = { email: 'me@example.com' }
    var data = { name: 'me' }

    // Create the record
    var created = yield User.createOrUpdate(query, data)

    // Should be an instance of the User model
    created.should.be.instanceOf(User)
    created.should.have.property('_id')
    created.should.have.property('email', query.email)
    created.should.have.property('name', data.name)
  })

  it('should update existing record', function* () {
    var query = { email: 'me@example.com' }
    var data = { name: 'me' }

    // Generate user with no name
    var created = yield function (done) {
      UserCollection.insert(query, done)
    }
    created = created[0]

    // Update it with a name
    var updated = yield User.createOrUpdate(query, data)

    // Should be an instance of the User model
    updated.should.be.instanceOf(User)
    updated.should.have.property('_id')
    updated._id.toString().should.equal(created._id.toString())
    updated.should.have.property('email', query.email)
    updated.should.have.property('name', data.name)
  })
})
