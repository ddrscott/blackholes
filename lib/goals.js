const IDLE_COLOR = '#FFF';
const HIT_COLOR = '#151';

export const CONFIG = {
    'A': {
        bonus: 100,
    },
    'B': {
        bonus: 25,
    },
    'C': {
        bonus: 10,
    },
    'D': {

        bonus: 5,
    },
    'E': {
        bonus: 1,
    },
}

export function onHitStart({config, board, other, poly, component}) {
    poly.text.setColor(HIT_COLOR);
    const points = parseInt(other.area * config.bonus);
    const score = parseInt(component.state.score + points);
    component.setState({score});
    console.log(poly);
    board.bubbleText(poly.x, poly.y, "+" + points);
}

export function onHitEnd({poly}) {
    poly.text.setColor(IDLE_COLOR);
}

// this.emitter.explode(1, x, y);


