const express=require('express');

const fs=express('fs');
var port=process.env.port||3000;
var cookieParser=require('cookie-parser');
var session=require('express-session');
const app=express();
var server=require('http').Server(app);


server.listen(port,()=>{
    console.log('App escuchando en el puerto 3000');
});