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
    console.log("Soy el algoritmo Dijkstra");
  }

  document.getElementById('edgeWeightButton').addEventListener('click', guardarPeso);
  document.getElementById('editEdgeWeightButton').addEventListener('click', editaristabutton);
  document.getElementById('addNodeButton').addEventListener('click', addNode);
  document.getElementById('saveEdgeWeightButton').addEventListener('click', editEdgeWeight);
  document.getElementById('deleteSelectedNode').addEventListener('click', deleteSelectedElement);
  document.getElementById('runDijkstraAlgorithmButton').addEventListener('click', runDijkstraAlgorithm);
});