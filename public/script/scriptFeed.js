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
                        'class': 'image-container', // Añade clase para estilo
                        'style': 'position: relative; display: inline-block; margin: 10px;'
                    });
                    var imgElement = $('<img>', { // Crea un elemento imagen con jQuery
                        src: `/${publicacion.imagePath}`, // Establece el atributo src
                        'class': 'feed-img', // Añade la clase para estilos
                        'click': function() { // Manejador de clic para abrir el modal
                            $('#modalImage').attr('src', `/${publicacion.imagePath}`);
                        }
                    });
                    var userLabel = $('<div>', {
                        'class': 'user-label', // Añade clase para estilo
                        'text': `@${publicacion.username}` // Muestra el nombre de usuario
                    });
                    imgContainer.append(imgElement).append(userLabel);
                    feed.append(imgContainer); // Añade el elemento imagen al contenedor
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
