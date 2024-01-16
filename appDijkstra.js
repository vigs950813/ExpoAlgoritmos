document.addEventListener('DOMContentLoaded', function () {
  // Declaración de variables
  var cy = initializeCytoscape();
  var selectedNodeId = null;
  var selectedEdgeId = null;
  var editEdgeWeightModal = new bootstrap.Modal(document.getElementById('editEdgeWeightModal'));
  var edgeWeightModal = new bootstrap.Modal(document.getElementById('edgeWeightModal'));
  var errorContainer = document.getElementById("errorContainer");
  var node;

  // Función para inicializar Cytoscape
  function initializeCytoscape() {
    return cytoscape({
      container: document.getElementById('cy'),
      elements: [],
      style: getGraphStyles(),
    });
  }

  // Función para obtener estilos del grafo
  function getGraphStyles() {
    return [
      // Estilos para nodos y aristas
      {
        selector: 'node',
        style: {
          'background-color': '#007EFF',
          'label': 'data(id)',
          'width': 30,
          'height': 30
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'label': 'data(weight)'
        }
      },
      // Estilos adicionales
      {
        selector: '.selected',
        style: {
          'background-color': '#BFDFFF',
          'border-width': 3,
          'border-color': '#0085FF  ',
          'opacity': '0.5'
        }
      },
      {
        selector: '.mst',
        style: {
          'line-color': 'green',
          'target-arrow-color': 'green',
          'label': 'data(weight)'
        }
      }
    ];
  }

  // Función para agregar un nuevo nodo
  function addNode() {
    // Obteniendo el nuevo nodo desde el input
    var newNodeIdInput = document.getElementById('newNodeId');
    var newNodeId = newNodeIdInput.value.trim().toUpperCase();

    // Expresión regular para validar si newNodeId contiene solo letras de la A a la Z
    var lettersOnly = /^[A-Z]+$/;

    // Validaciones
    if (newNodeId === '') {
      showError("Ingrese nombre de nodo.", errorContainer, newNodeIdInput);
      return;
    } else if (!lettersOnly.test(newNodeId)) {
      showError("Solo se puede ingresar letras.", errorContainer, newNodeIdInput);
      return;
    } else if (cy.getElementById(newNodeId).nonempty()) {
      showError("Este nombre de nodo ya existe.", errorContainer, newNodeIdInput);
      return;
    }

    // Limpiar errores si la validación es exitosa
    clearError(errorContainer, newNodeIdInput);

    // Agregar el nuevo nodo al grafo
    cy.add({ data: { id: newNodeId } });

    // Centrar y hacer zoom en el nuevo nodo
    cy.fit();
    cy.zoom(3);

    // Limpiar el campo de entrada
    newNodeIdInput.value = '';
  }

  // Función para editar el peso de una arista
  function editEdgeWeight() {
    var edgeWeight = document.getElementById('newEdgeWeight').value;
    var edgeWeightinput = document.getElementById('newEdgeWeight');
    var editEdgeWeightError = document.getElementById("editEdgeWeightError");

    // Validaciones
    if (edgeWeight.trim() !== '' && edgeWeight >= 0) {
      var selectedEdge = cy.getElementById(selectedEdgeId);
      selectedEdge.data('weight', edgeWeight);
      document.getElementById('newEdgeWeight').value = '';
      editEdgeWeightModal.hide();
      clearError(editEdgeWeightError, edgeWeightinput);
    } else {
      showError("Ingrese un valor valido.", editEdgeWeightError, edgeWeightinput);
    }
    removeEdgeStyles();
  }

  // Función para eliminar el nodo o la arista seleccionada
  function deleteSelectedElement() {
    if (selectedNodeId !== null) {
      cy.remove(cy.getElementById(selectedNodeId));
      selectedNodeId = null;
    } else if (selectedEdgeId !== null) {
      cy.remove(cy.getElementById(selectedEdgeId));
      selectedEdgeId = null;
    }
  }

  // Manejar clic en un nodo para conectar
  cy.on('tap', 'node', function (event) {
    node = event.target;
    if (selectedNodeId === null) {
      selectedNodeId = node.id();
      node.addClass('selected');
    } else {
      edgeWeightModal.show();
    }
  });

  // Manejar clic en una arista para seleccionarla
  cy.on('tap', 'edge', function (event) {
    var edge = event.target;
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

  // Restablecer estilos al hacer clic en una arista
  cy.on('tap', 'edge', function (event) {
    var edge = event.target;
    edge.style({
      'line-color': '#ECB800',
      'width': 2
    });
    selectedEdgeId = edge.id();
  });

  // Función para remover los estilos de las aristas
  function removeEdgeStyles() {
    cy.edges().forEach(function (edge) {
      edge.style({
        'line-color': '#ccc',
        'width': 2
      });
    });
  }

  // Restablecer estilos al hacer clic en el área vacía del grafo
  cy.on('tap', function (event) {
    if (event.target === cy) {
      removeEdgeStyles();
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

  // Función para guardar el peso de la arista
  function guardarPeso() {
    var edgeWeight = document.getElementById('edgeWeight').value;
    var edgeWeightInput = document.getElementById("edgeWeight");
    var edgeWeightErrorElement = document.getElementById("edgeWeightError");

    // Validaciones
    if (edgeWeight.trim() !== '' && edgeWeight >= 0) {
      clearError(edgeWeightErrorElement, edgeWeightInput);

      // Crear el ID único para la nueva arista
      var newEdgeId = selectedNodeId + node.id();

      // Agregar la nueva arista al grafo
      cy.add({ data: { id: newEdgeId, source: selectedNodeId, target: node.id(), weight: edgeWeight } });

      // Guardar el ID de la arista recién creada
      selectedEdgeId = newEdgeId;

      // Limpiar la selección y ocultar el modal
      document.getElementById('edgeWeight').value = "";
      edgeWeightModal.hide();
      cy.nodes().removeClass('selected');
      selectedNodeId = null;
    } else {
      showError("Ingrese un número válido.", edgeWeightErrorElement, edgeWeightInput);
    }
    document.getElementById('edgeWeight').value = "";
  }

  // Función para validar si ya se seleccionó una arista previamente
  function editaristabutton() {
    var edgeWeightinput = document.getElementById('newEdgeWeight');
    if (selectedEdgeId == null) {
      showError("Seleccione una arista.", errorContainer, edgeWeightinput);
    } else {
      clearError(errorContainer, edgeWeightinput);
      editEdgeWeightModal.show();
    }
  }

  // Funciones para mostrar mensajes de error
  function showError(message, containerError, inputError) {
    containerError.innerText = message;
    containerError.classList.add("alert", "alert-danger", "text-center");
    inputError.classList.add("is-invalid");
  }

  function clearError(containerError, inputError) {
    containerError.innerText = "";
    containerError.classList.remove("alert", "alert-danger");
    inputError.classList.remove("is-invalid");
  }

  function runDijkstraAlgorithm() {
    var startNodeId = document.getElementById('startNodeId').value.trim().toUpperCase();
    var startNodeIdInput = document.getElementById('startNodeId');
    clearError(errorContainer,startNodeIdInput);
    var endNodeId = document.getElementById('endNodeId').value.trim().toUpperCase();
    if (cy.getElementById(startNodeId).nonempty()) {
      cy.edges().removeClass('mst');
      cy.edges().removeClass('not-in-mst');
      runDijkstraAlgorithmFromNode(startNodeId, endNodeId);
    } else {

      showError("El nodo de inicio no existe en el grafo.",errorContainer,startNodeIdInput);
    }
  }
  function runDijkstraAlgorithmFromNode(startNodeId, endNodeId) {
    var dijkstraStepsDiv = document.getElementById('dijkstraSteps');
    dijkstraStepsDiv.innerHTML = '';
  
    // Resto del código del algoritmo Dijkstra
  
    var adjacencyList = getAdjacencyList();
    var result = initValues(startNodeId);
  
    dijkstraStepsDiv.innerHTML += `<br> Representación: nodo_i: (costo, nodo_f, nodo_optimo?)<br>`;
    dijkstraStepsDiv.innerHTML += `Lista de valores inicial: <br>`;
    cy.nodes().forEach(function (node) {
      dijkstraStepsDiv.innerHTML += `- ${node.id()}: (${result[node.id()][0].c}, ${result[node.id()][0].iNode}) -`;
    });
    dijkstraStepsDiv.innerHTML += `<br>`;
  
    var total_nodes = 0;
    while (total_nodes < cy.nodes().length) {
      var currentNodeId = getOptimalNode(result);
  
      if (currentNodeId === null) {
        break;
      }
  
      dijkstraStepsDiv.innerHTML += `<br>Analizando nodo ${currentNodeId}<br>`;
  
      // Resto del código del algoritmo Dijkstra
  
      // Muestra la matriz después de cada iteración
      updateDijkstraMatrix(result);
  
      total_nodes += 1;
    }
  
    // Después de ejecutar Dijkstra, actualiza la matriz final
    updateDijkstraMatrix(result);
  }
  
  
  
  

  

  var sleepES5 = function(ms){
    var esperarHasta = new Date().getTime() + ms;
    while(new Date().getTime() < esperarHasta) continue;
  };

  // Después de ejecutar Dijkstra, actualiza la matriz
  function updateDijkstraMatrix(result) {
    // Obtén la referencia a la tabla
    var dijkstraMatrixTable = document.getElementById('dijkstraMatrix');
  
    // Limpia la tabla antes de actualizar
    dijkstraMatrixTable.innerHTML = '';
  
    // Encabezados de la tabla (nombres de nodos)
    var headerRow = dijkstraMatrixTable.insertRow();
    headerRow.insertCell().innerHTML = '<b>Nodo</b>';
    cy.nodes().forEach(function (node) {
      headerRow.insertCell().innerHTML = `<b>${node.id()}</b>`;
    });
  
    // Datos de la matriz
    cy.nodes().forEach(function (sourceNode) {
      var sourceNodeId = sourceNode.id();
      var newRow = dijkstraMatrixTable.insertRow();
      newRow.insertCell().innerHTML = `<b>${sourceNodeId}</b>`;
  
      cy.nodes().forEach(function (targetNode) {
        var targetNodeId = targetNode.id();
        var cost = result[targetNodeId][0].c;
  
        if (cost >= 0) {
          newRow.insertCell().innerHTML = cost;
        } else {
          newRow.insertCell().innerHTML = '<i class="fas fa-infinity"></i>';
        }
      });
    });
  } 
  // ... (Código anterior)





  function getAdjacencyList() {
    var adjacencyList = {};

    cy.nodes().forEach(function (node) {
      var nodeId = node.id();
      adjacencyList[nodeId] = [];

      node.connectedEdges().forEach(function (edge) {
        var targetNodeId = edge.target().id();
        var weight = edge.data('weight');
        if(node.id() != targetNodeId){
          adjacencyList[nodeId].push({ target: targetNodeId, weight: parseInt(weight) }); 
        } else {
          adjacencyList[nodeId].push({ target: edge.source().id(), weight: parseInt(weight) }); 
        }
      });
    });

    return adjacencyList;
  }

  function initValues(startNodeId) {
    var result = {};
  
    cy.nodes().forEach(function (node) {
      var nodeId = node.id();
  
      if (nodeId !== startNodeId) {
        result[nodeId] = [];
        result[nodeId].push({ c: Infinity, iNode: startNodeId, opt: false });
      } else {
        result[nodeId] = [];
        result[nodeId].push({ c: 0, iNode: startNodeId, opt: true });
      }
    });
  
    console.log('Valores iniciales de la matriz:', result);
  
    return result;
  }
  

  

  // Función para retornar el nodo siguiente a analizar (más optimo)
  // Función para obtener el siguiente nodo óptimo
// Función para retornar el nodo siguiente a analizar (más optimo)
function getOptimalNode(result) {
  var minCost = Infinity;
  var optimalNode = null;

  // Encuentra el nodo con el menor costo no óptimo
  cy.nodes().forEach(function (node) {
    var nodeId = node.id();

    if (!result[nodeId][0].opt && result[nodeId][0].c < minCost) {
      minCost = result[nodeId][0].c;
      optimalNode = nodeId;
    }
  });

  if (optimalNode !== null) {
    result[optimalNode][0].opt = true;
  }

  return optimalNode;
}




// Resto del código...

// Función de Dijkstra
const dijkstra = function (graph, start) {
  var distances = [];
  for (var i = 0; i < graph.length; i++) distances[i] = Infinity;
  distances[start] = 0;

  var visited = [];

  while (true) {
      var shortestDistance = Infinity;
      var shortestIndex = -1;

      for (var i = 0; i < graph.length; i++) {
          if (distances[i] < shortestDistance && !visited[i]) {
              shortestDistance = distances[i];
              shortestIndex = i;
          }
      }

      console.log("Visiting node " + shortestIndex + " with current distance " + shortestDistance);

      if (shortestIndex === -1) {
          return distances;
      }

      for (var i = 0; i < graph[shortestIndex].length; i++) {
          if (graph[shortestIndex][i] !== 0 && distances[i] > distances[shortestIndex] + graph[shortestIndex][i]) {
              distances[i] = distances[shortestIndex] + graph[shortestIndex][i];
              console.log("Updating distance of node " + i + " to " + distances[i]);
          }
      }

      visited[shortestIndex] = true;
      console.log("Visited nodes: " + visited);
      console.log("Currently lowest distances: " + distances);
  }
};

// Resto del código...



  document.getElementById('edgeWeightButton').addEventListener('click', guardarPeso);
  document.getElementById('editEdgeWeightButton').addEventListener('click', editaristabutton);
  document.getElementById('addNodeButton').addEventListener('click', addNode);
  document.getElementById('saveEdgeWeightButton').addEventListener('click', editEdgeWeight);
  document.getElementById('deleteSelectedNode').addEventListener('click', deleteSelectedElement);
  document.getElementById('runDijkstraAlgorithmButton').addEventListener('click', runDijkstraAlgorithm);
  
})