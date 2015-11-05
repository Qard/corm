import mongo from 'promised-mongo'
import corm from '../'

describe('update', function () {
  // Create a monk connection
  const db = mongo('localhost/test')
  const UserCollection = db.collection('users')

  // Create a corm connection
  const model = corm('localhost/test')
  const User = model('users')

  it('should update a model', async function () {
    // Should create a user
    const user = await User.create({
      name: 'test'
    })
    user.should.have.property('name', 'test')

    // Should have changed the name property
    await user.update({ name: 'updated' })
    user.should.have.property('name', 'updated')

    // Should have updated in the database
    const found = await UserCollection.findOne({ _id: user._id })
    found.should.have.property('name', 'updated')

    // Remove the test data
    await user.remove()
  })

  it('should update by id', async function () {
    // Create test record in the database
    const user = await UserCollection.insert({
      name: 'test'
    })

    // Should have changed the name property
    await User.updateById(user._id, {
      name: 'updated'
    })

    // Should have updated in the database
    const found = await UserCollection.findOne({ _id: user._id })
    found.should.have.property('name', 'updated')

    // Remove the test data
    await UserCollection.remove({ _id: user._id })
  })

  it('should update by criteria', async function () {
    // Create test record in the database
    const user = await UserCollection.insert({
      name: 'test'
    })

    // Should have changed the name property
    await User.update({
      name: user.name
    }, {
      name: 'updated'
    })

    // Should have updated in the database
    const found = await UserCollection.findOne({ _id: user._id })
    found.should.have.property('name', 'updated')

    // Remove the test data
    await UserCollection.remove({ _id: user._id })
  })

  it('should not update a model without an id', async function () {
    var model = new User({})
    var err
    try {
      await model.update()
    } catch (e) {
      err = e
    }

    err.should.be.an.instanceof(Error)
    err.should.have.property('message', 'cannot update unsaved model')
  })
})
