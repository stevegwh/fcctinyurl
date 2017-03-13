const express = require('express');
const bodyParser= require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();
app.set('view engine', 'ejs')

MongoClient.connect('mongodb://admin:admin@ds129720.mlab.com:29720/star-wars-quotes', (err, database) => {
  if (err) return console.log(err);
  db = database;
  app.listen(3000, function() {
    console.log('listening on 3000')
  })
})

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/", (req, res)=> {
  db.collection('url').find().toArray(function(err, result) {
    let size = result.length;
    res.render('index.ejs', {url: result, size: size})
  });
})

function getUrl(url, result) {
  for(let i = 0; i < result.length; i++) {
    if(url == result[i].tinyUrl) {
        return i;
    }
  }
  return -1;
}

app.get("/:url?", (req, res)=> {
  let url = req.params.url;
  db.collection('url').find().toArray(function(err, result) {
    if (err) return console.log(err)
    if(getUrl(url, result) >= 0) {
      res.redirect("http://" + result[getUrl(url,result)].userUrl);
    } else {
      res.send("Invalid url");
    }
  });

})

function duplicateChecker(url,result) {
  for(let i = 0; i < result.length; i++) {
    if(url.userUrl == result[i].userUrl) {
      return true;
    }
  }
  return false;
}

app.post("/url-get", (req, res) => {
  db.collection('url').find().toArray(function(err, result) {
    req.body.userUrl = req.body.userUrl.replace("http://", "");
    req.body.userUrl = req.body.userUrl.replace("www.", "");

    if(duplicateChecker(req.body, result)) {
      res.send("url already exists");
    } else {
      let toInsert = {
        userUrl: req.body.userUrl,
        tinyUrl: result.length + 1
      }
      db.collection('url').save(toInsert, (err,result) => {
        if (err) return console.log(err)
        res.send('Saved to database, your Tiny Url is: ' + toInsert.tinyUrl);
      })
    }
  });


})
