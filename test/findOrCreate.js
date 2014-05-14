const monk = require('monk')
const corm = require('../')

describe('findOrCreate', function () {
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

  it('should find if record exists', function* () {
    var data = { name: 'me' }

    // Create a record to find
    var created = yield UserCollection.insert(data)

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
    const created = yield User.findOrCreate(data)

    // Find the record
    var found = yield UserCollection.findOne(data)

    // Should be an instance of the User model
    created.should.be.instanceOf(User)
    created.should.have.property('_id')
    created._id.toString().should.equal(found._id.toString())
    created.should.have.property('name', data.name)
  })
})
