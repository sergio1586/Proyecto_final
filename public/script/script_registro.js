function registrarUsuario() {
    // Capturar los valores del formulario
    var nombre = document.getElementById("nombre").value;
    var apellidos = document.getElementById("apellidos").value;
    var usuario = document.getElementById("nickUsuario").value;
    var fechaNacimiento = document.getElementById("fechaNacimiento").value;
    var contraseña = document.getElementById("contraseña").value;
    var repetirContraseña = document.getElementById("repetirContraseña").value;
    
    // Construir el objeto de etiquetas seleccionadas
    var etiquetasSeleccionadas = {
        landscape: false,
        retrato: false,
        macro: false,
        arquitectura: false,
        naturaleza: false
    };
    
    // Marcar las etiquetas seleccionadas como true en el objeto
    $('.tag.selected').each(function() {
        etiquetasSeleccionadas[$(this).data('tag')] = true;
    });
    
    // Hacer la petición al servidor
    var promise = $.ajax({
        type: "POST",
        url: "/registrar",
        // Datos a enviar al servidor
        data: JSON.stringify({
            nombre: nombre,
            apellidos: apellidos,
            username: usuario,
            fechaNacimiento: fechaNacimiento,
            password: contraseña,
            etiquetas: etiquetasSeleccionadas
        }),
        contentType: "application/json;charset=UTF-8",
        dataType: "json"
    });
    
    // Tratar la respuesta del servidor
    promise.always(function(data) {
        if (data.res == "register true") {
            document.cookie = "usuario=" + data.res.user;
            document.cookie = "contraseña=" + data.res.password;
            window.location.replace("/");
        } else if (data.res == "usuario ya existe") {
            alert("El usuario ya existe");
        } else if (data.res == "register failed") {
            alert("Debes introducir todos los campos correctamente");
        } else {
            alert("Error desconocido");
        }
    });
}

$(document).ready(function() {
    // Manejar clics en las etiquetas
    $('.tag').click(function() {
        $(this).toggleClass('selected');
    });
});
