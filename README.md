Batch Call Wrapper
===

[![build status](https://img.shields.io/travis/rysenko/batch-call.svg?style=flat)](https://travis-ci.org/rysenko/batch-call)

This uses [request](https://github.com/request/request) inside and allows to wrap several calls into one batch.

Server-side example:

```javascript
require('express').all('/batch', require('batch-call')).listen(3000);
```

Client-side call:

```javascript
var request = require('request');
var payload = {
    users: {
        url: 'http://example.com/users/1',
    },
    project2: {
        url: 'http://example.com/projects/2',
        method: 'POST',
        headers: {
            Authentication: 'auth'
        },
        json: { name: "project2" }
    },
    simple: 'http://example.com/simle/get'
}
request({ url: 'http://0.0.0.0:3000/batch', json: payload }, function (err, res, body) {
    console.log(body);
};
````

Result of the call:

```javascript
{
    users: {
        body: [ 'user1', 'user2' ],
        headers: {}
    },
    project2: {
        body: { id: 2, name: 'project2' }
        headers: {}
    },
    simple: {
        body: 'result',
        headers: {}
    }
}
```
