$(document).ready(function() {
    $('#fotoperfil').attr({
        'src': 'images/1.jpeg',
        'alt': 'Foto de perfil'
    });

    function cargarGaleria() {
        $.get('/fotos/sergio', function(fotos) {
            $('#galeria').empty();
            fotos.forEach(function(foto) {
                $('#galeria').append($('<img>', {
                    src: foto.imageUrl,
                    alt: foto.imageName,
                    'class': 'img-fluid'
                }));
            });
        }).fail(function() {
            console.error('Error al cargar las fotos');
            $('#galeria').append('<p>Error al cargar las fotos.</p>');
        });
    }
    
    cargarGaleria();

    $('#uploadForm').on('submit', function(e) {
        e.preventDefault();
        var formData = new FormData(this);

        $.ajax({
            url: $(this).attr('action'),
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
                alert('Imagen subida correctamente');
                $('#uploadModal').modal('hide'); // Ocultar el modal
                cargarGaleria(); // Recargar la galería
            },
            error: function() {
                alert('Error al subir la imagen');
            }
        });
    });
});
