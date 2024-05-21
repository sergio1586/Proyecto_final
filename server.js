const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const server = require('http').Server(app);
const { conectarDB, Usuario } = require('./mongo');
const port = process.env.port || 3000;

//CONFIGURACIONES
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    secret: 'clave_mateo_sergio', 
    resave: false,
    saveUninitialized: true
}));

var auth = function(req, res, next){
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.sendStatus(401); // No autorizado
    }
}

// Configuración de Multer para imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const username = req.session.user;
        const userFolderPath = `public/images/${username}`;
        fs.mkdir(userFolderPath, { recursive: true }, (err) => {
            if (err) {
                console.error("Error al crear la carpeta del usuario:", err);
            }
            cb(null, userFolderPath);
        });
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

//FUNCIONES GET

app.get('/', (req, res) => {
    var contenido = fs.readFileSync('public/index.html');
    res.setHeader('Content-type', 'text/html');
    res.send(contenido);
});

app.get("/registro", (req, response) => {
    var contenido = fs.readFileSync("public/registro.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
});

app.get('/feed', auth, (req, res) => {
    var contenido = fs.readFileSync('public/feed.html', 'utf8');
    res.setHeader('Content-type', 'text/html');
    res.send(contenido);
});

app.get('/home', auth, (req, res) => {
    const username = req.session.user;
    if (username) {
        var contenido = fs.readFileSync('public/home.html', 'utf8');
        contenido = contenido.replace('</body>', `<script>var currentUser = "${username}";</script></body>`);
        res.setHeader('Content-type', 'text/html');
        res.send(contenido);
    } else {
        res.sendStatus(401);
    }
});

app.get('/imagenes-usuario', auth, async (req, res) => {
    try {
        const username = req.session.user;
        const usuario = await Usuario.findOne({ username });
        if (usuario) {
            const imagenesRelativas = usuario.publicaciones.map(publicacion => publicacion.imagePath.replace('public\\', ''));
            res.json({ imagenes: imagenesRelativas });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener las imágenes del usuario:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.get('/cargarFeed', auth, async (req, res) => {
    try {
        const usuarios = await Usuario.find({}, 'publicaciones username').exec();
        let publicaciones = [];

        usuarios.forEach(usuario => {
            usuario.publicaciones.forEach(publicacion => {
                const imagePath = publicacion.imagePath.replace(/^public[\\/]/, '');
                publicaciones.push({ 
                    username: usuario.username, 
                    imagePath: imagePath 
                });
            });
        });

        res.json({ publicaciones });
    } catch (error) {
        console.error('Error al obtener el feed:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

//FUNCIONES POST

app.post("/registrar", async function(req, res){
    console.log("Datos recibidos para registro: ", req.body);
    if (!req.body.username || !req.body.password || !req.body.nombre || !req.body.apellidos || !req.body.fechaNacimiento || !req.body.etiquetas) {
        res.send({"res":"register failed"});
    } else {
        try {
            const usuarioExistente = await Usuario.findOne({ username: req.body.username });
            if (usuarioExistente) {
                console.log("Ya existe un usuario con ese nombre");
                res.send({"res":"usuario ya existe"});
            } else {
                const nuevoUsuario = new Usuario({
                    nombre: req.body.nombre,
                    apellidos: req.body.apellidos,
                    username: req.body.username,
                    fechaNacimiento: req.body.fechaNacimiento,
                    password: req.body.password,
                    etiquetas: req.body.etiquetas
                });
                await nuevoUsuario.save();
                console.log("Nuevo usuario creado: ", nuevoUsuario);
                res.send({"res":"register true"});
            }
        } catch(err) {
            console.error("Error al crear usuario: ", err);
            res.send({"res":"register failed"});
        }
    }
});

app.post("/identificar", async function(req, res){
    if (!req.body.username || !req.body.password) {
        res.send({"res":"login failed"});
    } else {
        const usuarioEncontrado = await Usuario.findOne({ username: req.body.username, password: req.body.password });
        if (usuarioEncontrado) {
            req.session.user = req.body.username;
            req.session.userId = usuarioEncontrado._id;
            req.session.admin = true;
            return res.send({"res":"login true"});
        } else {
            res.send({"res":"usuario no válido"});
        }
    }
});

app.post('/upload', auth, upload.single('imagen'), async (req, res) => {
    try {
        const imagePath = req.file.path;
        const usuarioId = req.session.userId;
        
        const nuevaPublicacion = {
            imagePath: imagePath
        };
        
        await Usuario.findByIdAndUpdate(usuarioId, { $push: { publicaciones: nuevaPublicacion } });
        
        res.status(200).json({ message: 'Imagen subida correctamente', imagePath: imagePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al subir la imagen' });
    }
});

app.delete('/delete-photo/:photoId', auth, async (req, res) => {
    try {
        const usuarioId = req.session.userId;
        const photoId = req.params.photoId;
        
        const usuario = await Usuario.findById(usuarioId);
        const publicacion = usuario.publicaciones.id(photoId);
        
        if (publicacion) {
            const photoPath = publicacion.imagePath;
            
            usuario.publicaciones.id(photoId).remove();
            await usuario.save();
            
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
            
            res.status(200).json({ message: 'Foto eliminada correctamente' });
        } else {
            res.status(404).json({ message: 'Foto no encontrada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar la foto' });
    }
});

conectarDB();
server.listen(port, () => {
    console.log(`App escuchando en el puerto ${port}`);
});
