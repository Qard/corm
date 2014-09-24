var MongoClient = require('mongodb').MongoClient
var corm = require('../')

describe('hooks', function () {
  var UserCollection
  var db

  // Create a corm connection
  var model = corm('localhost/test')
  var User = model('users')

  // Connect to mongo
  before(function (done) {
    MongoClient.connect('mongodb://localhost/test', function (err, _db) {
      if (err) return done(err)
      db = _db
      UserCollection = db.collection('users')
      done()
    })
  })

  it('should trigger create hooks on first save', function* () {
    var count = 0

    var user = User.build({
      name: 'test'
    })

    user.beforeCreate = function* () {
      user.should.not.have.property('_id')
      count++
    }
    user.afterCreate = function* () {
      user.should.have.property('_id')
      count++
    }

    // Should reach both hooks
    count.should.equal(0)
    yield user.save()
    count.should.equal(2)

    yield user.remove()
  })

  it('should not trigger create hooks on subsequent saves', function* () {
    var count = 0

    var user = yield User.create({
      name: 'test'
    })

    user.beforeCreate = function* () {
      count++
    }
    user.afterCreate = function* () {
      count++
    }

    // Should reach both hooks
    count.should.equal(0)
    yield user.save()
    count.should.equal(0)

    yield user.remove()
  })

  it('should not trigger update hooks on first save', function* () {
    var count = 0

    var user = User.build({
      name: 'test'
    })

    user.beforeUpdate = function* () {
      count++
    }
    user.afterUpdate = function* () {
      count++
    }

    // Should reach both hooks
    count.should.equal(0)
    yield user.save()
    count.should.equal(0)

    yield user.remove()
  })

  it('should trigger update hooks on subsequent saves', function* () {
    var count = 0

    var user = yield User.create({
      name: 'test'
    })

    user.beforeUpdate = function* () {
      count++
    }
    user.afterUpdate = function* () {
      count++
    }

    // Should reach both hooks
    count.should.equal(0)
    yield user.save()
    count.should.equal(2)

    yield user.remove()
  })

  it('should always trigger validate hooks', function* () {
    var count = 0

    var user = User.build({
      name: 'test'
    })

    user.beforeValidate = function* () {
      count++
    }
    user.afterValidate = function* () {
      count++
    }

    // Should reach both hooks
    count.should.equal(0)
    yield user.save()
    count.should.equal(2)

    // Should reach both hooks
    yield user.save()
    count.should.equal(4)

    yield user.remove()
  })

  it('should always trigger save hooks', function* () {
    var count = 0

    var user = User.build({
      name: 'test'
    })

    user.beforeSave = function* () {
      count++
    }
    user.afterSave = function* () {
      count++
    }

    // Should reach both hooks
    count.should.equal(0)
    yield user.save()
    count.should.equal(2)

    // Should reach both hooks
    yield user.save()
    count.should.equal(4)

    yield user.remove()
  })
})
