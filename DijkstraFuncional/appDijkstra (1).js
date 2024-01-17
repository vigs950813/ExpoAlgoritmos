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
          'background-color': '#627A93',
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
          'line-color': 'rgb(0, 116, 255)',
          'target-arrow-color': 'rgb(0, 116, 255)',
          'label': 'data(weight)'
        }
      },
      {
        selector: '.selected-edge',
        style: {
          'line-color': 'rgb(61, 126, 122)',
          'target-arrow-color': 'rgb(61, 126, 122)',
          'label': 'data(weight)'
        }
      },
      {
        selector: '.available-edge',
        style: {
          'line-color': 'rgb(255, 0, 0)',
          'target-arrow-color': 'rgb(255, 0, 0)',
          'label': 'data(weight)'
        }
      },
      {
        selector: '.visited-node',
        style: {
          'background-color': '#007EFF'
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

  /*  DIJKSTRA ALGORITHM  */
  function runDijkstraAlgorithm() {
    var startNodeId = document.getElementById('startNodeId').value.trim().toUpperCase();
    var startNodeIdInput = document.getElementById('startNodeId');
    clearError(errorContainer,startNodeIdInput);
    var endNodeId = "D"
    if (cy.getElementById(startNodeId).nonempty()) {
      cy.edges().removeClass('mst');
      cy.edges().removeClass('not-in-mst');
      runDijkstraAlgorithmFromNode(startNodeId, endNodeId);
    } else {

      showError("El nodo de inicio no existe en el grafo.",errorContainer,startNodeIdInput);
    }
  }

  function runDijkstraAlgorithmFromNode(startNodeId, endNodeId){
    var dijkstraStepsDiv = document.getElementById('algorithmStepsDijkstra');
    dijkstraStepsDiv.innerHTML = '';
    console.log("Soy el algoritmo Dijkstra");
    var adjacencyList = getAdjacencyList();
    var tableResult = {}
    var result = initValues(startNodeId, tableResult);
    var node = result[startNodeId].slice()[0];
    var optNodeId = startNodeId;
    var total_nodes = 0;
    var nodesAlredyMarked = [];

    /* ANALISIS PRINCIPAL DEL ALGORITMO */
    while(total_nodes < cy.nodes().length){
      console.log("optimalNode: ", optNodeId)
      console.log("optNode info: ", "(", node.c, ", ", node.iNode, ", ", node.opt, ")");
      adjacencyList[optNodeId].forEach(function (tNode) {
        if(!nodesAlredyMarked.includes(tNode.target)){
          console.log(":: Analizando nodo adyacente: (", tNode.weight, ", ", tNode.target, ")");
          cost = node.c + tNode.weight;
          console.log(":: Suma del costo: ", cost)
          if(result[tNode.target][0].c == -1 || (result[tNode.target][0].c > cost)){
            console.log(":::: Si es mejor que el anterior")
            result[tNode.target][0].c = cost;
            result[tNode.target][0].iNode = optNodeId;
          }
        }
      });
      console.log(":: tableResult: ", tableResult);
      saveResult(tableResult, result, nodesAlredyMarked);
      nodesAlredyMarked.push(optNodeId)
      optNodeId = getOptimalNode(result);
      if(optNodeId == null){
        break;
      }
      node = result[optNodeId].slice()[0];
      total_nodes++;
    }
    saveResult(tableResult, result, nodesAlredyMarked);
    index = 0;
    console.log(tableResult)
    //BUENOOO
    /*
    while(index < cy.nodes().length){
      cy.nodes().forEach(function (node) {
        dijkstraStepsDiv.innerHTML += `${node.id()}: -- (${tableResult[node.id()][index].c}, ${tableResult[node.id()][index].iNode},  ${tableResult[node.id()][index].opt}) --`;
        console.log(tableResult[node.id()][index].c, tableResult[node.id()][index].iNode, tableResult[node.id()][index].opt);
      });
      dijkstraStepsDiv.innerHTML += `<br>`
      index++;
    }
    */
  
    function buildTableResult(index){
      var tbl = document.getElementById("dijkstraTable");
      if(tbl) tbl.parentNode.removeChild(tbl);
      let table = document.createElement('table');
      table.id = "dijkstraTable"
      let thead = document.createElement('thead');
      let tbody = document.createElement('tbody');
      table.appendChild(thead);
      table.appendChild(tbody);
      //dijkstraStepsDiv.innerHTML = '';
      //dijkstraStepsDiv.innerHTML = `<table id="dijkstraTable">`
      var i = 0;
      // Encabezado de la tabla
      //dijkstraStepsDiv.innerHTML = `<tr>`;
      let header = document.createElement('tr');
      let hNodeName = document.createElement('th');
      hNodeName.innerHTML += `NODE`;
      header.appendChild(hNodeName);
      while(i < cy.nodes().length){
        let h = document.createElement('th');
        h.innerHTML += `${i+1}`;
        header.appendChild(h);
        i++;
      }
      thead.appendChild(header);
      console.log("entro aquí")
      cy.nodes().forEach(function (node) {
        i = 0;
        let row = document.createElement('tr');
        let headerNode = document.createElement('td');
        headerNode.innerHTML += `(${node.id()})`;
        row.appendChild(headerNode);
        while(i <= index) {
          console.log("tableResult index: ", tableResult[node.id()][i])
          let r = document.createElement('td');
          if(node.id() == nodesAlredyMarked[i]) {
            r.className = "nodo-optimo";
          }
          r.innerHTML += `(${tableResult[node.id()][i].c}, ${tableResult[node.id()][i].iNode})`;
          row.appendChild(r);
          i++;
        }
        while(i < cy.nodes().length) {
          let r = document.createElement('td');
          r.innerHTML += `----`;
          row.appendChild(r);
          i++;
        }
        tbody.appendChild(row);
      });
      dijkstraStepsDiv.appendChild(table);
    }

    function showTableResult(nodeID, index) {
      console.log("NODE ID: ", nodeID, " index: ", index);
      cy.edges().removeClass('available-edge');
      console.log("EDGES ID'S")
      cy.edges().forEach(function (edge) {
        console.log(edge.id())
        //if((nodeID == edge.source().id()) || nodeID == edge.target().id()){
        //  edge.addClass('available-edge');
        //}
      });
      var m = 0;
      let alreadyMarked = [];
      while(m <= index){
        alreadyMarked.push(nodesAlredyMarked[m]);
        m++;
      }
      adjacencyList[nodeID].forEach(function (tNode) {
        console.log(":::::: ", nodeID, ", ", tNode.edgeID)
        if(!alreadyMarked.includes(tNode.target)){
          console.log("SI PASE");
          cy.edges().forEach(function (edge) {
            console.log(edge.id())
            if(edge.id() == tNode.edgeID){
              console.log("LO ENCONTRE!")
              edge.addClass('available-edge');
            }
            //if((nodeID == edge.source().id()) || nodeID == edge.target().id()){
            //edge.addClass('available-edge');
            //}
          });
          //console.log("SI PASE")
          //cy.edges()[tNode.edgeID].addClass('available-edge');
        }
      });
      cy.nodes().forEach(function (node) {
        if (alreadyMarked.includes(node.id()))
          node.addClass('visited-node');
      });
      /*aqui construimos nuestra tabla resultado*/
      buildTableResult(index);
      if(index+1 == cy.nodes().length){
        cy.edges().removeClass('available-edge');
        return;
      }
      setTimeout(() => showTableResult(nodesAlredyMarked[index+1], index+1), 1000);
    }

    showTableResult(startNodeId, 0);
  }

  function getAdjacencyList() {
    var adjacencyList = {};

    cy.nodes().forEach(function (node) {
      var nodeId = node.id();
      adjacencyList[nodeId] = [];

      node.connectedEdges().forEach(function (edge) {
        var targetNodeId = edge.target().id();
        var weight = edge.data('weight');
        if(node.id() != targetNodeId){
          adjacencyList[nodeId].push({ target: targetNodeId, weight: parseInt(weight), edgeID: edge.id() }); 
        } else {
          adjacencyList[nodeId].push({ target: edge.source().id(), weight: parseInt(weight), edgeID: edge.id() }); 
        }
      });
    });

    return adjacencyList;
  }

  function initValues(startNodeId, tableResult) {
    var result = {};
    result
    cy.nodes().forEach(function (node) {
      var nodeId = node.id();
      tableResult[nodeId] = []
      if (nodeId != startNodeId) {
        result[nodeId] = [];
        result[nodeId].push({ c: -1, iNode: startNodeId, opt: false });
      } else {
        result[nodeId] = [];
        result[nodeId].push({ c: 0, iNode: startNodeId, opt: true });
      }
    });
    return result;
  }

  // Función para retornar el nodo siguiente a analizar (más optimo)
  function getOptimalNode(result) {
    result_cleaned = {}
    // Limpiamos el arreglo: tomamos solo valores con un costo real y nodos no óptimos
    cy.nodes().forEach(function (node) {
      if ((result[node.id()][0].opt == false) && result[node.id()][0].c > -1) {
        result_cleaned[node.id()] = result[node.id()].slice();
      }
    });
    // convertimos el objeto en array
    final_result = Object.keys(result_cleaned).map(
      (key) => { return [key, result_cleaned[key]] });
    if(final_result.length == 0){
      return null;
    }
    //  Ordenamos el arreglo
    final_result.sort(
      (first, second) => { return first[1][0].c - second[1][0].c }
    );
    // Marcamos como más optimo el nodo con costo más barato
    result[final_result[0][0]][0].opt = true
    return final_result[0][0];
  }

  function saveResult(tableResult, result, nodesAlredyMarked) {
    cy.nodes().forEach(function (node) {
      if(nodesAlredyMarked.includes(node.id())){
        tableResult[node.id()].push( {c: '--', iNode: '--', opt: '--'} );
      } else {
        tableResult[node.id()].push(Object.assign({}, result[node.id()][0]));
      }
    });
  }

  document.getElementById('edgeWeightButton').addEventListener('click', guardarPeso);
  document.getElementById('editEdgeWeightButton').addEventListener('click', editaristabutton);
  document.getElementById('addNodeButton').addEventListener('click', addNode);
  document.getElementById('saveEdgeWeightButton').addEventListener('click', editEdgeWeight);
  document.getElementById('deleteSelectedNode').addEventListener('click', deleteSelectedElement);
  document.getElementById('runDijkstraAlgorithmButton').addEventListener('click', runDijkstraAlgorithm);
});