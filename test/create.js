const monk = require('monk')
const corm = require('../')

describe('create', function () {
  // Create a monk connection
  const db = monk('localhost/test')
  const UserCollection = db.get('users')

  // Create a corm connection
  const model = corm('localhost/test')
  const User = model('users')

  // Clear all users after each test
  afterEach(function* () {
    yield UserCollection.remove({})
  })

  it('should create a model', function* () {
    var user = yield User.create({ name: 'test' })

    // Should be a User model instance
    // with _id and matching name value
    user.should.be.instanceOf(User)
    user.should.have.property('name', 'test')
    user.should.have.property('_id')

    // Should have been stored in the database
    var found = yield UserCollection.findOne({ name: 'test' })
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
    var found = yield UserCollection.findOne({ name: 'test' })
    found._id.toString().should.equal(user._id.toString())
    found.should.have.property('name', 'test')
  })
})
