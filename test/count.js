import corm from '../'

describe('update', function () {
  const model = corm('localhost/test')
  const User = model('users')

  it('should count', async function () {
    const a = await User.count({ name: 'test' })
    a.should.be.a.Number

    const b = await User.count()
    b.should.be.a.Number
  })
})
