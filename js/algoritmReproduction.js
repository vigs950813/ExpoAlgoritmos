let playing = false;
let stateIndex = 0;
let cy;
let states = [];
let descriptions = [];

class Button {
  constructor(id) {
    this.id = id;
    this.element = document.getElementById(id);
    this.disable();
  }

  show() {
    this.element.style.display = "block";
  }

  hide() {
    this.element.style.display = "none";
  }

  enable() {
    this.element.classList.remove('disabled');
  }

  disable() {
    this.element.classList.add('disabled');
  }
}

let buttons = {
  'play': new Button('play-btn'),
  'pause': new Button('pause-btn'),
  'next': new Button('next-btn'),
  'previous': new Button('prev-btn'),
  'replay': new Button('replay-btn'),
  'forward': new Button('forward-btn')
};

let enableButtons = () => { Object.values(buttons).forEach((button) => button.enable()); }
let disableButtons = () => { Object.values(buttons).forEach((button) => button.disable()); }
buttons.pause.hide();



function showStateAt(stateIndex) {
  let algorithmStepsDiv = document.getElementById('algorithmSteps');
  let currentDescription = descriptions.slice(0, stateIndex + 1).join('');
  algorithmStepsDiv.innerHTML = currentDescription;
  
  let currentState = states[stateIndex];
  if (stateIndex == descriptions.length - 1)
    algorithmStepsDiv.innerHTML += "<b>Fin del algoritmo</b>";

  cy.nodes().removeClass('visited-node');

  cy.edges().addClass('not-in-mst');
  cy.edges().removeClass('mst');
  cy.edges().removeClass('selected');
  cy.edges().removeClass('selected-edge');
  cy.edges().removeClass('available-edge');

  cy.edges().forEach(function (edge) {
    if (currentState.usedEdges.some((usedEdge) => usedEdge.id === edge.id())) {
      edge.addClass('mst');
      edge.removeClass('not-in-mst');
    }
    else if (currentState.selectedEdges.some((selectedEdge) => selectedEdge.id === edge.id())) {
      edge.addClass('selected-edge');
      edge.removeClass('not-in-mst');
    }
    else if (currentState.availableEdges.some((availableEdge) => availableEdge.id === edge.id())) {
      edge.addClass('available-edge');
      edge.removeClass('not-in-mst');
    }

  });

  cy.nodes().forEach(function (node) {
    if (currentState.visitedNodes.includes(node.id()))
      node.addClass('visited-node');
  });

  enableButtons();

  if (stateIndex == 0) {
    buttons.previous.disable();
    buttons.replay.disable();
  }
  else if (stateIndex == states.length - 1) {
    buttons.next.disable();
    buttons.forward.disable();
  }
}

function startReproduction(_cy, _states, _descriptions) {
  cy = _cy;
  states = _states;
  descriptions = _descriptions;
  stateIndex = -1;
  disableButtons();
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
  buttons.pause.hide();
  buttons.play.show();
}
buttons.pause.element.addEventListener('click', clickPause);

function clickPlay() {
  if (stateIndex == states.length - 1)
    return;

  playing = true;
  buttons.play.hide();
  buttons.pause.show();
  play();
}
buttons.play.element.addEventListener('click', clickPlay);

buttons.next.element.addEventListener('click', () => {
  clickPause();
  stateIndex = stateIndex < states.length - 1 ? stateIndex + 1 : stateIndex;
  showStateAt(stateIndex);
});

buttons.previous.element.addEventListener('click', () => {
  clickPause();
  stateIndex = stateIndex > 0 ? stateIndex - 1 : 0;
  showStateAt(stateIndex);
});

buttons.replay.element.addEventListener('click', () => {
  clickPause();
  stateIndex = 0;
  showStateAt(stateIndex);
});

buttons.forward.element.addEventListener('click', () => {
  clickPause();
  stateIndex = states.length - 1;
  showStateAt(stateIndex);
});
