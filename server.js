const express=require('express');
const fs=require('fs');
const multer=require('multer');
var port=process.env.port||3000;
var cookieParser=require('cookie-parser');
var session=require('express-session');
const app=express();
var server=require('http').Server(app);
const { conectarDB, User ,Image} = require('./mongo');
const { error } = require('console');
const storage=multer.memoryStorage();
const upload=multer({storage:storage});


app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    secret: 'clave_mateo_sergio', // Define una clave secreta para la sesión
    resave: false,
    saveUninitialized: true
}));
conectarDB().then(async()=>{
    const usuarioExistente=await User.findOne({username:'sergio'});
    if(!usuarioExistente){
        const newUser=new User({
            username:'sergio',
            password:'12345',
            photos:[]
        });
        await newUser.save();
        console.log('Usuario sergio creado');
    }else{
        console.log('Usuario ya existe');
    }
});
app.get('/',(req,res)=>{
    var contenido=fs.readFileSync('public/index.html');
    res.setHeader('Content-type','text/html');
    res.send(contenido);
})
app.post('/upload/:username', upload.single('fileToUpload'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Archivo no subido');
    }

    try {
        // Convertir la imagen a Base64
        const imgBase64 = req.file.buffer.toString('base64');

        // Crear una nueva imagen en la base de datos
        const newImage = new Image({
            imageName: req.file.originalname,
            imageData: imgBase64
        });
        const savedImage = await newImage.save();

        // Encontrar el usuario por nombre y añadir la referencia de la imagen
        const updatedUser = await User.findOneAndUpdate(
            { username: req.params.username }, // Usar el nombre de usuario para buscar
            { $push: { photos: savedImage._id } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send('Usuario no encontrado');
        }

        res.send('Imagen cargada correctamente y asociada al usuario!');
    } catch (err) {
        console.error('Error subiendo la imagen:', err);
        res.status(500).send('Error al cargar la imagen');
    }
});
app.get('/fotos/:username', async (req, res) => {
    try {
        // Buscar el usuario por nombre y poblar sus fotos
        const usuario = await User.findOne({ username: req.params.username })
                                    .populate('photos');

        if (!usuario) {
            return res.status(404).send('Usuario no encontrado');
        }

        // Extraer solo la data de las imágenes para simplificar la respuesta
        const fotos = usuario.photos.map(photo => {
            return {
                imageName: photo.imageName,
                imageUrl: `data:image/jpeg;base64,${photo.imageData}`
            };
        });

        res.json(fotos);
    } catch (err) {
        console.error('Error obteniendo las fotos del usuario:', err);
        res.status(500).send('Error interno del servidor');
    }
});


server.listen(port,()=>{
    console.log('App escuchando en el puerto 3000');
});