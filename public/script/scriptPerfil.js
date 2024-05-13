$(document).ready(function(){

    $('#fotoperfil').attr({
        'src': 'images/1.jpeg',
        'alt': 'Foto de perfil',
        'class': 'perfil-foto me-3'
    });

    function cargarGaleria() {
        $.get('/fotos/sergio', function(fotos) {
            $('#galeria').empty(); // Limpia la galería antes de cargar nuevas fotos
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
                // Opcional: Recargar la galería o agregar la nueva imagen directamente
                cargarGaleria();
            },
            error: function() {
                alert('Error al subir la imagen');
            }
        });
    });
});
