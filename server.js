const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 8000
require('dotenv').config()

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'moving-box-tracker'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
  .then(client => {
    console.log(`Connected to ${dbName} database.`)
    db = client.db(dbName)
  })

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get('/', (req, res) =>{
  db.collection('box1').find().toArray()
    .then(data => {
      console.log(data)
      res.render('index.ejs', { info: data })
    })
    .catch(error => console.error(error))
})

app.post('/addItem', (req, res) => {
  db.collection('box1').insertOne({name: req.body.name, count: req.body.count})
  .then(result => {
    console.log('Item added.')
    res.redirect('/')
  })
  .catch(error => console.error(error))
})

app.listen(process.env.PORT || PORT, ()=>{
  console.log('Server online')
})