

function crearNodos() {

    const numeroNodos = document.getElementById('numeroNodosInput').value;


    if (numeroNodos < 3) {
        alert("Error, es necesario tener más de 2 nodos para crear un grafo");
        document.getElementById('numeroNodosInput').value = 3;
    } else {
        const svg = d3.select('#lienzo');

        // Generando los círculos dentro del SVG
        const circles = svg.selectAll('circle')
            .data(d3.range(numeroNodos))
            .enter()
            .append('circle')
            .attr('cx', (d, i) => 50 + i * 100)
            .attr('cy', 100)
            .attr('r', 25)
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '5')
            .attr('cursor', 'move')
            
            .call(d3.drag() // Habilitar la funcionalidad de arrastrar y soltar
                .on('start', dragStarted)
                .on('drag', dragged)
                .on('end', dragEnded)
            );
        // Agregar texto dentro de cada círculo
        const texts = svg.selectAll('text')
            .data(d3.range(numeroNodos))
            .enter()
            .append('text')
            .attr('x', (d, i) => 50 + i * 100) // Posición x del texto
            .attr('y', 100) // Posición y del texto
            .attr('text-anchor', 'middle') // Alineación horizontal
            .attr('font-size', '40px') // Tamaño de la fuente
            .attr('dominant-baseline', 'central') // Ajuste vertical para centrar el texto
            .text((d, i) => String.fromCharCode(65 + i))
            .on('dblclick', function(event, d) {
                const newText = prompt('Ingrese el nuevo texto:');
                if (newText !== null) { // Verificar si se ingresó algo
                    d3.select(this).text(newText);
                }
            });

            

        // Función para arrastrar los círculos y texto simultáneamente
        function dragged(event, d) {
            const circle = d3.select(this);
            const index = circle.data()[0];
            circle.attr('cx', d.x = event.x)
                .attr('cy', d.y = event.y);

            // Actualizar la posición del texto asociado al círculo arrastrado
            texts.filter((textData, i) => i === index)
                .attr('x', event.x)
                .attr('y', event.y);
        }
        


    }


}

// Funciones para manejar los eventos del arrastre
function dragStarted(event, d) {
    d3.select(this).raise().attr('stroke', 'black'); // Resalta el círculo al empezar a arrastrarlo
    d3.select(this).raise().attr('stroke-width', '5'); // Resalta el círculo al empezar a arrastrarlo
            
}

function dragged(event, d) {
    d3.select(this)
        .attr('cx', d.x = event.x)
        .attr('cy', d.y = event.y);
}

function dragEnded(event, d) {
    d3.select(this).raise().attr('stroke', 'black'); // Resalta el círculo al empezar a arrastrarlo
    d3.select(this).raise().attr('stroke-width', '5'); // Resalta el círculo al empezar a arrastrarlo
}

document.getElementById('btnCrearNodos').addEventListener('click', crearNodos);


