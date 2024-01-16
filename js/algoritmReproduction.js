let playing = false;
let stateIndex = 0;
let cy;
let states = [];
let descriptions = [];

function showStateAt(stateIndex) {
  let algorithmStepsDiv = document.getElementById('algorithmSteps');
  
  let currentState = states[stateIndex];
  algorithmStepsDiv.innerHTML += descriptions[stateIndex];
  if (stateIndex == descriptions.length - 1)
    algorithmStepsDiv.innerHTML += "<b>Fin del algoritmo</b>";
  cy.edges().removeClass('selected-edge');
  cy.edges().removeClass('available-edge');

  cy.edges().forEach(function (edge) {
    if (currentState.usedEdges.some((usedEdge) => usedEdge.id === edge.id())) {
      edge.addClass('mst');
      edge.removeClass('not-in-mst');
    }
    else if (currentState.selectedEdges.some((selectedEdge) => selectedEdge.id === edge.id()))
      edge.addClass('selected-edge');
    else if (currentState.availableEdges.some((availableEdge) => availableEdge.id === edge.id()))
      edge.addClass('available-edge');

  });

  cy.nodes().forEach(function (node) {
    if (currentState.visitedNodes.includes(node.id()))
      node.addClass('visited-node');
    else
      node.removeClass('visited-node');
  });
}

function startReproduction(_cy, _states, _descriptions) {
  cy = _cy;
  states = _states;
  descriptions = _descriptions;
  stateIndex = 0;
  playing = true;
  play();
}

function play() {
  if (playing && stateIndex < states.length) {
    showStateAt(stateIndex);
    stateIndex++;
    setTimeout(play, 1000);
  }
}

//Acciones para botones de reproduccion ----------------------------------
document.getElementById('pause-btn').addEventListener('click', () => {
  playing = false;
});

document.getElementById('play-btn').addEventListener('click', () => {
  playing = true;
  play();
});


