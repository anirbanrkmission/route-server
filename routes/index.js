const express = require('express');
const router = express.Router();

// Get MongoClient
var MongoClient = require('mongodb').MongoClient;

// db url, collection name and db name
const dburl = 'mongodb://localhost:27017';
const dbname = 'loginDB';
const collname = 'loginData';

var db = null;

MongoClient.connect(dburl, function (err, client) {
  try {
    console.log('Connecting Mongo...');
    if (!err) {
      db = client.db(dbname);
    } else {
      console.log('Error message at connection: ', err.message);
    }
  } catch (err) {
    console.log(err);
  }
});

router.get('/', (req, res) => {
  try {
    var collection = db.collection(collname);

    collection.find({}).toArray(function (err, users) {
      if (!err) {
        // console.log('GET checked in.');
        res.send(users);
      } else {
        console.log('GET error msg: ', err.message);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.get('/checkLoginStatus/:u_name', (req, res) => {
  try {
    const collection = db.collection(collname);

    collection.find({
      username: req.params.u_name
    }).toArray(function (err, todos) {
      console.log(todos);
      if (!err) {
        if (todos.length == 0) {
          res.send(false);
        } else {
          res.send(todos[0].status);
        }
      }
    });
  } catch (err) {
    console.log(err)
  }
});

router.get('/getUser/:u_name', (req, res) => {
  try {
    const collection = db.collection(collname)

    collection.find({
      username: req.params.u_name
    }).toArray(function (err, user) {
      if (!err) {
        console.log('getUser Send: ', user)
        res.send(user)
      }
    })
  } catch (error) {
    console.log(error.message)
  }
})

router.get('/getFeeds/:username', (req, res) => {
  try {
    const collection = db.collection(collname)

    collection.find({
      username: req.params.username
    }).toArray(function (err, user) {
      if (!err) {
        console.log('Posts Sent: ', user[0])
        res.send(user[0].posts)
      }
    })
  } catch (error) {
   console.log(error.message) 
  }
})

router.get('/getAllPeople', (req, res) => {
  try {
    const collection = db.collection(collname)

    collection.find({},
      {
        projection: {username: 1, name: 1}
      }).toArray(function (err, people) {
        if (!err) {
          console.log(people)
          res.send(people)
        }
      })
  } catch (error) {
    console.log(error.message)
  }
})

router.post('/addUser/:email', function (req, res) {
  //console.log(req.body);
  try {
    const collection = db.collection(collname);

    collection.find({
      username: req.params.email
    }).toArray(function (err, users) {
      console.log('Users: ', users.length)
      if (!err) {
        if (users.length == 0) {
          collection.insertOne(req.body, function (err, result) {
            if (!err) {
              console.log('Inserted');
            } else {
              console.log('POST error message: ', err.message);
            }
            res.status(200).send('Inserted');
          })
        } else {
          console.log('User Already Exist')
          res.status(412).send('User Already Exist')
        }
      }
    })
  } catch (err) {
    console.log(err);
  }
});

router.patch('/postFeed/:username', function (req, res) {
  try {
    const collection = db.collection(collname)
    collection.updateOne({
      username: req.params.username
    },
    {
      $push: {
        posts: req.body
      }
    })

    console.log('Post uploaded');
    res.send(req.body);
  } catch (error) {
    console.log(error.message)
  }
})

router.patch('/addFriend/:u_name', function (req, res) {
  try {
    const collection = db.collection(collname)
    collection.updateOne({
      username: req.params.u_name
    },
    {
      $push: {
        friends: req.body
      }
    })

    console.log('Added friend')
    res.send(req.body)
  } catch (error) {
    console.log(error.message)
  }
})

router.delete('/delete', function (req, res) {
  try {
    const collection = db.collection(collname);
    collection.deleteMany({});
    res.send('Deleted');
  } catch (err) {
    res.send(err);
  }
});

router.delete('/dropCollection', function (req, res) {
  try {
    const collection = db.collection(collname)
    collection.drop()
    res.send('Droped: ', collname)
  } catch (error) {
    res.send(err.message)
  }
})

module.exports = router;