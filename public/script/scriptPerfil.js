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
                    $('#fotoperfil').attr('src', `/${response.imagenPerfil}`);
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
                    $('#fotoperfil').attr('src', `/${response.imagenPerfil}`);
                } else {
                    $('#fotoperfil').attr('src', '/images/default-profile.png'); // Imagen de perfil predeterminada
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
                        'class': 'col-md-4 col-sm-6 image-container'
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
                        'html': '<img src="/images/me-gusta.png" alt="Me gusta">'
                    }).on('click', function() {
                        addLike(publicacion._id);
                    });

                    var commentButton = $('<button>', {
                        'class': 'comment-button',
                        'html': '<img src="/images/comente.png" alt="Comentar">'
                    }).on('click', function() {
                        var comentarioTexto = prompt('Introduce tu comentario:');
                        if (comentarioTexto) {
                            addComment(publicacion._id, comentarioTexto);
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

/*function cargarPublicacionesDeUsuario(username) {
    $.ajax({
        type: 'GET',
        url: `/publicaciones-de-usuario/${username}`,
        success: function (response) {
            if (response && response.publicaciones && response.publicaciones.length > 0) {
                var galeria = $('#galeria'); // Selecciona el contenedor con jQuery
                galeria.empty(); // Limpia el contenido existente

                $.each(response.publicaciones, function(index, publicacion) {
                    const imgContainer = $('<div>', {
                        'class': 'col-md-4 col-sm-6 image-container'
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
                        'html': '<img src="/images/me-gusta.png" alt="Me gusta">'
                    }).on('click', function() {
                        addLike(publicacion._id);
                    });

                    var commentButton = $('<button>', {
                        'class': 'comment-button',
                        'html': '<img src="/images/comente.png" alt="Comentar">'
                    }).on('click', function() {
                        var comentarioTexto = prompt('Introduce tu comentario:');
                        if (comentarioTexto) {
                            addComment(publicacion._id, comentarioTexto);
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
}*/
