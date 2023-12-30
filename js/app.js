


//    Función para inicializar entorno de cytoscape usando el identificador cy
document.addEventListener('DOMContentLoaded', function () {
  var cy = cytoscape({
    container: document.getElementById('cy'),
    elements: [],
    style: [
      {
        selector: 'node',//   Para nodos
        style: {//    Estilos iniciales
          'background-color': '#007EFF',//   Color de fondo 
          'label': 'data(id)',//    Nombre de nodo dado el input del usuario
          'width': 30,//    Ancho del nodo
          'height': 30//    Largo del nodo
        }
      },
      {
        selector: 'edge',//   Para aristas
        style: {//  Estilos iniciales
          'width': 2, //    Tamaño de arista
          'line-color': '#ccc',//   Color de arista
          'target-arrow-color': '#ccc',//   Color de flecha
          'target-arrow-shape': 'triangle',//   Forma de la flecha
          'label': 'data(label)' // Estilo para el texto de la arista
        }
      },
      {
        selector: '.selected',//    Para selección de objetos en el lienzo de cy con clic
        style: {
          'background-color': '#BFDFFF',//   Color de fondo 
          'border-width': 3,//    Ancho del borde
          'border-color': '#0085FF  ',//   Color del borde
          'opacity': '0.5',//   Color del borde
        }
      }

    ]
  });


  //    Inicialización de selección de nodos y aristas en nulo para su posterior uso y operación correspondiente
  var selectedNodeId = null;
  var selectedEdgeId = null;


  // Función para agregar un nuevo nodo
  function addNode() {
    var newNodeId = document.getElementById('newNodeId').value.trim();

    // Expresión regular para validar si newNodeId contiene solo letras de la A a la Z
    var lettersOnly = /^[A-Z]+$/;

    if (newNodeId !== '' && lettersOnly.test(newNodeId)) {
      // Agregar el nuevo nodo al grafo
      cy.add({ data: { id: newNodeId } });

      // Centrar el nodo recién agregado en el contenedor
      cy.fit();

      //  Se hace zoom out al área donde se muestran los nodos para que no se vean tan grandes
      cy.zoom(3);

      // Limpiar el campo de entrada
      document.getElementById('newNodeId').value = '';
    } else {
      // Mensaje de alerta si la entrada no es válida
      alert('Error, el nodo debe tener un identificador y solo debe ser en letras mayúsculas en el rango A-Z.');
    }
  }


  // Función para agregar una nueva arista
  function addEdge() {
    var edgeText = document.getElementById('edgeText').value;

    if (edgeText.trim() !== '' && selectedNodeId !== null) {
      var targetNodeId = prompt('Ingrese el ID del nodo al que desea conectar:', '');

      if (targetNodeId.trim() !== '') {
        // Agregar la nueva arista al grafo
        cy.add({ data: { id: selectedNodeId + targetNodeId, source: selectedNodeId, target: targetNodeId, label: edgeText } });
      }
    }

    // Limpiar el campo de entrada
    document.getElementById('edgeText').value = '';
  }

  // Función para editar el peso de una arista
  function editEdgeWeight() {
    var edgeWeight = document.getElementById('edgeWeight').value;

    if (edgeWeight.trim() !== '' && selectedEdgeId !== null) {
      // Obtener la arista seleccionada
      var selectedEdge = cy.getElementById(selectedEdgeId);

      // Actualizar el peso de la arista
      selectedEdge.data('label', edgeWeight);
    }

    // Limpiar el campo de entrada
    document.getElementById('edgeWeight').value = '';
  }

  // Función para eliminar el nodo seleccionado
  function deleteSelectedNode() {
    if (selectedNodeId !== null) {
      cy.remove('node[id="' + selectedNodeId + '"]');
      selectedNodeId = null;
    }
  }

  // Manejar clic en un nodo para conectar
  cy.on('tap', 'node', function (event) {
    var node = event.target;

    if (selectedNodeId === null) {
      // Si no hay un nodo seleccionado, selecciona el actual
      selectedNodeId = node.id();
      node.addClass('selected');
    } else {
      // Si hay un nodo seleccionado, conecta el actual con el seleccionado
      var edgeText = prompt('Ingrese el texto para la arista:', '');

      if (edgeText.trim() !== '') {
        var newEdgeId = selectedNodeId + node.id();

        // Agregar la nueva arista al grafo
        cy.add({ data: { id: newEdgeId, source: selectedNodeId, target: node.id(), label: edgeText } });

        // Guardar el ID de la arista recién creada
        selectedEdgeId = newEdgeId;
      }

      // Limpiar la selección
      cy.nodes().removeClass('selected');
      selectedNodeId = null;
    }
  });

  // Manejar clic en una arista para seleccionarla
  cy.on('tap', 'edge', function (event) {
    var edge = event.target;

    edge.style({
      'line-color': '#ECB800', // Cambia al color original del borde
      'width': 2 // Restaura el ancho de línea original u otros estilos
      // Restaura otros estilos según sea necesario
    });

    // Guardar el ID de la arista seleccionada
    selectedEdgeId = edge.id();
  });


  //  Función para remover los estados de selección de una arista
  //  Se anexa esta función dado que no existe una clase selected directa para aristas en cytoscape.
  function removeEdgeStyles() {
    cy.edges().forEach(function (edge) {
      edge.style({
        'line-color': '#ccc', // Restaurar el color original del borde
        'width': 2 // Restaurar otros estilos como el ancho de la línea
      });
    });
  }


  // Manejar clic en un área vacía del grafo para limpiar la selección
  cy.on('tap', function (event) {
    if (event.target === cy) {
      cy.nodes().removeClass('selected');// Se remueve la clase selected al nodo que hace que tenga un borde rojo
      removeEdgeStyles();// Se remueve el estilo de una arista
      selectedNodeId = null;
      selectedEdgeId = null;
    }
  });

  // Asociar las funciones a los botones
  document.getElementById('addNodeButton').addEventListener('click', addNode);
  //document.getElementById('addEdgeButton').addEventListener('click', addEdge);
  document.getElementById('editEdgeWeightButton').addEventListener('click', editEdgeWeight);
  document.getElementById('deleteSelectedNode').addEventListener('click', deleteSelectedNode);
});
