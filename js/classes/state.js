class State {
    constructor() {
        this.availableEdges = [];
        this.selectedEdges = [];
        this.usedEdges = [];
        this.visitedNodes = [];
        
        this.rejectedEdge = null;
        this.cycledEdges = [];
    }
}