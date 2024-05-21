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
                    _id: publicacion._id,
                    username: usuario.username,
                    imagePath: imagePath,
                    meGustas: publicacion.meGustas,
                    comentarios: publicacion.comentarios
                });
            });
        });

        res.json({ publicaciones });
    } catch (error) {
        console.error('Error al obtener el feed:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Ruta para obtener la información del perfil del usuario
app.get('/perfil', auth, async (req, res) => {
    try {
        const usuarioId = req.session.userId;
        const usuario = await Usuario.findById(usuarioId);

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({
            nombre: usuario.nombre,
            apellidos: usuario.apellidos,
            username: usuario.username,
            seguidores: usuario.seguidores.length,
            seguidos: usuario.seguidos.length,
            publicaciones: usuario.publicaciones.length,
            imagenPerfil: usuario.imagenPerfil
        });
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
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
// Ruta para seguir a un usuario
app.post('/seguir', auth, async (req, res) => {
    try {
        const usuarioId = req.session.userId;
        const seguirUsername = req.body.username; // Nombre de usuario a seguir

        const usuario = await Usuario.findById(usuarioId);
        const usuarioASeguir = await Usuario.findOne({ username: seguirUsername });

        if (!usuarioASeguir) {
            return res.status(404).json({ message: 'Usuario a seguir no encontrado' });
        }

        // Verificar si ya sigue al usuario
        if (usuario.seguidos.includes(usuarioASeguir.username)) {
            return res.status(400).json({ message: 'Ya sigues a este usuario' });
        }

        // Añadir el usuario a la lista de seguidos
        usuario.seguidos.push(usuarioASeguir.username);
        // Añadir este usuario a la lista de seguidores del usuario a seguir
        usuarioASeguir.seguidores.push(usuario.username);

        await usuario.save();
        await usuarioASeguir.save();

        res.status(200).json({ message: 'Usuario seguido correctamente' });
    } catch (error) {
        console.error('Error al seguir al usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Ruta para dejar de seguir a un usuario
app.post('/dejar-de-seguir', auth, async (req, res) => {
    try {
        const usuarioId = req.session.userId;
        const dejarDeSeguirUsername = req.body.username; // Nombre de usuario a dejar de seguir

        const usuario = await Usuario.findById(usuarioId);
        const usuarioADejarDeSeguir = await Usuario.findOne({ username: dejarDeSeguirUsername });

        if (!usuarioADejarDeSeguir) {
            return res.status(404).json({ message: 'Usuario a dejar de seguir no encontrado' });
        }

        // Verificar si no sigue al usuario
        if (!usuario.seguidos.includes(usuarioADejarDeSeguir.username)) {
            return res.status(400).json({ message: 'No sigues a este usuario' });
        }

        // Eliminar el usuario de la lista de seguidos
        usuario.seguidos = usuario.seguidos.filter(username => username !== usuarioADejarDeSeguir.username);
        // Eliminar este usuario de la lista de seguidores del usuario a dejar de seguir
        usuarioADejarDeSeguir.seguidores = usuarioADejarDeSeguir.seguidores.filter(username => username !== usuario.username);

        await usuario.save();
        await usuarioADejarDeSeguir.save();

        res.status(200).json({ message: 'Usuario dejado de seguir correctamente' });
    } catch (error) {
        console.error('Error al dejar de seguir al usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});
// Ruta para añadir un comentario a una publicación
app.post('/comentario', auth, async (req, res) => {
    try {
        const { publicacionId, texto } = req.body;
        const usuarioId = req.session.userId;

        const usuario = await Usuario.findById(usuarioId);
        const publicacion = usuario.publicaciones.id(publicacionId);

        if (!publicacion) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }

        publicacion.comentarios.push({
            usuario: usuario.username,
            texto: texto,
            fecha: new Date()
        });

        await usuario.save();

        res.status(200).json({ message: 'Comentario añadido correctamente' });
    } catch (error) {
        console.error('Error al añadir comentario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Ruta para añadir un "me gusta" a una publicación
app.post('/me-gusta', auth, async (req, res) => {
    try {
        const { publicacionId } = req.body;
        const usuarioId = req.session.userId;

        const usuario = await Usuario.findById(usuarioId);
        const publicacion = usuario.publicaciones.id(publicacionId);

        if (!publicacion) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }

        publicacion.meGustas += 1;

        await usuario.save();

        res.status(200).json({ message: 'Me gusta añadido correctamente' });
    } catch (error) {
        console.error('Error al añadir "me gusta":', error);
        res.status(500).json({ message: 'Error del servidor' });
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
