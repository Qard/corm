import mongo from 'promised-mongo'
import corm from '../'

describe('createOrUpdate', function () {
  // Create a monk connection
  const db = mongo('localhost/test')
  const UserCollection = db.collection('users')

  // Create a corm connection
  const model = corm('localhost/test')
  const User = model('users')

  // Clear all users before the test
  before(async function () {
    await UserCollection.remove({})
  })

  // Clear all users after each test
  afterEach(async function () {
    await UserCollection.remove({})
  })

  it('should create new record', async function () {
    var query = { email: 'me@example.com', name: 'me' }

    // Create the record
    var created = await User.createOrUpdate(query)

    // Should be an instance of the User model
    created.should.be.instanceOf(User)
    created.should.have.property('_id')
    created.should.have.property('email', query.email)
    created.should.have.property('name', query.name)
  })

  it('should create new record with extra data', async function () {
    var query = { email: 'me@example.com' }
    var data = { name: 'me' }

    // Create the record
    var created = await User.createOrUpdate(query, data)

    // Should be an instance of the User model
    created.should.be.instanceOf(User)
    created.should.have.property('_id')
    created.should.have.property('email', query.email)
    created.should.have.property('name', data.name)
  })

  it('should update existing record', async function () {
    var query = { email: 'me@example.com' }
    var data = { name: 'me' }

    // Generate user with no name
    var created = await UserCollection.insert(query)

    // Update it with a name
    var updated = await User.createOrUpdate(query, data)

    // Should be an instance of the User model
    updated.should.be.instanceOf(User)
    updated.should.have.property('_id')
    updated._id.toString().should.equal(created._id.toString())
    updated.should.have.property('email', query.email)
    updated.should.have.property('name', data.name)
  })
})
