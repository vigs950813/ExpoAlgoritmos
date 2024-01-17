class Edge {
    constructor(edge) {
        this.id = edge.id();
        this.source = edge.source().id();
        this.target = edge.target().id();
        this.weight = edge.data('weight');
    }

    toString() {
        let start = this.source < this.target ? this.source : this.target;
        let end = this.source < this.target ? this.target : this.source;
        return `${start} - ${end} (${this.weight})`;
    }
}