import Matter from 'matter-js'
import {ragdoll} from '../components/ragdoll.js'

const {circle, rectangle, polygon} = Matter.Bodies;
const {random} = Matter.Common;
const constraint = Matter.Constraint.create;

const staticProps = {
  isStatic: true,
  render: {fillStyle: '#8F671F'}
}

const CONSTRAINED_PROPS = {
  restitution: 0.9,
  density:  0.5,
  friction: 0.01,
  frictionAir: 0.01,
  frictionStatic: 0,
  render: {fillStyle: '#8F671F'}
}


const DEFAULT_PUCK_BODY = {
  restitution: 0.4,
  density:  1,
  friction: 0.25,
  frictionAir: 0,
  frictionStatic: 0.25,
  render: {
    lineWidth: 3,
    strokeStyle: '#6F471F',
  }
}

const x_increment = 16,
      y_increment = 25;

class Goal {
  constructor({bonus}) {
    this.bonus = bonus;
    this.bodies = [];
  }

  createBody(add, x, y) {
    const body = add.rectangle(x + x_increment/2, y + y_increment * 0.3, x_increment * 2, y_increment, {
      isStatic: true,
      isSensor: true,
      render: {
        fillStyle: 'transparent',
        strokeStyle: '#999',
        lineWidth: 3,
        collisionFillStyle: '#383',
        text: {
          font: '16px monospace',
          fillStyle: '#333',
          fillText: this.bonus + "x"
        }
      }
    });
    this.bodies.push(body);
    return body;
  }

  onCollision(game, otherBody) {
    let {score, render} = game.state;
    const points =  Math.round(this.bonus * Math.sqrt(otherBody.area));
    game.setState({score: score + points});
  }
}

const GOALS = {
  'A': new Goal({bonus: 100}),
  'B': new Goal({bonus: 10}),
  'C': new Goal({bonus: 5}),
  'D': new Goal({bonus: 2}),
  'E': new Goal({bonus: 1}),
}

export const config = {
  x_increment,
  y_increment,
  puck: {
    diameter: 10,
    //diameter: 18,
    body: DEFAULT_PUCK_BODY,
  },
  background: "transparent",
  layout: '',
  statics: {
    'o': (add, x,y) => add.circle(x, y, x_increment/2 - (random() / 10 ), staticProps),
    'O': (add, x,y) => add.circle(x, y, x_increment * 0.8 - (random() / 10 ), staticProps),
    '|': (add, x,y) => add.rectangle(x, y, x_increment/2, y_increment+1, staticProps),
    'i': (add, x,y) => {
                    add.circle(x, y - y_increment / 4, 4, staticProps),
                    add.rectangle(x, y + y_increment * 0.3, 8, 12.5, staticProps)
                  },
    '^': (add, x,y) => {
       let poly = add.polygon(x, y, 3, x_increment - random(), {
         angle: 35.08,
         ...CONSTRAINED_PROPS
       });
       add.worldConstraint(poly, 0, 1, {pointA: {x, y}});
    }
    ,
    'A': (add, x,y) => GOALS['A'].createBody(add, x,y),
    'B': (add, x,y) => GOALS['B'].createBody(add, x,y),
    'C': (add, x,y) => GOALS['C'].createBody(add, x,y),
    'D': (add, x,y) => GOALS['D'].createBody(add, x,y),
    'E': (add, x,y) => GOALS['E'].createBody(add, x,y),
  },
  goals: GOALS,
  audio: {
    pings: [
      '/audio/wood-01.mp3',
      '/audio/wood-02.mp3',
      '/audio/wood-03.mp3',
      '/audio/wood-04.mp3',
      '/audio/wood-05.mp3',
      '/audio/wood-06.mp3',
    ]
  },
  onBonus(game) {
    const {m_render} = game;
    const {bonus_size} = game.state,
          {width} = m_render.options,
          off_center = x_increment*5,
          ball_x = width / 2 + random(off_center) - (off_center / 2);
    game.addBody(circle(ball_x, 0 - 50, bonus_size, DEFAULT_PUCK_BODY));
  },
  onBottom(body) {
  },
  onPeg(bodyA, bodyB) {
  },
  onMouseUp(game, {x, y}) {
    var diameter = 16;
    const {m_render} = game;
    const {width} = m_render.options;
    game.addBody(circle(x, -diameter, diameter - random(), DEFAULT_PUCK_BODY));
  }
}
