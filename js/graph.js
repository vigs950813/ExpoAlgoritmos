class Graph {

    constructor(startNodeId) {
        let firstState = new State();
        firstState.visitedNodes.push(startNodeId);
        this.states = [firstState];
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
        let action = (nextState) => nextState.usedEdges.push(edge);
        this.pushState(action);
    }

    addVisitedNode(nodeId) {
        let action = (nextState) => nextState.visitedNodes.push(nodeId);
        this.pushState(action);
    }


    pushClearState() {
        let action = (nextState) => {
            nextState.availableEdges = [];
            nextState.selectedEdges = [];
        }
        this.pushState(action);
    }

    cloneLastState() {
        return structuredClone(this.states[this.states.length - 1]);
    }

    lastStateToString() {
        let last = this.states[this.states.length - 1];
        let n1 = last.visitedNodes.length > 0 ? last.visitedNodes[0].constructor.name : "vacío";
        let n2 = last.availableEdges.length > 0 ? last.availableEdges[0].constructor.name : "vacío";
        let n3 = last.selectedEdges.length > 0 ? last.selectedEdges[0].constructor.name : "vacío";
        let n4 = last.usedEdges.length > 0 ? last.usedEdges[0].constructor.name : "vacío";
        console.log(`${n1}, ${n2}, ${n3}, ${n4}`);
        return `visitedNodes: ${last.visitedNodes}\navailableEdges: ${last.availableEdges}\nselectedEdges: ${last.selectedEdges}\nusedEdges: ${last.usedEdges}`;
    }

}