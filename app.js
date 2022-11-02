import express from "express";
const app = express();
import got from "got";
import bodyParser from "body-parser"; 
import {Configuration,OpenAIApi} from "openai"; 
import * as dotenv from "dotenv";
dotenv.config();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get("/", function(req,res){
    res.render("home");
});
app.get("/moderation", function(req,res){
    res.render("moderation");
});
app.get("/completion", function(req,res){
    res.render("completion");
});
app.get("/edits", function(req,res){
    res.render("edits");
});
app.post("/completion",function(req,res){
    const prompt = req.body.question;
    console.log(prompt);
    (async () => {
        const url = 'https://api.openai.com/v1/engines/davinci/completions';
        const params = {
          "prompt": prompt,
          "max_tokens": 160,
          "temperature": 0.7,
          "frequency_penalty": 0.5
        };
        const headers = {
          'Authorization': `Bearer ${process.env.API_KEY}`,
        };
      
        try {
          const response = await got.post(url, { json: params, headers: headers }).json();
          const output = `${prompt}${response.choices[0].text}`;
          // console.log(output);
          res.render("completionoutput", {posts: output});
        } catch (err) {
          console.log(err);
        }
      })();
      
})

  app.post("/moderation", function(req,res){
    (async () => {
      const question= req.body.question;
      const configuration = new Configuration({
      apiKey: process.env.API_KEY,
      });
      const openai = new OpenAIApi(configuration);
      const response = await openai.createModeration({
      input: question,
        });
      const newData = response.data.results[0];
      const hate = (newData.categories.hate)|| false;
      const hate_threat = (newData.categories["hate/threatening"])||false;
      const self_harm = (newData.categories["self-harm"])||false;
      const sexual =(newData.categories.sexual)||false;
      const sexual_min = (newData.categories["sexual/minors"])||false
      const violence = (newData.categories.violence)||false;
      const violence_graphics =( newData.categories["violence/graphic"])||false;
      const hate1 = (newData.category_scores.hate)|| false;
      const hate_threat1 = (newData.category_scores["hate/threatening"])||false;
      const self_harm1 = (newData.category_scores["self-harm"])||false;
      const sexual1 =(newData.category_scores.sexual)||false;
      const sexual_min1 = (newData.category_scores["sexual/minors"])||false
      const violence1 = (newData.category_scores.violence)||false;
      const violence_graphics1 =( newData.category_scores["violence/graphic"])||false;
      res.render("output", {hate:hate,hate_threat:hate_threat,self_harm:self_harm,sexual:sexual,sexual_min:sexual_min,violence:violence,violence_graphics:violence_graphics,
        hate1:hate1,hate_threat1:hate_threat1,self_harm1:self_harm1,sexual1:sexual1,sexual_min1:sexual_min1,violence1:violence1,violence_graphics1:violence_graphics1});
    })();
  });
  app.post("/edits", function(req,res){
      
    (async () => {
      const question = req.body.question;
            const response = await openai.createEdit({
              model: "text-davinci-edit-001",
              input: question,
              instruction: "Fix the spelling mistakes",
            });
            const Text = response.data.choices[0].text;
            res.render("outputedits", {posts: Text});
          })();
  });
app.listen(3000,function(){
    console.log("Server is running at port 3000.");
});