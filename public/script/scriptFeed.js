document.addEventListener('DOMContentLoaded', function() {
    cargarFeed();
});

function cargarFeed() {
    $.ajax({
        type: 'GET',
        url: '/cargarFeed',
        success: function(response) {
            if (response && response.publicaciones && response.publicaciones.length > 0) {
                var feed = $('#feed'); // Selecciona el contenedor con jQuery
                feed.empty(); // Limpia el contenido existente

                $.each(response.publicaciones, function(index, publicacion) {
                    const imgContainer = $('<div>', {
                        'class': 'image-container',
                        'style': 'position: relative; margin: 10px auto;'
                    });

                    var imgElement = $('<img>', {
                        src: `/${publicacion.imagePath}`,
                        'class': 'feed-img',
                        'click': function() {
                            $('#modalImage').attr('src', `/${publicacion.imagePath}`);
                            $('#imageModal').modal('show');
                        }
                    });

                    var userLabel = $('<div>', {
                        'class': 'user-label'
                    });

                    var userLink = $('<a>', {
                        'href': `/perfil/${publicacion.username}`,
                        'text': `@${publicacion.username}`,
                        'style': 'color: blue; text-decoration: underline; cursor: pointer;'
                    });

                    userLabel.append(userLink);

                    var descripcionDiv = $('<div>', {
                        'class': 'descripcion'
                    });

                    if (publicacion.descripcion) {
                        var shortText = `<strong>${publicacion.username}</strong> ${publicacion.descripcion.substring(0, 100)}... `;
                        var fullText = `<strong>${publicacion.username}</strong> ${publicacion.descripcion}`;
                        var isShort = true;
                    
                        if (publicacion.descripcion.length > 100) {
                            descripcionDiv.html(shortText);
                    
                            var verMasButton = $('<button>', {
                                'text': 'Ver más',
                                'style': 'background: none; border: none; color: blue; text-decoration: underline; cursor: pointer;',
                                'click': function(e) {
                                    e.preventDefault();
                                    toggleDescription(descripcionDiv, verMasButton, shortText, fullText, isShort).then(updatedState => {
                                        isShort = updatedState;
                                    });
                                }
                            });
                    
                            descripcionDiv.append(verMasButton);
                        } else {
                            descripcionDiv.html(fullText);
                        }
                    } else {
                        descripcionDiv.html(`<strong>${publicacion.username}</strong>`);
                    }
                    

                    var likesLabel = $('<div>', {
                        'class': 'likes-label',
                        'text': `${publicacion.meGustas} Me gusta`
                    });

                    // Uso de la función showLike para obtener el HTML del botón de me gusta
                    showLike(publicacion._id).then(likeButtonHtml => {
                        var likeButton = $('<button>', {
                            'class': 'like-button',
                            'html': likeButtonHtml,
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
                            .append(descripcionDiv)
                            .append(likesLabel)
                            .append(likeButton)
                            .append(commentButton)
                            .append(followButton)
                            .append(unfollowButton)
                            .append(deleteButton)
                            .append(commentsContainer);

                        feed.append(imgContainer);
                    }).catch(error => {
                        console.error('Error al obtener el botón de me gusta:', error);
                    });
                });
            } else {
                console.log('No hay publicaciones en el feed.');
            }
        },
        error: function(error) {
            console.error('Error al cargar el feed:', error);
        }
    });
}

function subirImagen() {
    const fileInput = document.getElementById('inputImagen');
    const categoriaInput = document.getElementById('categoria'); // Obtener el campo de categoría
    const formData = new FormData();
    formData.append('imagen', fileInput.files[0]);
    formData.append('categoria', categoriaInput.value); // Añadir la categoría al formulario

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
            cargarFeed(); // Actualizar datos del muro después de subir la imagen
        },
        error: function (error) {
            console.error('Error al subir la imagen:', error);
        }
    });
}


function toggleDescription(descripcionDiv, verMasButton, shortText, fullText, isShort) {
    return new Promise((resolve) => {
        if (isShort) {
            descripcionDiv.html(fullText).append(verMasButton.text('Ver menos'));
            resolve(false);
        } else {
            descripcionDiv.html(shortText).append(verMasButton.text('Ver más'));
            resolve(true);
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
            if (response.status) {
                console.log(response.status);
            } else {
                console.log(response.status);
            }
            cargarFeed(); // Recargar el feed para actualizar el número de "me gusta"
        },
        error: function(error) {
            console.error('Error al añadir "me gusta":', error);
        }
    });
}

function showLike(publicacionId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: '/me-gusta-o-no',
            data: JSON.stringify({ publicacionId: publicacionId }),
            contentType: 'application/json',
            success: function(response) {
                var likebutton;
                if (response.status) {
                    likebutton = '<img src="/images/me-gusta.png" alt="Me gusta">';
                } else {
                    likebutton = '<img src="/images/me-gusta2.png" alt="Me gusta">';
                }
                resolve(likebutton);
            },
            error: function(error) {
                console.error('Error al verificar "me gusta":', error);
                reject(error);
            }
        });
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
