import should from 'should'
import mongo from 'promised-mongo'
import corm from '../'

describe('remove', function () {
  // Create a monk connection
  const db = mongo('localhost/test')
  const UserCollection = db.collection('users')

  // Create a corm connection
  const model = corm('localhost/test')
  const User = model('users')

  // Create a test user before each test
  var testUser
  beforeEach(async function () {
    testUser = await UserCollection.insert({
      name: 'test'
    })
  })

  it('should remove a model', async function () {
    var user = new User(testUser)
    user.should.have.property('name', 'test')
    user.should.have.property('_id')

    // Should have no _id after remove
    await user.remove()
    user.should.not.have.property('_id')

    // The data should have been removed from the database
    var found = await UserCollection.findOne({ _id: testUser._id })
    should.not.exist(found)
  })

  it('should remove by id', async function () {
    await User.removeById(testUser._id)

    // The data should have been removed from the database
    var found = await UserCollection.findOne({ _id: testUser._id })
    should.not.exist(found)
  })

  it('should remove by criteria', async function () {
    await User.remove({
      name: testUser.name
    })

    // The data should have been removed from the database
    var found = await UserCollection.findOne({ _id: testUser._id })
    should.not.exist(found)
  })

  it('should not remove a model without an id', async function () {
    var model = new User({})
    var err
    try {
      await model.remove()
    } catch (e) {
      err = e
    }

    err.should.be.an.instanceof(Error)
    err.should.have.property('message', 'cannot remove unsaved model')
  })
})
