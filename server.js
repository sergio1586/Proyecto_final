const express=require('express');
const fs=require('fs');
var port=process.env.port||3000;
var cookieParser=require('cookie-parser');
var session=require('express-session');
const app=express();
var server=require('http').Server(app);
const { conectarDB, User } = require('./mongo');

app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    secret: 'clave_mateo_sergio', // Define una clave secreta para la sesión
    resave: false,
    saveUninitialized: true
}));
conectarDB();
app.get('/',(req,res)=>{
    var contenido=fs.readFileSync('public/index.html');
    res.setHeader('Content-type','text/html');
    res.send(contenido);
})

server.listen(port,()=>{
    console.log('App escuchando en el puerto 3000');
});