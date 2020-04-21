export default class Ticker {
    constructor(slots) {
        this.total = 0;
        this.by_second = new Uint32Array(slots);
        this.slot = 0;
        this.per_second = 0.0;
    }

    add(value) {
        this.total += value;
        this.by_second[this.slot] += value;
    }

    onSecond() {
        this.per_second = this.by_second.reduce((a,b) => a + b, 0) / this.by_second.length;
        this.slot = (this.slot + 1) % this.by_second.length;
        this.by_second[this.slot] = 0;
    }
}
