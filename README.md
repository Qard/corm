# CORM

![i like corm](http://kimaguresan.files.wordpress.com/2014/02/f3b0e52f0cb3ecbf0ee58978238b6563_h.jpg)

[![build status](https://secure.travis-ci.org/Qard/corm.png)](http://travis-ci.org/Qard/corm) [![Coverage Status](https://coveralls.io/repos/Qard/corm/badge.png)](https://coveralls.io/r/Qard/corm)

This is the beginnings of a project to make a full-featured ORM that takes advantage of generators, which should make the codebase and usage of the library vastly simpler. I spent weeks digging through existing node ORM implementations, only to find myself dissatisfied with how convoluted they all seemed to be.

## Installation

```sh
npm install corm
```

## Usage

```js
const model = corm('localhost/test')
const User = model('users')

const user = User.build({
  email: 'me@example.com'
})
yield user.save()

yield user.update({
  name: 'me'
})

yield user.remove()
```

## Model API

### Statics

#### Model.build(data)
Build a model instance.

#### yield Model.create(data)
Build and save a model instance.

#### yield Model.find(query)
Find an array of model instances using a query object.

#### yield Model.findOne(query)
Find one model instance using a query object.

#### yield Model.findById(id)
Find one model instance by id.

#### yield Model.update(query, data)
Update any records that match the query.

#### yield Model.updateById(id, data)
Update the record that matches the query.

#### yield Model.remove(query)
Remove any records that match the query.

#### yield Model.removeById(id)
Remove the record that matches the query.

#### yield Model.count(query)
Count number of records matching the query.

#### yield Model.index(...)
Currently, this is passed through directly to monk.

### Methods

#### model.isNew()
This method is mostly used internally to detect if a model exists in the database already. Currently, it simply checks for existence of a `_id` property.

#### yield model.save()
Insert new models or update already persisted models.

#### yield model.update(data)
Apply the input data to the model and save it.

#### yield model.remove()
Remove the model from the database.

#### yield model.fetch()
Fetch the latest model state from the database.

## TODO

- Relations (also, dependent deletion)
- Write a better hook system (multiple hooks would be nice, maybe use() middleware?)
- Decouple from monk, eventually?

---

### Copyright (c) 2013 Stephen Belanger
#### Licensed under MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
