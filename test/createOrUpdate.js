const monk = require('monk')
const corm = require('../')

describe('createOrUpdate', function () {
  // Create a monk connection
  const db = monk('localhost/test')
  const UserCollection = db.get('users')

  // Create a corm connection
  const model = corm('localhost/test')
  const User = model('users')

  // Clear all users before the test
  before(function* () {
    yield UserCollection.remove({})
  })

  // Clear all users after each test
  afterEach(function* () {
    yield UserCollection.remove({})
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
    var created = yield UserCollection.insert(query)

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
