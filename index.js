// URL SORTNER
const express = require('express');
const bodyParser = require('body-parser');
const mongoose  = require('mongoose');
const router = require('./src/routes/route.js');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', router);



mongoose.connect("mongodb+srv://Mongo123:Mongo123@cluster0.ckzr9.mongodb.net/url_Sortner?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
})


