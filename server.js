const bodyParser = require('body-parser');
const express=require('express')
const app=express()
const bodyparser=require('body-parser')
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config()
const nodemailer=require('nodemailer')
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.set('view engine','ejs')
app.use(express.static('views'))
const proxy = 'http://172.16.2.11:3128'
const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);
app.get('/',(req,res)=>{
  res.render('../views/home')
})
app.get('/home',(req,res)=>{
  res.render('../views/home')
})
app.get('/about',(req,res)=>{
  res.render('../views/about')
})
app.get('/contact',(req,res)=>{
  res.render('../views/contact')
})
app.post('/contact',(req,res)=>{
    const sender_name=req.body.sender_mail
    const bugs_rev=req.body.review
    var transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS_KEY
      },
      proxy:proxy
    });

    const mailOptions ={
      from : sender_name,
      to :"someone@gmail.com",
      subject :'just for fun',
      text: bugs_rev
    };

    transport.sendMail(mailOptions,function(err,info){
      if(err){
        console.log('Error')
      }
      else{
        res.render('../views/contact',{rev:'Email Sent'})
        console.log('Sent'+info.response)
      }
    });
})
app.get('/generate',(req,res)=>{
  res.render('../views/generate')
})
app.post('/generate', async(req,res)=>{
  const response =  await openai.createImage({
    prompt: req.body.image_name,
    n: 1,
    size: "512x512",
    proxy:proxy
  });
  var image_url = response.data.data[0].url;
  res.render('../views/generate',{image_url:image_url})
})
app.get('/chat',(req,res)=>{  
  res.render('../views/chat')
})
app.post('/chat',async (req,res)=>{
  const query=req.body.chat_text
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role: "user", content:query}],
    proxy:proxy
  });
  var info=completion.data.choices[0].message.content;
  res.render('../views/chat',{info:info})
})
app.listen(3000,function(err){
  if(!err){
    console.log('running on http://localhost:3000')
  }
  else{
    console.log('error')
  }
})