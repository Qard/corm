import Promise from 'native-or-bluebird'
import corm from '../'

describe('update', function () {
  it('should support setting promise library', async function () {
    // Patch Promise.all
    const oldAll = Promise.all
    let called = false
    Promise.all = function () {
      called = true
      return oldAll.apply(this, arguments)
    }

    const model = corm('localhost/test', {
      promise: Promise
    })
    const User = model('users')

    await User.update({ name: 'test' }, { name: 'updated' })

    Promise.all = oldAll

    called.should.equal(true)
  })
})
