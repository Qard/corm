import mongo from 'promised-mongo'
import corm from '../'

describe('create', function () {
  // Create a monk connection
  const db = mongo('localhost/test')
  const UserCollection = db.collection('users')

  // Create a corm connection
  const model = corm('localhost/test')
  const User = model('users')

  // Clear all users after each test
  afterEach(async function () {
    await UserCollection.remove({})
  })

  it('should create a model', async function () {
    var user = await User.create({ name: 'test' })

    // Should be a User model instance
    // with _id and matching name value
    user.should.be.instanceOf(User)
    user.should.have.property('name', 'test')
    user.should.have.property('_id')

    // Should have been stored in the database
    var found = await UserCollection.findOne({ name: 'test' })
    found._id.toString().should.equal(user._id.toString())
    found.should.have.property('name', 'test')
  })

  it('should build and save a model', async function () {
    var user = User.build({ name: 'test' })

    // Should be a User model instance
    // with no _id yet and matching name value
    user.should.be.instanceOf(User)
    user.should.have.property('name', 'test')
    user.should.not.have.property('_id')

    // After saving, the model should have an _id
    await user.save()
    user.should.have.property('_id')

    // Should have been stored in the database
    var found = await UserCollection.findOne({ name: 'test' })
    found._id.toString().should.equal(user._id.toString())
    found.should.have.property('name', 'test')
  })
})
