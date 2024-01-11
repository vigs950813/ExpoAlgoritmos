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

      // Crear los IDs únicos para ambas direcciones de la arista
      var edgeId1 = selectedNodeId + node.id();
      var edgeId2 = node.id() + selectedNodeId;

      // Buscar la arista existente en ambas direcciones
      var existingEdge1 = cy.getElementById(edgeId1);
      var existingEdge2 = cy.getElementById(edgeId2);

      if (existingEdge1.nonempty()) {
        // La arista ya existe en la dirección seleccionada
        existingEdge1.data('weight', edgeWeight);
      } else if (existingEdge2.nonempty()) {
        // La arista ya existe en la dirección inversa
        existingEdge2.data('weight', edgeWeight);
      } else {
        // La arista no existe en ninguna dirección, agrégala al grafo
        cy.add({ data: { id: edgeId1, source: selectedNodeId, target: node.id(), weight: edgeWeight } });
      }

      // Guardar el ID de la arista recién creada o actualizada
      selectedEdgeId = edgeId1;

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
  //_________________________________________Funciones de ALgoritmo Prim______________________________________--
  // Lógica del algoritmo de Prim
  function runPrimAlgorithm() {
    var startNodeId = document.getElementById('startNodeId').value.trim().toUpperCase();
    var startNodeIdInput = document.getElementById('startNodeId');
    clearError(errorContainer, startNodeIdInput);
    if (cy.getElementById(startNodeId).nonempty()) {
      cy.edges().removeClass('mst');
      cy.edges().removeClass('not-in-mst');
      altRunPrimFromNode(startNodeId);
    } else {

      showError("El nodo de inicio no existe en el grafo.", errorContainer, startNodeIdInput);
    }

  }


  function altRunPrimFromNode(startNodeId) {
    let primStepsDiv = document.getElementById('primSteps');
    primStepsDiv.innerHTML = '';

    let edgesInMST = [];
    let includedNodes = new Set();
    includedNodes.add(startNodeId);

    function getAvailableEdges() {
      var edges = [];

      includedNodes.forEach(function (nodeId) {
        cy.getElementById(nodeId).connectedEdges().forEach(function (edge) {
          let _edge = { "source": edge.source().id(), "target": edge.target().id(), "weight": edge.data("weight") };
          var adjacentNodeId = _edge.target === nodeId ? _edge.source : _edge.target;

          if (!includedNodes.has(adjacentNodeId))
            edges.push(_edge);
        })
      });

      return edges;
    }

    function nextStep() {
      let availableEdges = getAvailableEdges();
      if (availableEdges.length === 0)
        return;

      let minEdge = altFindMinEdge(availableEdges);
      cy.getElementById(minEdge.source + minEdge.target).addClass('considering-edge');

      setTimeout(() => {
        cy.getElementById(minEdge.source + minEdge.target).removeClass('considering-edge');
        cy.getElementById(minEdge.source + minEdge.target).addClass('mst');
        edgesInMST.push(minEdge);

        let unvisitedNodeId = includedNodes.has(minEdge.source) ? minEdge.target : minEdge.source;
        let visitedNodeId = minEdge.source === unvisitedNodeId ? minEdge.target : minEdge.source;
        primStepsDiv.innerHTML += `Paso ${includedNodes.size}: Agregar arista ${visitedNodeId} - ${unvisitedNodeId} <br>`;
        console.log(visitedNodeId + " -> " + unvisitedNodeId);
        includedNodes.add(unvisitedNodeId);

        showMST(edgesInMST);

        if (includedNodes.size < cy.nodes().length) {
          setTimeout(() => {
            cy.getElementById(minEdge.source + minEdge.target).removeClass('mst');
            nextStep();
          }, 1000);
        } else {
          primStepsDiv.innerHTML += '<b>Resultado final:</b><br>';
          edgesInMST.forEach(function (edge) {
            primStepsDiv.innerHTML += `Arista ${edge.source} - ${edge.target}<br>`;
          });

          cy.edges().forEach(function (edge) {
            if (!edgesInMST.some(e => e.source === edge.source().id() && e.target === edge.target().id())) {
              edge.addClass('not-in-mst');
            }
          });
        }
      }, 1000);

    }

    nextStep();
  }

  function altFindMinEdge(edges) {
    if (edges.length === 0) return null;

    let minEdge = edges[0];
    edges.forEach(function (edge) {
      if (edge.weight < minEdge.weight || (edge.weight === minEdge.weight && edge.source + edge.target < minEdge.source + minEdge.target))
        minEdge = edge;
    });
    return minEdge;
  }

  function runPrimAlgorithmFromNode(startNodeId) {
    var primStepsDiv = document.getElementById('primSteps');
    primStepsDiv.innerHTML = '';

    var adjacencyList = getAdjacencyList();
    var includedNodes = new Set();
    var edgesInMST = [];

    includedNodes.add(startNodeId);

    function runNextStep() {
      var minEdge = findMinEdge(adjacencyList, includedNodes);

      if (minEdge) {
        cy.getElementById(minEdge.source + minEdge.target).addClass('considering-edge');

        setTimeout(function () {
          includedNodes.add(minEdge.target);

          cy.getElementById(minEdge.source + minEdge.target).removeClass('considering-edge');
          cy.getElementById(minEdge.source + minEdge.target).addClass('mst');

          edgesInMST.push(minEdge);

          //primStepsDiv.innerHTML += `${includedNodes.size}: Arista seleccionada ${minEdge.source} - ${minEdge.target} <br>`;

          primStepsDiv.innerHTML += `Paso ${includedNodes.size}: Agregar arista ${minEdge.source} - ${minEdge.target} <br>`;

          showMST(edgesInMST);

          if (includedNodes.size < cy.nodes().length) {
            setTimeout(function () {
              cy.getElementById(minEdge.source + minEdge.target).removeClass('mst');
              runNextStep();
            }, 1000);
          } else {
            //primStepsDiv.innerHTML += '<br style="font-family: Arial, sans-serif;>Resultado final:<br>';
            primStepsDiv.innerHTML += '<br style="font-family: Arial, sans-serif;>Resultado final:<br>';
            edgesInMST.forEach(function (edge) {
              primStepsDiv.innerHTML += `Arista ${edge.source} - ${edge.target}<br>`;
            });

            cy.edges().forEach(function (edge) {
              if (!edgesInMST.some(e => e.source === edge.source().id() && e.target === edge.target().id())) {
                edge.addClass('not-in-mst');
              }
            });
          }
        }, 1000);
      }
    }

    runNextStep();
  }

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

  function getAdjacencyList() {
    var adjacencyList = {};

    cy.nodes().forEach(function (node) {
      var nodeId = node.id();
      //Elementos adyacentes al nodo
      adjacencyList[nodeId] = [];

      node.connectedEdges().forEach(function (edge) {
        var targetNodeId = edge.target().id();
        var weight = edge.data('weight');
        adjacencyList[nodeId].push({ target: targetNodeId, weight: weight });
      });
    });

    return adjacencyList;
  }

  function findMinEdge(adjacencyList, includedNodes) {
    var minEdge = null;

    includedNodes.forEach(function (nodeId) {
      var edges = adjacencyList[nodeId];

      edges.forEach(function (edge) {
        if (!includedNodes.has(edge.target) && (!minEdge || edge.weight < minEdge.weight || (edge.weight === minEdge.weight && edge.source + edge.target < minEdge.source + minEdge.target))) {
          minEdge = { source: nodeId, target: edge.target, weight: edge.weight };
        }
      });
    });

    return minEdge;
  }

  function showMST(edgesInMST) {
    cy.edges().removeClass('mst');

    edgesInMST.forEach(function (edge) {
      cy.getElementById(edge.source + edge.target).addClass('mst');
      cy.getElementById(edge.target + edge.source).addClass('mst');
    });
  }


  // Event listeners
  document.getElementById('edgeWeightButton').addEventListener('click', guardarPeso);
  document.getElementById('editEdgeWeightButton').addEventListener('click', editaristabutton);
  document.getElementById('addNodeButton').addEventListener('click', addNode);
  document.getElementById('saveEdgeWeightButton').addEventListener('click', editEdgeWeight);
  document.getElementById('deleteSelectedNode').addEventListener('click', deleteSelectedElement);
  document.getElementById('runPrimAlgorithmButton').addEventListener('click', runPrimAlgorithm);

});
