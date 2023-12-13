// Seleccionar el elemento SVG y definir los límites
const svg = d3.select('svg');
const width = +svg.attr('width');
const height = +svg.attr('height');
const margin = 50; // Tamaño de margen (ees el área entre el borde del svg y los límites de los círculos)

// Definir las coordenadas iniciales del primer círculo
let circle1X = 100;
let circle1Y = 100;

// Definir las coordenadas iniciales del segundo círculo
let circle2X = 300;
let circle2Y = 300;

// Crear el primer círculo en el SVG
const circle1 = svg.append('circle')
  .attr('class', 'draggable-circle')
  .attr('cx', circle1X)
  .attr('cy', circle1Y)
  .attr('r', 30)
  .attr('stroke', 'black')
  .attr('stroke-width', 2)
  .attr('fill', '#BFBFBF');

// Crear el segundo círculo en el SVG
const circle2 = svg.append('circle')
  .attr('class', 'draggable-circle')
  .attr('cx', circle2X)
  .attr('cy', circle2Y)
  .attr('r', 30)
  .attr('stroke', 'black')
  .attr('stroke-width', 2)
  .attr('fill', '#BFBFBF');

// Crear una línea para conectar los círculos
const line = svg.append('line')
  .attr('stroke', 'black')
  .attr('stroke-width', 4);

// Funciones para mover el primer círculo dentro de los límites
function dragstarted1(event) {
  circle1.raise().attr('stroke', 'blue'); // Levantar el círculo y cambiar el color del borde al ser arrastrado
  circle1.raise().attr('fill', '#00CC3B');
  circle1.raise().attr('opacity', 0.5);
}

function dragged1(event) {
  // Limitar las coordenadas dentro de los límites del SVG
  circle1X = Math.max(margin, Math.min(width - margin, event.x));
  circle1Y = Math.max(margin, Math.min(height - margin, event.y));
  
  // Actualizar las coordenadas del primer círculo
  circle1.attr('cx', circle1X).attr('cy', circle1Y);

  // Actualizar las coordenadas de la línea
  updateLine();
}

function dragended1(event) {
  circle1.attr('stroke', 'black'); // Restaurar el color del borde al finalizar el arrastre
  circle1.attr('fill', '#00922A'); // Restaurar el color del borde al finalizar el arrastre
  circle1.attr('opacity', 1); // Restaurar el color del borde al finalizar el arrastre
}

// Funciones para mover el segundo círculo dentro de los límites
function dragstarted2(event) {
  circle2.raise().attr('stroke', 'blue'); // Levantar el círculo y cambiar el color del borde al ser arrastrado
  circle2.raise().attr('fill', '#CC0000');
  circle2.raise().attr('opacity', 0.5);
}

function dragged2(event) {
  // Limitar las coordenadas dentro de los límites del SVG
  circle2X = Math.max(margin, Math.min(width - margin, event.x));
  circle2Y = Math.max(margin, Math.min(height - margin, event.y));
  
  // Actualizar las coordenadas del segundo círculo
  circle2.attr('cx', circle2X).attr('cy', circle2Y);

  // Actualizar las coordenadas de la línea
  updateLine();
}

function dragended2(event) {
  circle2.attr('stroke', 'black'); // Restaurar el color del borde al finalizar el arrastre
  circle2.attr('fill', 'red'); // Restaurar el color del borde al finalizar el arrastre
  circle2.attr('opacity', 1); // Restaurar el color del borde al finalizar el arrastre
}

// Actualizar las coordenadas de la línea para conectar los círculos (esta funcion hace que el pequeño trozo de línea que se halla dentro del radio de los círculos se refleje en pantalla)
/*function updateLine() {
  line.attr('x1', circle1X)
    .attr('y1', circle1Y)
    .attr('x2', circle2X)
    .attr('y2', circle2Y);
}*/


// Actualizar las coordenadas de la línea para conectar los círculos (esta funcion hace que el pequeño trozo de línea que se halla dentro del radio de los círculos desaparezca para que la conexión se vea con mejor presentación)
function updateLine() {
  const circle1Radius = +circle1.attr('r');
  const circle2Radius = +circle2.attr('r');

  // Verificar si la línea intersecta con el radio del círculo 1
  const dist1 = Math.sqrt((circle2X - circle1X) ** 2 + (circle2Y - circle1Y) ** 2);
  const lineLength = Math.sqrt((circle2X - circle1X) ** 2 + (circle2Y - circle1Y) ** 2);
  const factor1 = circle1Radius / lineLength;

  // Coordenadas ajustadas para la línea que se extiende más allá del radio del círculo 1
  const newX1 = circle1X + (circle2X - circle1X) * factor1;
  const newY1 = circle1Y + (circle2Y - circle1Y) * factor1;

  // Verificar si la línea intersecta con el radio del círculo 2
  const factor2 = circle2Radius / lineLength;

  // Coordenadas ajustadas para la línea que se extiende más allá del radio del círculo 2
  const newX2 = circle1X + (circle2X - circle1X) * (1 - factor2);
  const newY2 = circle1Y + (circle2Y - circle1Y) * (1 - factor2);

  line.attr('x1', newX1)
    .attr('y1', newY1)
    .attr('x2', newX2)
    .attr('y2', newY2);
}


// Establecer la función de arrastre para el primer círculo utilizando D3
circle1.call(d3.drag()
  .on('start', dragstarted1)
  .on('drag', dragged1)
  .on('end', dragended1));

// Establecer la función de arrastre para el segundo círculo utilizando D3
circle2.call(d3.drag()
  .on('start', dragstarted2)
  .on('drag', dragged2)
  .on('end', dragended2));



// Actualizar la posición inicial de la línea al cargar la página
updateLine();
