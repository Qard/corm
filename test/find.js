import mongo from 'promised-mongo'
import should from 'should'
import corm from '../'

describe('find', function () {
  // Create a monk connection
  const db = mongo('localhost/test')
  const UserCollection = db.collection('users')

  // Create a corm connection
  const model = corm('localhost/test')
  const User = model('users')

  // Add some test users first
  const users = []
  before(async function () {
    users.push(await UserCollection.insert({ name: 'test1' }))
    users.push(await UserCollection.insert({ name: 'test2' }))
    users.push(await UserCollection.insert({ name: 'other' }))
  })

  // Clear all users after the test
  after(async function () {
    await UserCollection.remove({})
  })

  it('should find a model by id', async function () {
    const found = await User.findById(users[0]._id)

    // Should be an instance of the User model
    // and have matching _id and name values
    found.should.be.instanceOf(User)
    found.should.have.property('_id')
    found._id.toString().should.equal(users[0]._id.toString())
    found.should.have.property('name', users[0].name)
  })

  it('should not find a non-existent model by id', async function () {
    let found
    try { found = await User.findById('nope') }
    catch (e) {}
    should.not.exist(found)
  })

  it('should find a model by criteria', async function () {
    const found = await User.findOne({
      name: users[1].name
    })

    // Should be an instance of the User model
    // and have matching _id and name values
    found.should.be.instanceOf(User)
    found.should.have.property('_id')
    found._id.toString().should.equal(users[1]._id.toString())
    found.should.have.property('name', users[1].name)
  })

  it('should find many models by criteria', async function () {
    const found = await User.find({
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

  it('should return empty array when nothing found', async function () {
    const found = await User.find({
      name: 'nope'
    })
    found.should.have.lengthOf(0)
  })

  it('should not fetch a model without an id', async function () {
    var model = new User({})
    var err
    try {
      await model.fetch()
    } catch (e) {
      err = e
    }

    err.should.be.an.instanceof(Error)
    err.should.have.property('message', 'cannot fetch unsaved model')
  })
})
