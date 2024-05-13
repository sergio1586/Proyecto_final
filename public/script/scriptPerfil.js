$(document).ready(function(){
    var imagenes = [
        'images/1.jpeg',
        'images/2.jpg',
        'images/3.webp',
        'images/4.jpg',
        'images/5.jpeg',
        'images/4.jpg',
        'images/5.jpeg'
    ];

    $('#fotoperfil').attr({
        'src': 'images/1.jpeg',
        'alt': 'Foto de perfil',
        'class': 'perfil-foto me-3'
    });

    $('#galeria').empty();

    $.each(imagenes, function(index, url) {
        $('#galeria').append($('<img>', {
            'src': url,
            'alt': 'Publicación ' + (index + 1),
            'class': 'img-fluid'
        }));
    });
});
