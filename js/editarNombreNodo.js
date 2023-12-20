

function editarNombreNodo() {

    const svg = d3.select('#lienzo');

    // Agregar texto dentro de cada círculo
        const texts = svg.selectAll('text')
            
            .on('click', function(event, d) {
                const newText = prompt('Ingrese el nuevo nombre del nodo:');                
                if (newText !== null) { // Verificar si se ingresó algo
                    d3.select(this).text(newText);
                }
            });


};

