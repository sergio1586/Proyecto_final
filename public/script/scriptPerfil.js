document.addEventListener('DOMContentLoaded', function() {
    if (typeof currentUser !== 'undefined') {
        const nick_usuario = document.getElementById('nick_usuario');
        nick_usuario.innerHTML = `${currentUser}`;
        cargarPerfil(); // Cargar datos del perfil del usuario
        cargarPublicacionesUsuario(); // Cargar publicaciones del usuario
    }

    if (typeof profileUser !== 'undefined') {
        cargarPerfilUsuario(profileUser); // Cargar datos del perfil de otro usuario
        cargarPublicacionesDeUsuario(profileUser); // Cargar publicaciones de otro usuario
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

function cargarPerfilUsuario(username) {
    $.ajax({
        type: 'GET',
        url: `/perfil-data/${username}`,
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

function cargarPublicacionesUsuario() {
    $.ajax({
        type: 'GET',
        url: '/publicaciones-usuario',
        success: function (response) {
            if (response && response.publicaciones && response.publicaciones.length > 0) {
                var galeria = $('#galeria'); // Selecciona el contenedor con jQuery
                galeria.empty(); // Limpia el contenido existente

                $.each(response.publicaciones, function(index, publicacion) {
                    const imgContainer = $('<div>', {
                        'class': 'image-container',
                        'style': 'position: relative; display: inline-block; margin: 10px;'
                    });

                    var imgElement = $('<img>', {
                        src: `/${publicacion.imagePath}`,
                        'class': 'galeria-img',
                        'click': function() {
                            $('#modalImage').attr('src', `/${publicacion.imagePath}`);
                            $('#imageModal').modal('show');
                        }
                    });

                    var likesLabel = $('<div>', {
                        'class': 'likes-label',
                        'text': `${publicacion.meGustas} Me gusta`
                    });

                    var likeButton = $('<button>', {
                        'class': 'like-button',
                        'text': 'Me gusta',
                        'click': function() {
                            addLike(publicacion._id);
                        }
                    });

                    var commentButton = $('<button>', {
                        'class': 'comment-button',
                        'text': 'Comentar',
                        'click': function() {
                            var comentarioTexto = prompt('Introduce tu comentario:');
                            if (comentarioTexto) {
                                addComment(publicacion._id, comentarioTexto);
                            }
                        }
                    });

                    var commentsContainer = $('<div>', {
                        'class': 'comments-container'
                    });

                    $.each(publicacion.comentarios, function(index, comentario) {
                        var commentElement = $('<div>', {
                            'class': 'comment',
                            'text': `@${comentario.usuario}: ${comentario.texto}`
                        });
                        commentsContainer.append(commentElement);
                    });

                    var deleteButton = $('<button>', {
                        'class': 'delete-button',
                        'text': 'Eliminar',
                        'click': function() {
                            if (confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
                                deletePhoto(publicacion._id);
                            }
                        }
                    });

                    imgContainer.append(imgElement)
                        .append(likesLabel)
                        .append(likeButton)
                        .append(commentButton)
                        .append(deleteButton)
                        .append(commentsContainer);

                    galeria.append(imgContainer);
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

function cargarPublicacionesDeUsuario(username) {
    $.ajax({
        type: 'GET',
        url: `/publicaciones-de-usuario/${username}`,
        success: function (response) {
            if (response && response.publicaciones && response.publicaciones.length > 0) {
                var galeria = $('#galeria'); // Selecciona el contenedor con jQuery
                galeria.empty(); // Limpia el contenido existente

                $.each(response.publicaciones, function(index, publicacion) {
                    const imgContainer = $('<div>', {
                        'class': 'image-container',
                        'style': 'position: relative; display: inline-block; margin: 10px;'
                    });

                    var imgElement = $('<img>', {
                        src: `/${publicacion.imagePath}`,
                        'class': 'galeria-img',
                        'click': function() {
                            $('#modalImage').attr('src', `/${publicacion.imagePath}`);
                            $('#imageModal').modal('show');
                        }
                    });

                    var likesLabel = $('<div>', {
                        'class': 'likes-label',
                        'text': `${publicacion.meGustas} Me gusta`
                    });

                    var likeButton = $('<button>', {
                        'class': 'like-button',
                        'text': 'Me gusta',
                        'click': function() {
                            addLike(publicacion._id);
                        }
                    });

                    var commentButton = $('<button>', {
                        'class': 'comment-button',
                        'text': 'Comentar',
                        'click': function() {
                            var comentarioTexto = prompt('Introduce tu comentario:');
                            if (comentarioTexto) {
                                addComment(publicacion._id, comentarioTexto);
                            }
                        }
                    });

                    var commentsContainer = $('<div>', {
                        'class': 'comments-container'
                    });

                    $.each(publicacion.comentarios, function(index, comentario) {
                        var commentElement = $('<div>', {
                            'class': 'comment',
                            'text': `@${comentario.usuario}: ${comentario.texto}`
                        });
                        commentsContainer.append(commentElement);
                    });

                    imgContainer.append(imgElement)
                        .append(likesLabel)
                        .append(likeButton)
                        .append(commentButton)
                        .append(commentsContainer);

                    galeria.append(imgContainer);
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
            cargarPublicacionesUsuario();
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
            cargarPublicacionesUsuario();
            cargarPerfil(); // Actualizar datos del perfil después de eliminar la imagen
        },
        error: function(error) {
            console.error('Error al eliminar la foto:', error);
        }
    });
}

function addLike(publicacionId) {
    $.ajax({
        type: 'POST',
        url: '/me-gusta',
        data: JSON.stringify({ publicacionId: publicacionId }),
        contentType: 'application/json',
        success: function(response) {
            alert(response.message);
            cargarPublicacionesUsuario(); // Recargar las publicaciones para actualizar el número de "me gusta"
        },
        error: function(error) {
            console.error('Error al añadir "me gusta":', error);
        }
    });
}

function addComment(publicacionId, texto) {
    $.ajax({
        type: 'POST',
        url: '/comentario',
        data: JSON.stringify({ publicacionId: publicacionId, texto: texto }),
        contentType: 'application/json',
        success: function(response) {
            alert(response.message);
            cargarPublicacionesUsuario(); // Recargar las publicaciones para mostrar el nuevo comentario
        },
        error: function(error) {
            console.error('Error al añadir comentario:', error);
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
