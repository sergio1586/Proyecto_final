document.addEventListener('DOMContentLoaded', function() {
    const username = profileUser; // Esta variable se establece en el servidor

    console.log('Cargando perfil de usuario:', username); // Verifica que el usuario se está obteniendo

    cargarPerfilUsuario(username);
    cargarPublicacionesDeUsuario(username);
});

function cargarPerfilUsuario(username) {
    $.ajax({
        type: 'GET',
        url: `/perfil-data/${username}`,
        success: function (response) {
            console.log('Perfil data:', response); // Verifica los datos en la consola
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

function cargarPublicacionesDeUsuario(username) {
    $.ajax({
        type: 'GET',
        url: `/publicaciones-de-usuario/${username}`,
        success: function (response) {
            console.log('Publicaciones data:', response); // Verifica los datos en la consola
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

function addLike(publicacionId) {
    $.ajax({
        type: 'POST',
        url: '/me-gusta',
        data: JSON.stringify({ publicacionId: publicacionId }),
        contentType: 'application/json',
        success: function(response) {
            alert(response.message);
            cargarPublicacionesDeUsuario(profileUser); // Recargar las publicaciones para actualizar el número de "me gusta"
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
            cargarPublicacionesDeUsuario(profileUser); // Recargar las publicaciones para mostrar el nuevo comentario
        },
        error: function(error) {
            console.error('Error al añadir comentario:', error);
        }
    });
}
