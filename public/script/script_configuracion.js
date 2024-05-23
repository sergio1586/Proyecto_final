document.addEventListener('DOMContentLoaded', function() {
    cargarDatosUsuario();
});

function cargarDatosUsuario() {
    $.ajax({
        type: 'GET',
        url: '/perfil',
        success: function(response) {
            $('#nombre').val(response.nombre);
            $('#apellidos').val(response.apellidos);
            $('#nickUsuario').val(response.username);
            
            // Asegúrate de que la fecha de nacimiento está en el formato correcto (YYYY-MM-DD)
            var fechaNacimiento = new Date(response.fechaNacimiento);
            var dia = ("0" + fechaNacimiento.getDate()).slice(-2);
            var mes = ("0" + (fechaNacimiento.getMonth() + 1)).slice(-2);
            var fechaFormateada = fechaNacimiento.getFullYear() + "-" + mes + "-" + dia;
            $('#fechaNacimiento').val(fechaFormateada);

            // Manejar etiquetas
            const etiquetas = response.etiquetas;
            for (const etiqueta in etiquetas) {
                if (etiquetas[etiqueta]) {
                    $(`.tag[data-tag=${etiqueta}]`).addClass('selected');
                }
            }
        },
        error: function(error) {
            console.error('Error al cargar los datos del usuario:', error);
        }
    });
}

function actualizarPerfil() {
    var nombre = $('#nombre').val();
    var apellidos = $('#apellidos').val();
    var fechaNacimiento = $('#fechaNacimiento').val();

    var etiquetasSeleccionadas = {
        landscape: false,
        retrato: false,
        macro: false,
        arquitectura: false,
        naturaleza: false
    };

    $('.tag.selected').each(function() {
        etiquetasSeleccionadas[$(this).data('tag')] = true;
    });

    var formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellidos', apellidos);
    formData.append('fechaNacimiento', fechaNacimiento);
    formData.append('etiquetas', JSON.stringify(etiquetasSeleccionadas));
    var imagenPerfil = $('#imagenPerfil')[0].files[0];
    if (imagenPerfil) {
        formData.append('imagenPerfil', imagenPerfil);
    }

    $.ajax({
        type: 'POST',
        url: '/actualizar-perfil',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            alert('Perfil actualizado correctamente');
            window.location.replace('/home');
        },
        error: function(error) {
            console.error('Error al actualizar el perfil:', error);
            alert('Error al actualizar el perfil');
        }
    });
}

$(document).ready(function() {
    $('.tag').click(function() {
        $(this).toggleClass('selected');
    });
});
