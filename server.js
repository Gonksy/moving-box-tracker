const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 8000
require('dotenv').config()




//Registration & Authentication
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const initializePassport = require('./passport-config')
initializePassport(passport, 
  email => { users.find(user => user.email === email)
})
//-----------------------------


let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'moving-box-tracker'

const users = []

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
  .then(client => {
    console.log(`Connected to ${dbName} database.`)
    db = client.db(dbName)
  })

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())



//Authentication, registration & login
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/login', (req, res) => {
  res.render('login.ejs')
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', (req, res) => {
  res.render('register.ejs')
})

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } 
  catch {
    res.redirect('/register')
  }
  console.log(users)
})
//-----------------------------



let boxNames
let boxCount
app.get('/', (req, res) =>{
  async function getBoxes(){
    const allBoxes = await db.listCollections().toArray()
    boxNames = allBoxes.map(x => x.name) 
    boxCount = boxNames.length
    const boxData = []
    for (let i = 0; i < boxCount; i++){
      boxData.push(await db.collection(`${boxNames[i]}`).find().toArray())
    }

    for(let i = 0; i < boxCount; i++){
      {boxData[i]; boxNames[i]}
    }
    console.log({boxNames, boxData})
    return boxData
  }
  getBoxes()
    .then(data => {
      console.log(data)
      res.render('index.ejs', { info: data })
    })
    .catch(error => console.error(error))
})

app.post('/addItem/:id', (req, res) => {
  const id = req.params.id
  db.collection(`box${id}`).insertOne({name: req.body.name, count: req.body.count})
    .then(result => {
      console.log('Item added.')
      res.redirect('/')
    })
    .catch(error => console.error(error))
})

app.post('/createBox/', (req, res) => {
  const boxName = req.body.name
  console.log(boxName)
  db.createCollection(boxName)
    .then(db.collection(boxName).insertOne({name: boxName}))
    .then(result => {
      console.log(`Box "${boxName}" created`)
      res.redirect('/')
    })
    .catch(error => console.error(error))
})

app.delete('/deleteBox/', (req, res) => {
  const boxName = req.body.boxName
  console.log(boxName)
  db.collection(boxName).drop()
    .then(result => {
      console.log('Box deleted')
      res.json('Collection deleted')
    })
    .catch(error => console.error(error))

})

app.listen(process.env.PORT || PORT, ()=>{
  console.log('Server online')
})