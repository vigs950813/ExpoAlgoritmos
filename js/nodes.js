// Seleccionar el elemento SVG y definir los límites
const svg = d3.select('svg');
const width = +svg.attr('width');
const height = +svg.attr('height');
const margin = 50; // Tamaño del margen

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
  .attr('r', 30);

// Crear el segundo círculo en el SVG
const circle2 = svg.append('circle')
  .attr('class', 'draggable-circle')
  .attr('cx', circle2X)
  .attr('cy', circle2Y)
  .attr('r', 30);

// Crear una línea para conectar los círculos
const line = svg.append('line')
  .attr('stroke', 'black')
  .attr('stroke-width', 2);

// Funciones para mover el primer círculo dentro de los límites
function dragstarted1(event) {
  circle1.raise().attr('stroke', 'black'); // Levantar el círculo y cambiar el color del borde al ser arrastrado
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
  circle1.attr('stroke', null); // Restaurar el color del borde al finalizar el arrastre
}

// Funciones para mover el segundo círculo dentro de los límites
function dragstarted2(event) {
  circle2.raise().attr('stroke', 'black'); // Levantar el círculo y cambiar el color del borde al ser arrastrado
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
  circle2.attr('stroke', null); // Restaurar el color del borde al finalizar el arrastre
}

// Actualizar las coordenadas de la línea para conectar los círculos
function updateLine() {
  line.attr('x1', circle1X)
    .attr('y1', circle1Y)
    .attr('x2', circle2X)
    .attr('y2', circle2Y);
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
