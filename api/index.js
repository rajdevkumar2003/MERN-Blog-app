const express = require('express');
const cors= require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const app = express();
const fs= require('fs');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer  = require('multer');
//const { executionAsyncId } = require('async_hooks');
const uploadMiddleware = multer({ dest: 'uploads/' })

const salt = bcrypt.genSaltSync(10);
//const hash = bcrypt.hashSync("B4c0/\/", salt);
const secret='asugdu6q3i778#$12gfdty5r6eythgdt4r78y'


app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));
//app.options('*', cors()); // this enables preflight
//app.use(express.urlencoded());


mongoose.connect('mongodb+srv://rajeevkumarjbo2003:51L8hZjgjroecKqn@cluster0.9w0irtv.mongodb.net/?retryWrites=true&w=majority');

app.post('/register', async(req,res) => {
    const {username,password} = req.body;
    try {
      const userDoc=await User.create({username,password:bcrypt.hashSync(password,salt),});
    res.json(userDoc);
    } catch (e) {
      res.status(404).json(e);
    }
  });

  app.post('/login', async (req,res) => {
    const {username,password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      // logged in
      jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token).json({
          id:userDoc._id,
          username,
        });
      });
    } else {
      res.status(400).json('wrong credentials');
    }
  });

  app.get('/profile', (req,res) => {
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err,info) => {
      if (err) throw err;
      res.json(info);
    });
  });

  app.post('/logout', (req,res) => {
    res.cookie('token', '').json('ok');
  });

  
  
  app.post('/post', uploadMiddleware.single('file'), async (req,res) => {

    try {
      const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
      if (err) throw err;
      const {title,summary,content} = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover:newPath,
        author:info.id,
      });
      res.json(postDoc);
    });
    } catch (error) {
      throw new Error;
    }
    
  
  });


  app.put('/post',uploadMiddleware.single('file'),  (req,res) => {
    let newPath = null;
    if (req.file) {
      const {originalname,path} = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = path+'.'+ext;
      fs.renameSync(path, newPath);
    }
  
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
      if (err) throw err;
      const {id,title,summary,content} = req.body;
      const postDoc = await Post.findById(id);
      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(400).json('you are not the author');
      }
      await postDoc.update({
        title,
        summary,
        content,
        cover: newPath ? newPath : postDoc.cover,
      });
  
      res.json(postDoc);
    });
  
  });

  app.get('/post', async (req,res) => {
    res.json(
      await Post.find()
        .populate('author', ['username'])
        .sort({createdAt: -1})
        .limit(20)
    );
  });

  app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
  })
  

app.listen(4000);
//51L8hZjgjroecKqn

//mongodb+srv://rajeevkumarjbo2003:<password>@cluster0.9w0irtv.mongodb.net/?retryWrites=true&w=majority

//mb cnctd data snt to server models ans schema cmpltd


//todo:create new post