const express = require('express');
const fs = require('fs');
const multer = require('multer');
var port = process.env.port || 3000;
var cookieParser = require('cookie-parser');
var session = require('express-session');
const app = express();
var server = require('http').Server(app);
const { conectarDB, User, Image } = require('./mongo');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    secret: 'clave_mateo_sergio', // Define una clave secreta para la sesión
    resave: false,
    saveUninitialized: true
}));

conectarDB().then(async () => {
    const usuarioExistente = await User.findOne({ username: 'sergio' });
    if (!usuarioExistente) {
        const newUser = new User({
            username: 'sergio',
            password: '12345',
            photos: [],
            followers: [],
            following: []
        });
        await newUser.save();
        console.log('Usuario sergio creado');
    } else {
        console.log('Usuario ya existe');
    }
});

app.get('/', (req, res) => {
    var contenido = fs.readFileSync('public/index.html');
    res.setHeader('Content-type', 'text/html');
    res.send(contenido);
});

app.get('/perfil', (req, res) => {
    const username = req.query.username;
    var contenido = fs.readFileSync('public/perfil.html', 'utf8');
    contenido = contenido.replace('@username', username);
    res.setHeader('Content-type', 'text/html');
    res.send(contenido);
});

app.post('/upload/:username', upload.single('fileToUpload'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Archivo no subido');
    }

    try {
        const imgBase64 = req.file.buffer.toString('base64');
        const newImage = new Image({
            imageName: req.file.originalname,
            imageData: imgBase64
        });
        const savedImage = await newImage.save();
        const updatedUser = await User.findOneAndUpdate(
            { username: req.params.username },
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
        const usuario = await User.findOne({ username: req.params.username }).populate('photos');

        if (!usuario) {
            return res.status(404).send('Usuario no encontrado');
        }

        const fotos = usuario.photos.map(photo => ({
            imageName: photo.imageName,
            imageUrl: `data:image/jpeg;base64,${photo.imageData}`
        }));

        res.json(fotos);
    } catch (err) {
        console.error('Error obteniendo las fotos del usuario:', err);
        res.status(500).send('Error interno del servidor');
    }
});

// Ruta para seguir a un usuario
app.post('/follow', async (req, res) => {
    const { followerUsername, followingUsername } = req.body;
    try {
        const follower = await User.findOne({ username: followerUsername });
        const following = await User.findOne({ username: followingUsername });

        if (!follower || !following) {
            return res.status(404).send('Usuario no encontrado');
        }

        // Agregar la referencia de seguimiento
        if (!follower.following.includes(following._id)) {
            follower.following.push(following._id);
            await follower.save();
        }
        if (!following.followers.includes(follower._id)) {
            following.followers.push(follower._id);
            await following.save();
        }

        res.send('Usuario seguido correctamente!');
    } catch (err) {
        console.error('Error siguiendo al usuario:', err);
        res.status(500).send('Error al seguir al usuario');
    }
});

// Ruta para dejar de seguir a un usuario
app.post('/unfollow', async (req, res) => {
    const { followerUsername, followingUsername } = req.body;
    try {
        const follower = await User.findOne({ username: followerUsername });
        const following = await User.findOne({ username: followingUsername });

        if (!follower || !following) {
            return res.status(404).send('Usuario no encontrado');
        }

        // Remover la referencia de seguimiento
        follower.following = follower.following.filter(followId => !followId.equals(following._id));
        await follower.save();

        following.followers = following.followers.filter(followId => !followId.equals(follower._id));
        await following.save();

        res.send('Usuario dejado de seguir correctamente!');
    } catch (err) {
        console.error('Error dejando de seguir al usuario:', err);
        res.status(500).send('Error al dejar de seguir al usuario');
    }
});


server.listen(port, () => {
    console.log(`App escuchando en el puerto ${port}`);
});
