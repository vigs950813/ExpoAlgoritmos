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
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'label': 'data(weight)' // Estilo para el peso de la arista
          }
        },
        {
          selector: '.selected',
          style: {
            'background-color': '#BFDFFF',//   Color de fondo 
            'border-width': 3,//    Ancho del borde
            'border-color': '#0085FF  ',//   Color del borde
            'opacity': '0.5'//   Color del borde
          }
        },
        {
          selector: '.mst', // Nueva clase para las aristas del árbol de expansión mínimo (MST)
          style: {
            'line-color': 'green',
            'target-arrow-color': 'green',
            'label': 'data(weight)'
          }
        }
      ]
    });
  
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
      var edgeWeight = document.getElementById('edgeWeight').value;
  
      if (edgeWeight.trim() !== '' && selectedNodeId !== null) {
        var targetNodeId = prompt('Ingrese el ID del nodo al que desea conectar:', '');
  
        if (targetNodeId.trim() !== '') {
          // Agregar la nueva arista al grafo
          cy.add({ data: { id: selectedNodeId + targetNodeId, source: selectedNodeId, target: targetNodeId, weight: edgeWeight } });
        }
      }
  
      // Limpiar el campo de entrada
      document.getElementById('edgeWeight').value = '';
    }
  
    // Función para editar el peso de una arista
    function editEdgeWeight() {
      var edgeWeight = document.getElementById('edgeWeight').value;
  
      if (edgeWeight.trim() !== '' && selectedEdgeId !== null) {
        // Obtener la arista seleccionada
        var selectedEdge = cy.getElementById(selectedEdgeId);
  
        // Actualizar el peso de la arista
        selectedEdge.data('weight', edgeWeight);
      }
  
      // Limpiar el campo de entrada
      document.getElementById('edgeWeight').value = '';
    }
  
    // Función para eliminar el nodo seleccionado
    function deleteSelectedNode() {
      if (selectedNodeId !== null) {
        cy.remove(cy.getElementById(selectedNodeId));
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
        var edgeWeight = prompt('Ingrese el peso para la arista:', '');
  
        if (edgeWeight.trim() !== '') {
          var newEdgeId = selectedNodeId + node.id();
  
          // Agregar la nueva arista al grafo
          cy.add({ data: { id: newEdgeId, source: selectedNodeId, target: node.id(), weight: edgeWeight } });
  
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
  
      // Guardar el ID de la arista seleccionada
      selectedEdgeId = edge.id();
    });
  
    // Manejar clic en un área vacía del grafo para limpiar la selección
    cy.on('tap', function (event) {
      if (event.target === cy) {
        cy.nodes().removeClass('selected');
        selectedNodeId = null;
        selectedEdgeId = null;
      }
    });
  
  
     // Función para ejecutar el algoritmo de Prim
     function runPrimAlgorithm() {
      // Obtener el nodo de inicio desde el cuadro de texto
      var startNodeId = document.getElementById('startNodeId').value.trim().toUpperCase();
    
      // Verificar si el nodo de inicio existe en el grafo
      if (cy.getElementById(startNodeId).nonempty()) {
        // Restablecer estilos antes de ejecutar el algoritmo
        cy.edges().removeClass('mst');
        cy.edges().removeClass('not-in-mst');
    
        // Iniciar el algoritmo de Prim desde el nodo seleccionado
        runPrimAlgorithmFromNode(startNodeId);
      } else {
        alert('El nodo de inicio no existe en el grafo.');
      }
    }
    
    // Función para ejecutar el algoritmo de Prim desde un nodo específico
    function runPrimAlgorithmFromNode(startNodeId) {
      var primStepsDiv = document.getElementById('primSteps');
      primStepsDiv.innerHTML = ''; // Limpiar el contenido del área de pasos
    
      var adjacencyList = getAdjacencyList(); // Obtener el grafo en formato de lista de adyacencia
      var includedNodes = new Set(); // Inicializar el conjunto de nodos incluidos en el MST
      var edgesInMST = []; // Inicializar el MST
    
      includedNodes.add(startNodeId); // Iniciar el algoritmo desde el nodo seleccionado
    
      function runNextStep() {
        var minEdge = findMinEdge(adjacencyList, includedNodes);
    
        if (minEdge) {
          // Mostrar visualmente la arista que se está considerando en rojo
          cy.getElementById(minEdge.source + minEdge.target).addClass('considering-edge');
    
          setTimeout(function () {
            includedNodes.add(minEdge.target);
    
            // Actualizar visualmente la arista seleccionada en verde
            cy.getElementById(minEdge.source + minEdge.target).removeClass('considering-edge');
            cy.getElementById(minEdge.source + minEdge.target).addClass('mst');
    
            edgesInMST.push(minEdge);
    
            primStepsDiv.innerHTML += `Paso ${includedNodes.size}: Agregar arista ${minEdge.source} - ${minEdge.target} al MST<br>`;
    
            showMST(edgesInMST);
    
            if (includedNodes.size < cy.nodes().length) {
              // Si no se han considerado todos los nodos, continuar con el siguiente paso
              setTimeout(function () {
                // Restablecer los estilos y continuar con el siguiente paso
                cy.getElementById(minEdge.source + minEdge.target).removeClass('mst');
                runNextStep();
              }, 1000);
            } else {
              // Cuando se completan todos los pasos, mostrar el resultado final en el área de pasos
              primStepsDiv.innerHTML += '<br style="font-family: Arial, sans-serif;>Resultado final del MST:<br>';
              edgesInMST.forEach(function (edge) {
                primStepsDiv.innerHTML += `Arista ${edge.source} - ${edge.target}<br>`;
              });
    
              // Disminuir la opacidad de las aristas no seleccionadas en el resultado final
              cy.edges().forEach(function (edge) {
                if (!edgesInMST.some(e => e.source === edge.source().id() && e.target === edge.target().id())) {
                  edge.addClass('not-in-mst');
                }
              });
            }
          }, 1000);
        }
      }
    
      // Iniciar la ejecución del algoritmo
      runNextStep();
    }
    
    // Agregar estilos para las animaciones
    cy.style().selector('.working-node').style({
      'background-color': 'yellow'
    });
    
    cy.style().selector('.considering-edge').style({
      'line-color': 'red',
      'target-arrow-color': 'red'
    });
    
    cy.style().selector('.not-in-mst').style({
      'line-opacity': 0.3
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
    
    // Restablecer estilos al hacer clic en el área vacía del grafo
    cy.on('tap', function (event) {
      if (event.target === cy) {
        removeEdgeStyles();// Se remueve el estilo de una arista
        cy.nodes().removeClass('working-node');
        cy.edges().removeClass('considering-edge');
        cy.edges().removeClass('not-in-mst');
      }
    });
    
    // Restablecer estilos al hacer clic en un nodo
    cy.on('tap', 'node', function (event) {
      cy.nodes().removeClass('working-node');
      cy.edges().removeClass('considering-edge');
      cy.edges().removeClass('not-in-mst');
    });
  
  
  
    
    // Función para obtener el grafo en formato de lista de adyacencia
    function getAdjacencyList() {
      var adjacencyList = {};
  
      cy.nodes().forEach(function (node) { //Iteramos para cada nodo del grafo
        var nodeId = node.id(); //Obtenemos id del nodo actual
        adjacencyList[nodeId] = []; //Creamos una lista vacia de nodos adyacentes para el nodo actual
  
        node.connectedEdges().forEach(function (edge) { //Iteramos para cada arista del nodo actual
          var targetNodeId = edge.target().id(); //Obtenemos el id del nodo adyacente
          var weight = edge.data('weight'); //Obtenemos el peso entre los nodos
          adjacencyList[nodeId].push({ target: targetNodeId, weight: weight }); //Se agrega la informacion del nodo adyacente y el peso de la arista entre ellos
        });
      });
  
      return adjacencyList;
    }
  
    // Función para encontrar la arista de menor peso que conecta un nodo incluido con uno no incluido
    function findMinEdge(adjacencyList, includedNodes) {
      var minEdge = null;
  
      cy.nodes().forEach(function (node) {
        if (includedNodes.has(node.id())) {
          var edges = adjacencyList[node.id()];
  
          edges.forEach(function (edge) {
            if (!includedNodes.has(edge.target) && (!minEdge || edge.weight < minEdge.weight)) {
              minEdge = { source: node.id(), target: edge.target, weight: edge.weight };
            }
          });
        }
      });
  
      return minEdge;
    }
  
    // Función para mostrar el MST en el grafo
    function showMST(edgesInMST) {
      
      cy.edges().removeClass('mst');//Removemos lo que hay anteiormente
  
      edgesInMST.forEach(function (edge) {
        cy.getElementById(edge.source + edge.target).addClass('mst'); 
      });
    }
  
    // Asociar las funciones a los botones
    document.getElementById('addNodeButton').addEventListener('click', addNode);
    //document.getElementById('addEdgeButton').addEventListener('click', addEdge);
    document.getElementById('editEdgeWeightButton').addEventListener('click', editEdgeWeight);
    document.getElementById('deleteSelectedNode').addEventListener('click', deleteSelectedNode);
    document.getElementById('runPrimAlgorithmButton').addEventListener('click', runPrimAlgorithm);
    
  });
  