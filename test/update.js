const monk = require('monk')
const corm = require('../')

describe('update', function () {
  // Create a monk connection
  const db = monk('localhost/test')
  const UserCollection = db.get('users')

  // Create a corm connection
  const model = corm('localhost/test')
  const User = model('users')

  it('should update a model', function* () {
    // Should create a user
    const user = yield User.create({
      name: 'test'
    })
    user.should.have.property('name', 'test')

    // Should have changed the name property
    yield user.update({ name: 'updated' })
    user.should.have.property('name', 'updated')

    // Should have updated in the database
    const found = yield UserCollection.findById(user._id)
    found.should.have.property('name', 'updated')

    // Remove the test data
    yield user.remove()
  })

  it('should update by id', function* () {
    // Create test record in the database
    const user = yield UserCollection.insert({
      name: 'test'
    })

    // Should have changed the name property
    yield User.updateById(user._id, {
      name: 'updated'
    })

    // Should have updated in the database
    const found = yield UserCollection.findById(user._id)
    found.should.have.property('name', 'updated')

    // Remove the test data
    yield UserCollection.remove({ _id: user._id })
  })

  it('should update by criteria', function* () {
    // Create test record in the database
    const user = yield UserCollection.insert({
      name: 'test'
    })

    // Should have changed the name property
    yield User.update({
      name: user.name
    }, {
      name: 'updated'
    })

    // Should have updated in the database
    const found = yield UserCollection.findById(user._id)
    found.should.have.property('name', 'updated')

    // Remove the test data
    yield UserCollection.remove({ _id: user._id })
  })

  it('should not update a model without an id', function* () {
    var model = new User({})
    var err
    try {
      yield model.update()
    } catch (e) {
      err = e
    }

    err.should.be.an.instanceof(Error)
    err.should.have.property('message', 'cannot update unsaved model')
  })
})
