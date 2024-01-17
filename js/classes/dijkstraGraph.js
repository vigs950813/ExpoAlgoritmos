class DijkstraGraph {

    constructor(startNodeId, totalNodes) {
        let firstState = new State();
        firstState.visitedNodes.push(startNodeId);
        this.states = [firstState];
        this.totalNodes = totalNodes;
        this.startNodeId = startNodeId;
        this.tableResult = {};
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
        }
        this.pushState(action);
    }

    addVisitedNode(nodeId) {
        let action = (nextState) => {
            nextState.visitedNodes.push(nodeId);
            nextState.availableEdges = [];
            nextState.selectedEdges = [];
        }
        this.pushState(action);
    }

    cloneLastState() {
        return structuredClone(this.lastState());
    }

    lastState() {
        return this.states[this.states.length - 1];
    }

    isAvailable(edge) {
        let isUsed = this.lastState().usedEdges.some((usedEdge) => usedEdge.id === edge.id);
        let createsCycle = this.lastState().visitedNodes.includes(edge.source) && this.lastState().visitedNodes.includes(edge.target);
        return !isUsed && !createsCycle;
    }

    isDone() {
        return this.lastState().visitedNodes.length >= this.totalNodes;
    }

    stateType(index) {
        if (index == 0)
            return "initial";

        let currentState = this.states[i];
        let previousState = this.states[i - 1];

        if (currentState.availableEdges.length > previousState.availableEdges.length)
            return "availableEdges";
        else if (currentState.visitedNodes.length > previousState.visitedNodes.length)
            return "visitedNode";
        else if (currentState.usedEdges.length > previousState.usedEdges.length)
            return "usedEdge";
    }

    getStepsDescriptionsAt(index) {
        if (index < 0 || index >= this.states.length)
            return;

        let descriptions = [`<b>El nodo inicial es ${this.startNodeId}</b><br>`];

        for (let i = 1; i <= index; i++) {
            let currentState = this.states[i];
            let previousState = this.states[i - 1];

            let step = `<b>Paso ${i} | </b>`;

            if (currentState.availableEdges.length > previousState.availableEdges.length) {
                let string = `<li>${currentState.availableEdges.join('</li><li>')}</li>`;
                step += `Identificar las aristas disponibles<br><ul class="availableEdge">${string}</ul>`;
            }
            else if (currentState.visitedNodes.length > previousState.visitedNodes.length) {
                let string = currentState.visitedNodes[currentState.visitedNodes.length - 1];
                step += `El nodo óptimo es <b>${string}</b><br>`;
            }
            else if (currentState.usedEdges.length > previousState.usedEdges.length) {
                let string = currentState.usedEdges[currentState.usedEdges.length - 1];
                step += `Agregar la arista <span class="usedEdge">${string}</span><br> ------------------------------------------- <br>`;
            }

            descriptions.push(step);
        }

        return descriptions;
    }

    getTableAt(index) {
        if (index < 0 || index >= this.lastState().visitedNodes.length)
            return;

        var tbl = document.getElementById("dijkstraTable");
        if (tbl) tbl.parentNode.removeChild(tbl);
        let table = document.createElement('table');
        table.id = "dijkstraTable"
        let thead = document.createElement('thead');
        let tbody = document.createElement('tbody');
        let tableResult = this.tableResult;
        let visitedNodes = this.lastState().visitedNodes;
        table.appendChild(thead);
        table.appendChild(tbody);


        var i = 0;
        let header = document.createElement('tr');
        let hNodeName = document.createElement('th');
        hNodeName.innerHTML += `NODE`;
        header.appendChild(hNodeName);
        while (i < cy.nodes().length) {
            let h = document.createElement('th');
            h.innerHTML += `${i + 1}`;
            header.appendChild(h);
            i++;
        }
        thead.appendChild(header);
        // console.log("entro aquí")

        function insertRow(node) {
            i = 0;
            let row = document.createElement('tr');
            let headerNode = document.createElement('td');
            headerNode.innerHTML += `(${node.id()})`;
            row.appendChild(headerNode);
            while (i <= index) {
                // console.log("tableResult index: ", tableResult[node.id()][i])
                let r = document.createElement('td');
                if (node.id() == visitedNodes[i]) {
                    // if(node.id() == nodesAlreadyMarked[i]) {
                    r.className = "nodo-optimo";
                }
                r.innerHTML += `(${tableResult[node.id()][i].c}, ${tableResult[node.id()][i].iNode})`;
                row.appendChild(r);
                i++;
            }
            while (i < cy.nodes().length) {
                let r = document.createElement('td');
                r.innerHTML += `----`;
                row.appendChild(r);
                i++;
            }
            tbody.appendChild(row);
        }

        cy.nodes().forEach((node) => insertRow(node));

        return table;
    }
}