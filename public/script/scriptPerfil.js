document.addEventListener('DOMContentLoaded', function() {
    if (typeof currentUser !== 'undefined') {
        const nick_usuario = document.getElementById('nick_usuario');
        nick_usuario.innerHTML = `${currentUser}`;
        cargarPerfil(); // Cargar datos del perfil del usuario
        cargarImagenesUsuario();
    }
});

function cargarPerfil() {
    $.ajax({
        type: 'GET',
        url: '/perfil',
        success: function (response) {
            if (response) {
                $('#nick_usuario').text(response.username);
                $('#publicaciones').text(`${response.publicaciones} publicaciones`);
                $('#seguidores').text(`${response.seguidores} seguidores`);
                $('#seguidos').text(`${response.seguidos} seguidos`);
                if (response.imagenPerfil) {
                    $('#fotoperfil').attr('src', response.imagenPerfil);
                } else {
                    $('#fotoperfil').attr('src', 'images/default-profile.png'); // Imagen de perfil predeterminada
                }
            } else {
                console.error('Error al cargar el perfil del usuario.');
            }
        },
        error: function (error) {
            console.error('Error al cargar el perfil del usuario:', error);
        }
    });
}

function subirImagen() {
    const fileInput = document.getElementById('inputImagen');
    const formData = new FormData();
    formData.append('imagen', fileInput.files[0]);

    $.ajax({
        type: 'POST',
        url: '/upload', 
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            console.log('Imagen subida correctamente');
            console.log('Ruta de la imagen:', response.imagePath);
            alert('Imagen subida correctamente');

            // Cerrar el modal después de la subida exitosa
            $('#uploadModal').modal('hide'); 
            cargarImagenesUsuario();
            cargarPerfil(); // Actualizar datos del perfil después de subir la imagen
        },
        error: function (error) {
            console.error('Error al subir la imagen:', error);
        }
    });
}

function eliminarFoto(photoId) {
    $.ajax({
        type: "DELETE",
        url: `/delete-photo/${photoId}`,
        success: function(response) {
            console.log(response.message);
            cargarImagenesUsuario();
            cargarPerfil(); // Actualizar datos del perfil después de eliminar la imagen
        },
        error: function(error) {
            console.error('Error al eliminar la foto:', error);
        }
    });
}

function cargarImagenesUsuario() {
    $.ajax({
        type: 'GET',
        url: '/imagenes-usuario', 
        success: function (response) {
            if (response && response.imagenes && response.imagenes.length > 0) {
                var galeria = $('#galeria'); // Selecciona el contenedor con jQuery
                galeria.empty(); // Limpia el contenido existente

                $.each(response.imagenes, function(index, ruta) {
                    const imgContainer = $('<div>', {
                        'class': 'image-container', // Añade clase para estilo
                        'style': 'position: relative; display: inline-block;'
                    });
                    var imgElement = $('<img>', { // Crea un elemento imagen con jQuery
                        src: ruta, // Establece el atributo src
                        'class': 'galeria-img', // Añade la clase para estilos
                        'click': function() { // Manejador de clic para abrir el modal
                            $('#modalImage').attr('src', ruta);
                            var modalDialog = $('#imageModal .modal-dialog');
                            var img = new Image();
                            img.src = ruta;
                            img.onload = function() {
                                var imgWidth = img.width;
                                var imgHeight = img.height;
                                var viewportWidth = $(window).width();
                                var viewportHeight = $(window).height();
                                var maxWidth = Math.min(imgWidth, viewportWidth * 0.8);
                                var maxHeight = Math.min(imgHeight, viewportHeight * 0.8);
                                if (imgHeight > imgWidth) {
                                    modalDialog.css({
                                        'width': 'auto',
                                        'max-width': maxWidth + 'px',
                                        'height': 'auto',
                                        'max-height': maxHeight + 'px',
                                        'margin': 'auto'
                                    });
                                } else {
                                    modalDialog.css({
                                        'width': maxWidth + 'px',
                                        'height': maxHeight + 'px',
                                        'margin': 'auto'
                                    });
                                }
                                $('#imageModal').modal('show'); // Muestra el modal
                            };
                        }
                    });
                    imgContainer.append(imgElement);
                    galeria.append(imgContainer); // Añade el elemento imagen al contenedor
                    console.log(imgElement); // Muestra en consola el elemento imagen creado
                });

            } else {
                console.log('El usuario no tiene imágenes.');
            }
        },
        error: function (error) {
            console.error('Error al cargar las imágenes del usuario:', error);
        }
    });
}

function seguirUsuario(username) {
    $.ajax({
        type: 'POST',
        url: '/seguir',
        data: JSON.stringify({ username: username }),
        contentType: 'application/json',
        success: function(response) {
            alert(response.message);
            cargarPerfil(); // Actualizar datos del perfil después de seguir a un usuario
        },
        error: function(error) {
            if (error.responseJSON && error.responseJSON.message) {
                alert(error.responseJSON.message);
            } else {
                console.error('Error al seguir al usuario:', error);
            }
        }
    });
}

function dejarDeSeguirUsuario(username) {
    $.ajax({
        type: 'POST',
        url: '/dejar-de-seguir',
        data: JSON.stringify({ username: username }),
        contentType: 'application/json',
        success: function(response) {
            alert(response.message);
            cargarPerfil(); // Actualizar datos del perfil después de dejar de seguir a un usuario
        },
        error: function(error) {
            if (error.responseJSON && error.responseJSON.message) {
                alert(error.responseJSON.message);
            } else {
                console.error('Error al dejar de seguir al usuario:', error);
            }
        }
    });
}
