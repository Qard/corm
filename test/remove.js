const should = require('should')
const monk = require('monk')
const corm = require('../')

describe('remove', function () {
  // Create a monk connection
  const db = monk('localhost/test')
  const UserCollection = db.get('users')

  // Create a corm connection
  const model = corm('localhost/test')
  const User = model('users')

  // Create a test user before each test
  var testUser
  beforeEach(function* () {
    testUser = yield UserCollection.insert({
      name: 'test'
    })
  })

  it('should remove a model', function* () {
    var user = new User(testUser)
    user.should.have.property('name', 'test')
    user.should.have.property('_id')

    // Should have no _id after remove
    yield user.remove()
    user.should.not.have.property('_id')

    // The data should have been removed from the database
    var found = yield UserCollection.findById(testUser._id)
    should.not.exist(found)
  })

  it('should remove by id', function* () {
    yield User.removeById(testUser._id)

    // The data should have been removed from the database
    var found = yield UserCollection.findById(testUser._id)
    should.not.exist(found)
  })

  it('should remove by criteria', function* () {
    yield User.remove({
      name: testUser.name
    })

    // The data should have been removed from the database
    var found = yield UserCollection.findById(testUser._id)
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
