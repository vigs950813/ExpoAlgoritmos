class Edge {
    constructor(source, target, weight) {
        this.source = source;
        this.target = target;
        this.weight = weight;
    }

    toString() {
        return `${this.source} -> ${this.target} (${this.weight})`;
    }

    juanito() {
        return "juanito";
    }
}