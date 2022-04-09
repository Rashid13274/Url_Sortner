const urlModel = require('../model/urlModel');
const validUrl = require('valid-url');
const shortid = require('shortid');
const redis=require('redis');

const {promisify}=require('util');

// connect  to redis
const redisClient=redis.createClient(
  11919,
  "redis-11919.c53.west-us.azure.cloud.redislabs.com",
  {no_ready_check:true}
);
redisClient.auth("GibQasgRVp6SQnVDgT3eW5xiS28g2mtw", function(err){
  if(err)throw err;
});
redisClient.on("connect",async function(){
console.log("connected to redis ....")
})
// connect to server 


//connections setup for redis
const SET_ASYNC=promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC=promisify(redisClient.GET).bind(redisClient);

//============================================================================================================================//
const postUrl = async(req, res)=>{
try {
  const longUrl = req.body.longUrl;
  const baseUrl ="http://localhost:3000";

// check url exist in body or not
if(!Object.keys(longUrl)){
    res.status(400).send({message:'plz put the url'});
}

// input Url is valid or not
var expression =  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
var regex = new RegExp(expression);
if(!longUrl.match(regex)){
    return res.status(401).send('Invalid input url !');
}

  // Check base url
  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).send('Invalid base url');
  }

  // Create url code
  const urlCode = shortid.generate().toLowerCase()

  
  let cachedProfileData=await GET_ASYNC(`${longUrl}`)

  if(cachedProfileData){
    // cache hit 
    res.status(200).send({status:true,message:'cached data',data:cachedProfileData});   
  }else{
    let url=await urlModel.findOne({longUrl}).select({longUrl : 1, urlCode : 1, shortUrl: 1, _id: 0});
    if (url) {
        res.status(200).send({status:true,data:url});
      } else {
        const shortUrl = baseUrl + '/' + urlCode;
        let urlCreate={urlCode:urlCode,longUrl,shortUrl:shortUrl}
        let urlNew=await urlModel.create(urlCreate);
         await SET_ASYNC(`${longUrl}`,JSON.stringify(urlNew))   

        return res.status(201).send({ status:true, message:'data created sucessfully',data:urlNew});
      }

   
  }

    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        }); 
    }
};


//=======================================================================================================//

const getUrl=async (req, res) => {
  try {
     
        let cahceUrlData = await GET_ASYNC(`${req.params.code}`)
        if (cahceUrlData) {
            return res.status(302).redirect(JSON.parse(cahceUrlData))
        } else {


          const url = await urlModel.findOne({ urlCode: req.params.code });
          if (url) {
            SET_ASYNC(`${req.params.code}`, JSON.stringify(url.longUrl))
            return res.redirect(url.longUrl);

          } else {
            return res.status(404).json('ivalid UrlCode !');
          }
              }

  } catch (err) {
    console.error(err);
    res.status(500).json('Server error !');
  }
};
//===================================================================================================================//
//Caching

// use the commands

// const createUrl=async function(req,res){
//   let data =req.body;
//   let newUrlCreated=await urlModel.create(data);
//   res.send({data:newUrlCreated});
// }

// const fetchUrl=async function(req,res){
//  let cachedProfileData=await GET_ASYNC(`${req.params.code}`)

//   if(cachedProfileData){
//     res.send({cachedProfileData})   let cachedProfileData=await GET_ASYNC(`${req.params.code}`)

//   if(cachedProfileData){
//     res.send({cachedProfileData})   // cache hit 
//   }else{
//     let profile=await urlModel.findById(req.params.code);    // cache miss
//     await SET_ASYNC(`${req.params.code}`,JSON.stringify(profile))
//     res.send({data:profile});
//   }
// }




//==========================================================================================================//



// async function getRepos(req, res, next) {
//   try {
//       console.log('Fetch data')
//       const { urlCode } = req.params
//       const response = await fetch(`http://localhost:3000/${urlCode}`)
//       const data = await response.json()
//       const repos = await urlModel.findOne({longUrl})

//       client.setex(urlCode, 3600, repos)
//       res.send(setResponse(urlCode, repos))
//   } catch (error) {
//       res.status(500)
//   }
// }

// function cache(req, res, next) {
//   const {username } = req.params

//   client.get(username, (err, data) => {
//       if(err) throw err

//       if(data !== null){
//           res.send(setResponse(username, data))
//       }else{
//           next()
//       }
//   })
// }

// app.get('/repos/:username', cache, getRepos)

// app.listen(5000, () => {
//   console.log(`listening on port ${PORT}`)
// })

























module.exports = 
{
  postUrl,
  getUrl
}
