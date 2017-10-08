var bodyParser = require('body-parser');
var express = require('express');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var uri = "mongodb://dbublil:Dixnlj3zyJYd06R0@cluster0-shard-00-00-spckj.mongodb.net:27017,cluster0-shard-00-01-spckj.mongodb.net:27017,cluster0-shard-00-02-spckj.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
var app = express();
var defaultPort = process.env.port || 5000;

app.use(express.static('static_data'));
app.use(bodyParser.json());
app.set('port', (defaultPort));

app.post('/contacts', function(req,res) {
    try {
        MongoClient.connect(uri, function (err, db) {
            if (err) throw err;
            var contact = {name: req.body.name, number: req.body.number};
            db.collection("contacts").insertOne(contact, function (err) {
                if (err) {
                    if (err.code === 11000) {
                        res.status(500).send("duplicate");
                    }
                    else res.status(500).send("error");
                }
                console.log(JSON.stringify(contact));
                res.status(200).send();
                db.close();
            });
        });
    } catch(err) {
        console.log(err);
    }

});

app.get('/contacts', function(req,res) {
    try {
        MongoClient.connect(uri, function (err, db) {
            if (err) throw err;
            db.collection("contacts").find({}).toArray(function (err, result) {
                if (err) throw err;
                res.status(200).json(result)
                db.close();
            })
        });
    } catch (err) {
        console.log(err);
    }
});


app.all('/',function(req,res){
    res.redirect("/index.html")
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});



