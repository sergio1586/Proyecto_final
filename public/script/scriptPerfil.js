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
