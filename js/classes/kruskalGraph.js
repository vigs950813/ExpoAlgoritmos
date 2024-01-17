class KruskalGraph {

    constructor(totalNodes) {
        this.states = [];
        this.totalNodes = totalNodes;
        this.disjointSet = {};
    }

    //Disjoint set methods------------------------------

    tryAddToDisjointSet(nodeId) {
        if (!this.disjointSet[nodeId]) this.disjointSet[nodeId] = nodeId;
    }

    find(nodeId) {
        if (this.disjointSet[nodeId] !== nodeId) {
            this.disjointSet[nodeId] = this.find(this.disjointSet[nodeId]);
        }
        return this.disjointSet[nodeId];
    }

    union(nodeA, nodeB) {
        var rootA = this.find(nodeA);
        var rootB = this.find(nodeB);
        this.disjointSet[rootA] = rootB;
    }

    //States methods-----------------------------------

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

    setRejectedEdge(rejEdge) {
        let action = (nextState) => {
            nextState.rejectedEdge = rejEdge;
            nextState.cycledEdges.push(rejEdge);
        }
        this.pushState(action);
    }

    addUsedEdge(edge) {
        let action = (nextState) => {
            this.union(edge.source, edge.target);
            nextState.usedEdges.push(edge);
            nextState.availableEdges = [];
            nextState.selectedEdges = [];
            nextState.rejectedEdge = null;
        }
        this.pushState(action);
    }

    addVisitedNode(nodeId) {
        let action = (nextState) => nextState.visitedNodes.push(nodeId);
        this.pushState(action);
    }

    cloneLastState() {
        let lastStateIndex = this.states.length - 1;
        if (lastStateIndex < 0)
            return new State();
        else
            return structuredClone(this.states[lastStateIndex]);
    }

    isAvailable(edge) {
        let lastStateIndex = this.states.length - 1;
        if (lastStateIndex < 0)
            return true;

        let isIncluded = this.states[lastStateIndex].usedEdges.some((usedEdge) => usedEdge.id === edge.id);   
        let isCycled = this.states[lastStateIndex].cycledEdges.some((usedEdge) => usedEdge.id === edge.id);
        return !isIncluded && !isCycled;
    }

    isDone() {
        let lastStateIndex = this.states.length - 1;
        if (lastStateIndex < 0)
            return false;

        let allNodesVisited = this.states[lastStateIndex].visitedNodes.length >= this.totalNodes;
        let allNodesConected = () => {
            let firstNodeId = this.states[lastStateIndex].visitedNodes[0];
            return this.states[lastStateIndex].visitedNodes.every((nodeId, i) => {
                if (i == 0)
                    return true;
                else
                    return this.find(nodeId) === this.find(firstNodeId);
            });
        };

        return allNodesVisited && allNodesConected();
    }

    getStepsDescriptions() {
        let descriptions = [];

        for (let i = 0; i < this.states.length; i++) {
            let currentState = this.states[i];
            let previousState = i > 0 ? this.states[i - 1] : null;

            let step = `<b>Paso ${i + 1} | </b>`;

            if (i == 0 || currentState.availableEdges.length > previousState.availableEdges.length) {
                let string = `<li>${currentState.availableEdges.join('</li><li>')}</li>`;
                step += `Identificar las aristas disponibles<br><ul class="availableEdge">${string}</ul>`;
            }
            else if (currentState.selectedEdges.length > previousState.selectedEdges.length) {
                let string = `<li>${currentState.selectedEdges.join('</li><li>')}</li>`;
                step += `Seleccionar la arista de menor peso que no haya sido probada antes<br><ul class="selectedEdge">${string}</ul>`;
            }
            else if (currentState.rejectedEdge != null) {
                let string = currentState.rejectedEdge;
                step += `Forma un ciclo, descartar la arista <span class="rejectedEdge">${string}</span><br>`;
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