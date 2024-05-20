const mongoose = require("mongoose");

// URI de conexión a MongoDB
const mongoDBURI = "mongodb+srv://sergio1586:mtnjlqNeyzOg7mdO@cluster0.s7g0oqn.mongodb.net/myDatabaseName";

const usuarioSchema = new mongoose.Schema({
    nombre: String,
    apellidos: String,
    username: String,
    fechaNacimiento: Date,
    password: String,
    seguidores: String,
    seguidos: String,
    etiquetas: { type: Object, default: {} }, // Etiquetas como arreglo de cadenas
    imagenPerfil: String,
    publicaciones: [String]
});
// Modelo basado en el esquema
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Función para conectar a MongoDB
const conectarDB = async () => {
    try {
        await mongoose.connect(mongoDBURI, {});
        console.log("Conectado a MongoDB");
    } catch (err) {
        console.error("Error al conectar a MongoDB:", err);
        process.exit(1); // Detiene la aplicación en caso de error
    }
};

// Exportar el modelo y la función de conexión
module.exports = { Usuario, conectarDB };
