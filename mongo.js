const mongoose = require("mongoose");

// URI de conexión a MongoDB
const mongoDBURI = "mongodb+srv://sergio1586:mtnjlqNeyzOg7mdO@cluster0.s7g0oqn.mongodb.net/myDatabaseName";

// Esquema para el usuario
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    photos: [{
        type: String
    }]
});

// Modelo basado en el esquema
const User = mongoose.model('User', userSchema);

// Función para conectar a MongoDB
const conectarDB = async () => {
    try {
        await mongoose.connect(mongoDBURI);
        console.log("Conectado a MongoDB");
    } catch (err) {
        console.error("Error al conectar a MongoDB:", err);
        process.exit(1); // Detiene la aplicación en caso de error
    }
};

// Exportar el modelo y la función de conexión
module.exports = { conectarDB, User };

