class PrimGraph {

    constructor(startNodeId, totalNodes) {
        let firstState = new State();
        firstState.visitedNodes.push(startNodeId);
        this.states = [firstState];
        this.totalNodes = totalNodes;
        this.startNodeId = startNodeId;
    }

    pushState(action) {
        let nextState = this.cloneLastState();
        action(nextState);
        this.states.push(nextState);
    }

    setAvailableEdges(avEdges) {
        let action = (nextState) => nextState.availableEdges = avEdges;
        this.pushState(action);
    }

    setSelectedEdges(selEdges) {
        let action = (nextState) => nextState.selectedEdges = selEdges;
        this.pushState(action);
    }

    addUsedEdge(edge) {
        let action = (nextState) => {
            nextState.usedEdges.push(edge);
            nextState.availableEdges = [];
            nextState.selectedEdges = [];
        }
        this.pushState(action);
    }

    addVisitedNode(nodeId) {
        let action = (nextState) => nextState.visitedNodes.push(nodeId);
        this.pushState(action);
    }

    cloneLastState() {
        return structuredClone(this.states[this.states.length - 1]);
    }

    isDone() {
        return this.states[this.states.length - 1].visitedNodes.length >= this.totalNodes;
    }

    getStepsDescriptions() {
        let descriptions = [`<b>El nodo inicial es ${this.startNodeId}</b><br>`];

        for (let i = 1; i < this.states.length; i++) {
            let currentState = this.states[i];
            let previousState = this.states[i - 1];

            let step = `<b>Paso ${i} | </b>`;

            if (currentState.availableEdges.length > previousState.availableEdges.length) {
                let string = `<li>${currentState.availableEdges.join('</li><li>')}</li>`;
                step += `Identificar las aristas disponibles<br><ul class="availableEdge">${string}</ul>`;
            }
            else if (currentState.selectedEdges.length > previousState.selectedEdges.length) {
                let string = `<li>${currentState.selectedEdges.join('</li><li>')}</li>`;
                step += `Separar las aristas con menor peso<br><ul class="selectedEdge">${string}</ul>`;
            }
            else if (currentState.usedEdges.length > previousState.usedEdges.length) {
                let string = currentState.usedEdges[currentState.usedEdges.length - 1];
                step += `Agregar la arista <span class="usedEdge">${string}</span><br>`;
            }
            else if (currentState.visitedNodes.length > previousState.visitedNodes.length) {
                let string = currentState.visitedNodes[currentState.visitedNodes.length - 1];
                step += `Agregar el nodo <b>${string}</b><br> ------------------------------------------- <br>`;
            }

            descriptions.push(step);
        }

        return descriptions;
    }

}