// public/js/home.js
document.addEventListener('DOMContentLoaded', function() {
    if (typeof currentUser !== 'undefined') {
        const nick_usuario = document.getElementById('nick_usuario');
        nick_usuario.innerHTML = `${currentUser}`;
        cargarImagenesUsuario();
    }
});

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
