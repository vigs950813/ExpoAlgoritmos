document.addEventListener('DOMContentLoaded', function(){
    var cy = cytoscape({
      container: document.getElementById('cy'),
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(id)',
            'width': 10,
            'height': 10
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'label': 'data(label)' // Estilo para el texto de la arista
          }
        },
        {
          selector: '.selected',
          style: {
            'border-width': 1,
            'border-color': 'red'
          }
        }
      ]
    });
  
    var selectedNodeId = null;
    var selectedEdgeId = null;
  
    // Función para agregar un nuevo nodo
    function addNode() {
      var newNodeId = document.getElementById('newNodeId').value;
  
      if (newNodeId.trim() !== '') {
        // Agregar el nuevo nodo al grafo
        cy.add({ data: { id: newNodeId } });
        
        // Centrar el nodo recién agregado en el contenedor
        cy.fit();
        
        // Limpiar el campo de entrada
        document.getElementById('newNodeId').value = '';
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
    cy.on('tap', 'node', function(event){
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
    cy.on('tap', 'edge', function(event){
      var edge = event.target;
  
      // Guardar el ID de la arista seleccionada
      selectedEdgeId = edge.id();
    });
  
    // Manejar clic en un área vacía del grafo para limpiar la selección
    cy.on('tap', function(event){
      if (event.target === cy) {
        cy.nodes().removeClass('selected');
        selectedNodeId = null;
        selectedEdgeId = null;
      }
    });
  
    // Asociar las funciones a los botones
    document.getElementById('addNodeButton').addEventListener('click', addNode);
    document.getElementById('addEdgeButton').addEventListener('click', addEdge);
    document.getElementById('editEdgeWeightButton').addEventListener('click', editEdgeWeight);
    document.getElementById('deleteSelectedNode').addEventListener('click', deleteSelectedNode);
  });
  