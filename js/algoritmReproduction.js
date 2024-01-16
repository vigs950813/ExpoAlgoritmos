let playing = false;
let stateIndex = 0;
let cy;
let states = [];
let descriptions = [];

let buttons = {
  'play': document.getElementById('play-btn'),
  'pause': document.getElementById('pause-btn'),
  'next': document.getElementById('next-btn'),
  'previous': document.getElementById('prev-btn'),
  'replay': document.getElementById('replay-btn')
}
clickPause();


function showStateAt(stateIndex) {
  let algorithmStepsDiv = document.getElementById('algorithmSteps');
  let currentDescription = descriptions.slice(0, stateIndex + 1).join('');
  algorithmStepsDiv.innerHTML = currentDescription;
  
  let currentState = states[stateIndex];
  if (stateIndex == descriptions.length - 1)
    algorithmStepsDiv.innerHTML += "<b>Fin del algoritmo</b>";

  cy.nodes().removeClass('visited-node');
  cy.edges().removeClass('mst');
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
  });
}

function startReproduction(_cy, _states, _descriptions) {
  cy = _cy;
  states = _states;
  descriptions = _descriptions;
  stateIndex = -1;
  clickPlay();
}

function play() {
  if (playing && stateIndex + 1 < states.length) {
    stateIndex++;
    showStateAt(stateIndex);

    if (stateIndex == states.length - 1)
      clickPause();
    else
      setTimeout(play, 1000);
  }
}

//Acciones para botones de reproduccion ----------------------------------
function clickPause() {
  playing = false;
  deactivateButton(buttons.pause);
  activateButton(buttons.play);
}
buttons.pause.addEventListener('click', clickPause);

function clickPlay() {
  if (stateIndex == states.length - 1)
    return;

  playing = true;
  deactivateButton(buttons.play);
  activateButton(buttons.pause);
  play();
}
buttons.play.addEventListener('click', clickPlay);

buttons.next.addEventListener('click', () => {
  clickPause();
  stateIndex = stateIndex < states.length - 1 ? stateIndex + 1 : stateIndex;
  showStateAt(stateIndex);
});

buttons.previous.addEventListener('click', () => {
  clickPause();
  stateIndex = stateIndex > 0 ? stateIndex - 1 : 0;
  showStateAt(stateIndex);
});

buttons.replay.addEventListener('click', () => {
  clickPause();
  stateIndex = 0;
  showStateAt(stateIndex);
});



function activateButton(button) {
  button.style.display = "block";
}

function deactivateButton(button) {
  button.style.display = "none";
}
