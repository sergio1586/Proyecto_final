const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path'); 
var port = process.env.port || 3000;
var cookieParser = require('cookie-parser');
var session = require('express-session');
const app = express();
var server = require('http').Server(app);
const { conectarDB, Usuario, Image } = require('./mongo');
//const storage = multer.memoryStorage();
//const upload = multer({ storage: storage });

//CONFIGURACIONES
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    secret: 'clave_mateo_sergio', 
    resave: false,
    saveUninitialized: true
    /*cookie: { secure: false } // Cambia a true si usas HTTPS en producción*/
}));
var auth = function(req, res, next){
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.sendStatus(401); // No autorizado
    }
}
// Configuración imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        
        const username = req.session.user; 
        const userFolderPath = `public/images/${username}`; // Carpeta específica para el usuario
        fs.mkdir(userFolderPath, { recursive: true }, (err) => { // Crea la carpeta del usuario si no existe
            if (err) {
                console.error("Error al crear la carpeta del usuario:", err);
            }
            cb(null, userFolderPath);
        });
    },
    filename: function (req, file, cb) {
        // Nombre de archivo personalizado (puedes usar cualquier lógica aquí)
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
app.get("/registro", (req,response)=> {
    var contenido = fs.readFileSync("public/registro.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
});

app.get('/home', auth, (req, res) => {
    const username = req.session.user; // Obtiene el nombre de usuario de la sesión
    if (username) {
        var contenido = fs.readFileSync('public/home.html', 'utf8');
        // Insertar un script al final del body que defina una variable global con el nombre de usuario
        contenido = contenido.replace('</body>', `<script>var currentUser = "${username}";</script></body>`);
        res.setHeader('Content-type', 'text/html');
        res.send(contenido);
    } else {
        res.sendStatus(401); // Si no hay usuario en la sesión, responde con un estado no autorizado
    }
});

app.get('/imagenes-usuario', async (req, res) => {
    try {
        const username = req.session.user; // Obtén el nombre de usuario de la sesión
        // Busca el usuario en la base de datos por su nombre de usuario
        const usuario = await Usuario.findOne({ username });
        if (usuario) {
            // Si se encuentra el usuario, devuelve las rutas relativas de las imágenes
            const imagenesRelativas = usuario.publicaciones.map(ruta => ruta.replace('public\\', ''));
            res.json({ imagenes: imagenesRelativas });
        } else {
            // Si no se encuentra el usuario, devuelve un mensaje de error
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        // Maneja cualquier error
        console.error('Error al obtener las imágenes del usuario:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});


//FUNCIONES POST

//Registrar en Bdd
app.post("/registrar", async function(req, res){
    console.log("Datos recibidos para registro: ", req.body);
    if(!req.body.username || !req.body.password || !req.body.nombre || !req.body.apellidos || !req.body.fechaNacimiento || !req.body.etiquetas){
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


//Identificación
app.post("/identificar", async function(req, res){
    if(!req.body.username || !req.body.password){//Si un campo no esta rellenado esto evita problemas en el servidor
            res.send({"res":"login failed"});
    }else {
        const usuarioEncontrado=await Usuario.findOne({username:req.body.username}, {password:req.body.password});
            if(usuarioEncontrado){
                req.session.user = req.body.username;
                req.session.userId = usuarioEncontrado._id; // Almacenamos el ID del usuario en la sesión
                req.session.admin = true;
                return res.send({"res":"login true"});
            }else{
        res.send({"res":"usuario no válido"});
            }
    }
});
//Gestión imágenes
app.post('/upload', auth, upload.single('imagen'), async (req, res) => {
    try {
        // Obtenemos la ruta de la imagen cargada
        const imagePath = req.file.path;

        // Obtenemos el ID del usuario que ha iniciado sesión
        const usuarioId = req.session.userId;

        // Actualizamos la base de datos con la URL de la imagen
        await Usuario.findByIdAndUpdate(usuarioId, { $push: { publicaciones: imagePath } });

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

        // Elimina la foto de la base de datos
        await Usuario.findByIdAndUpdate(usuarioId, { $pull: { publicaciones: photoId } });

        // Obtiene la ruta de la foto a eliminar
        const photoPath = path.join(__dirname, 'public', 'images', photoId);

        // Verifica si el archivo existe antes de intentar eliminarlo
        if (fs.existsSync(photoPath)) {
            // Elimina la foto físicamente del sistema de archivos
            fs.unlinkSync(photoPath);
        }

        res.status(200).json({ message: 'Foto eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar la foto' });
    }
});

conectarDB();
server.listen(port, () => {
    console.log(`App escuchando en el puerto ${port}`);
});
/*
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
});*/
/*
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
            _id: photo._id,
            imageName: photo.imageName,
            imageUrl: `data:image/jpeg;base64,${photo.imageData}`
        }));

        res.json(fotos);
    } catch (err) {
        console.error('Error obteniendo las fotos del usuario:', err);
        res.status(500).send('Error interno del servidor');
    }
});

app.delete('/borrar-foto/:id', async (req, res) => {
    try {
        const fotoId = req.params.id;
        const image = await Image.findByIdAndDelete(fotoId);

        if (!image) {
            return res.status(404).send('Imagen no encontrada');
        }

        // Eliminar la referencia de la imagen en todos los usuarios
        await User.updateMany({ photos: fotoId }, { $pull: { photos: fotoId } });

        res.send('Imagen borrada correctamente');
    } catch (err) {
        console.error('Error borrando la imagen:', err);
        res.status(500).send('Error al borrar la imagen');
    }
});*/