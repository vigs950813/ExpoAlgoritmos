class Edge {
    constructor(id, source, target, weight) {
        this.id = id;
        this.source = source;
        this.target = target;
        this.weight = weight;
    }

    toString() {
        let start = this.source < this.target ? this.source : this.target;
        let end = this.source < this.target ? this.target : this.source;
        return `${start} - ${end} (${this.weight})`;
    }
}