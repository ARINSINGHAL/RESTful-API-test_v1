const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")

const app = express()

app.set('view engine', 'ejs')
mongoose.set("strictQuery",false)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

mongoose.connect("mongodb://127.0.0.1:27017/wikiDB",{useNewUrlParser:true})

const articleSchema = {
    title : String,
    content : String
}
 
const Article = mongoose.model("Article", articleSchema)
//////////////////////////////////// Targeting Articles page ///////////////////////////////////
app.route("/articles")

  .get(async (req, res) => {
    await Article.find().then(foundArticles => {
        res.send(foundArticles)
    }).catch(err => {
        console.log(err)
    })
  })

  .post(async function (req, res) {
 
    try {
      const newArticle = new Article({
        title: req.body.title,
        content: req.body.content
      })
      
      await newArticle.save()
      res.send("Successfully added a new article.")
   
    } catch (error) {
      res.send(error)
    }
   
  })

  .delete(function(req, res){
    Article.deleteMany({})
    .then(()=>{
        res.send("Successfully deleted all the articles.")
    })
    .catch(err => {
        console.log(err)
    }) 
  })

////////////////////////////////////// Targetin a specific article ///////////////////////////////////////////////////////////


app.route("/articles/:articleTitle")

  .get(async function (req, res) {
    try {
        const foundArticle = await Article.findOne({ title: req.params.articleTitle })
        if (foundArticle) {
            res.send(foundArticle)
        } else {
            res.send('No articles matching that title was found.')
        }
    } 
    catch (error) {
        console.log(error)
        res.status(400).json({
            message: "Something went wrong",
        })
    }
  })

  .put(async function(req,res){
    try {
      const updateArticle = await Article.updateOne({title: req.params.articleTitle},
        {$set: {title: req.body.title, content: req.body.content}},
        {overwrite: true})
        if(updateArticle){
            res.send("Successfully replaced the article")
        } 
        else{
          res.send("didnt replace")
        }
      }
    catch(error){
      console.log(error)
      res.status(400).json({
        message: "Something went wrong",
      })
    }
  })

  // .put(function (req, res) {
  //   Article.replaceOne(
  //     {title: req.params.articleTitle},
  //     {title: req.body.title, content: req.body.content},
  //     {overwrite: true})
  //     .then(function () {
  //       res.send("Succesfully updated article")
  //       })
  //       .catch(function (err) {
  //         res.send(err)
  //         })
    
  //   })

  .patch(function (req, res) {
    try {
      Article.updateOne(
        { title: req.params.articleTitle },
        { $set: req.body }
      ).then(function () {
        res.send("Successfully updated article")
      })
    } catch(err){
      res.send(err)
    }
  })

  .delete(function (req, res) {
    Article.deleteOne(
      { title: req.params.articleTitle },
      { $set: req.body }
    ).then((article) => {
      if (article) {
        res.send("Article deleted successfully")
      } else {
        res.send("Failed deleting the Article")
      }
    })
  })

app.listen(3000,function(){
    console.log("server started on 3000")
})