document.addEventListener('DOMContentLoaded', function() {
    cargarFeed();
});

function cargarFeed() {
    $.ajax({
        type: 'GET',
        url: '/cargarFeed',
        success: function (response) {
            if (response && response.publicaciones && response.publicaciones.length > 0) {
                var feed = $('#feed'); // Selecciona el contenedor con jQuery
                feed.empty(); // Limpia el contenido existente

                $.each(response.publicaciones, function(index, publicacion) {
                    const imgContainer = $('<div>', {
                        'class': 'image-container',
                        'style': 'position: relative; display: inline-block; margin: 10px;'
                    });

                    var imgElement = $('<img>', {
                        src: `/${publicacion.imagePath}`,
                        'class': 'feed-img',
                        'click': function() {
                            $('#modalImage').attr('src', `/${publicacion.imagePath}`);
                            $('#imageModal').modal('show');
                        }
                    });

                    var userLabel = $('<a>', {
                        'href': `/perfil/${publicacion.username}`,
                        'class': 'user-label',
                        'text': `@${publicacion.username}`,
                        'style': 'display: block; color: blue; text-decoration: underline; cursor: pointer;'
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

                    var followButton = $('<button>', {
                        'class': 'follow-button',
                        'text': 'Seguir',
                        'click': function() {
                            seguirUsuario(publicacion.username);
                        }
                    });

                    var unfollowButton = $('<button>', {
                        'class': 'unfollow-button',
                        'text': 'Dejar de Seguir',
                        'click': function() {
                            dejarDeSeguirUsuario(publicacion.username);
                        }
                    });

                    // Botón para eliminar la publicación
                    var deleteButton = $('<button>', {
                        'class': 'delete-button',
                        'text': 'Eliminar',
                        'click': function() {
                            if (confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
                                deletePhoto(publicacion._id);
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
                        .append(userLabel)
                        .append(likesLabel)
                        .append(likeButton)
                        .append(commentButton)
                        .append(followButton)
                        .append(unfollowButton)
                        .append(deleteButton) // Añadir el botón de eliminar
                        .append(commentsContainer);

                    feed.append(imgContainer);
                });
            } else {
                console.log('No hay publicaciones en el feed.');
            }
        },
        error: function (error) {
            console.error('Error al cargar el feed:', error);
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
            cargarFeed(); // Recargar el feed para actualizar el número de "me gusta"
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
            cargarFeed(); // Recargar el feed para mostrar el nuevo comentario
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
            cargarFeed(); // Recargar el feed para actualizar el estado de seguimiento
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
            cargarFeed(); // Recargar el feed para actualizar el estado de seguimiento
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

function deletePhoto(photoId) {
    $.ajax({
        type: 'DELETE',
        url: `/delete-photo/${photoId}`,
        success: function(response) {
            alert(response.message);
            cargarFeed(); // Recargar el feed para actualizar las publicaciones
        },
        error: function(error) {
            console.error('Error al eliminar la foto:', error);
        }
    });
}
