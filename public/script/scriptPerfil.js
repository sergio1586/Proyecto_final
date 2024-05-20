// public/js/home.js
document.addEventListener('DOMContentLoaded', function() {
    if (typeof currentUser !== 'undefined') {
  // ${currentUser}`;
  
  const nick_usuario = document.getElementById('nick_usuario');
  nick_usuario.innerHTML = `${currentUser}`;
  cargarImagenesUsuario();
    }
});
function subirImagen() {
    const fileInput = document.getElementById('inputImagen');
    const formData = new FormData();
    formData.append('imagen', fileInput.files[0]);

   
    formData.append('usuarioId', `${currentUser}`); 

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


/*

$(document).ready(function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    $('#fotoperfil').attr({
        'src': 'images/1.jpeg',
        'alt': 'Foto de perfil'
    });

    function cargarGaleria(username) {
        $.get(`/fotos/${username}`, function(fotos) {
            $('#galeria').empty();
            fotos.forEach(function(foto) {
                const imgContainer = $('<div>', {
                    'class': 'image-container',
                    'style': 'position: relative; display: inline-block;'
                });
    
                const imgElement = $('<img>', {
                    src: foto.imageUrl,
                    alt: foto.imageName,
                    'class': 'galeria-img',
                    'data-id': foto._id,
                    'data-bs-toggle': 'modal',
                    'data-bs-target': '#imageModal'
                });
    
                const deleteButton = $('<button>', {
                    'class': 'delete-btn',
                    'html': '<img src="images/borrar.png" alt="Borrar" style="width:20px; height:20px;">',
                    'click': function(e) {
                        e.stopPropagation();
                        borrarFoto(foto._id);
                    }
                });
    
                imgContainer.append(imgElement).append(deleteButton);
                $('#galeria').append(imgContainer);
    
                imgElement.on('click', function() {
                    $('#modalImage').attr('src', foto.imageUrl);
    
                    // Ajustar el tamaño del modal
                    var modalDialog = $('#imageModal .modal-dialog');
                    var img = new Image();
                    img.src = foto.imageUrl;
                    img.onload = function() {
                        var imgWidth = img.width;
                        var imgHeight = img.height;
    
                        // Asegurar que el modal no sea más grande que el viewport
                        var viewportWidth = $(window).width();
                        var viewportHeight = $(window).height();
                        var maxWidth = Math.min(imgWidth, viewportWidth * 0.8);
                        var maxHeight = Math.min(imgHeight, viewportHeight * 0.8);
    
                        // Centrar el modal horizontalmente si la imagen es vertical
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
    
                        $('#imageModal').modal('show');
                    };
                });
            });
        }).fail(function() {
            console.error('Error al cargar las fotos');
            $('#galeria').append('<p>Error al cargar las fotos.</p>');
        });
    }
    

    function borrarFoto(fotoId) {
        $.ajax({
            url: `/borrar-foto/${fotoId}`,
            type: 'DELETE',
            success: function(result) {
                alert('Imagen borrada correctamente');
                cargarGaleria(username); // Recargar la galería
            },
            error: function() {
                alert('Error al borrar la imagen');
            }
        });
    }

    cargarGaleria(username);

    $('#uploadForm').on('submit', function(e) {
        e.preventDefault();
        var formData = new FormData(this);

        $.ajax({
            url: $(this).attr('action').replace('sergio', username),
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
                alert('Imagen subida correctamente');
                $('#uploadModal').modal('hide'); // Ocultar el modal
                cargarGaleria(username); // Recargar la galería
            },
            error: function() {
                alert('Error al subir la imagen');
            }
        });
    });
});
*/