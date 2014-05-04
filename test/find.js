const monk = require('monk')
const corm = require('../')

describe('find', function () {
  // Create a monk connection
  const db = monk('localhost/test')
  const UserCollection = db.get('users')

  // Create a corm connection
  const model = corm('localhost/test')
  const User = model('users')

  // Add some test users first
  const users = []
  before(function* () {
    users.push(yield UserCollection.insert({ name: 'test1' }))
    users.push(yield UserCollection.insert({ name: 'test2' }))
    users.push(yield UserCollection.insert({ name: 'other' }))
  })

  // Clear all users after the test
  after(function* () {
    yield UserCollection.remove({})
  })

  it('should find a model by id', function* () {
    const found = yield User.findById(users[0]._id)

    // Should be an instance of the User model
    // and have matching _id and name values
    found.should.be.instanceOf(User)
    found.should.have.property('_id')
    found._id.toString().should.equal(users[0]._id.toString())
    found.should.have.property('name', users[0].name)
  })

  it('should find a model by criteria', function* () {
    const found = yield User.findOne({
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
    const found = yield User.find({
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
})
