import mongo from 'promised-mongo'
import corm from '../'

describe('hooks', function () {
  // Create a monk connection
  const db = mongo('localhost/test')
  const UserCollection = db.collection('users')

  // Create a corm connection
  const model = corm('localhost/test')
  const User = model('users')

  it('should trigger create hooks on first save', async function () {
    var count = 0

    const user = User.build({
      name: 'test'
    })

    user.beforeCreate = async function () {
      user.should.not.have.property('_id')
      count++
    }
    user.afterCreate = async function () {
      user.should.have.property('_id')
      count++
    }

    // Should reach both hooks
    count.should.equal(0)
    await user.save()
    count.should.equal(2)

    await user.remove()
  })

  it('should not trigger create hooks on subsequent saves', async function () {
    var count = 0

    const user = await User.create({
      name: 'test'
    })

    user.beforeCreate = async function () {
      count++
    }
    user.afterCreate = async function () {
      count++
    }

    // Should reach both hooks
    count.should.equal(0)
    await user.save()
    count.should.equal(0)

    await user.remove()
  })

  it('should not trigger update hooks on first save', async function () {
    var count = 0

    const user = User.build({
      name: 'test'
    })

    user.beforeUpdate = async function () {
      count++
    }
    user.afterUpdate = async function () {
      count++
    }

    // Should reach both hooks
    count.should.equal(0)
    await user.save()
    count.should.equal(0)

    await user.remove()
  })

  it('should trigger update hooks on subsequent saves', async function () {
    var count = 0

    const user = await User.create({
      name: 'test'
    })

    user.beforeUpdate = async function () {
      count++
    }
    user.afterUpdate = async function () {
      count++
    }

    // Should reach both hooks
    count.should.equal(0)
    await user.save()
    count.should.equal(2)

    await user.remove()
  })

  it('should always trigger validate hooks', async function () {
    var count = 0

    const user = User.build({
      name: 'test'
    })

    user.beforeValidate = async function () {
      count++
    }
    user.afterValidate = async function () {
      count++
    }

    // Should reach both hooks
    count.should.equal(0)
    await user.save()
    count.should.equal(2)

    // Should reach both hooks
    await user.save()
    count.should.equal(4)

    await user.remove()
  })

  it('should always trigger save hooks', async function () {
    var count = 0

    const user = User.build({
      name: 'test'
    })

    user.beforeSave = async function () {
      count++
    }
    user.afterSave = async function () {
      count++
    }

    // Should reach both hooks
    count.should.equal(0)
    await user.save()
    count.should.equal(2)

    // Should reach both hooks
    await user.save()
    count.should.equal(4)

    await user.remove()
  })
})
