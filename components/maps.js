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

  createBody(x, y) {
    const body = rectangle(x + x_increment/2, y + y_increment * 0.3, x_increment * 2, y_increment, {
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
    'o': (x,y) => circle(x, y, x_increment/2 - (random() / 10 ), staticProps),
    'O': (x,y) => circle(x, y, x_increment * 0.8 - (random() / 10 ), staticProps),
    '|': (x,y) => rectangle(x, y, x_increment/2, y_increment+1, staticProps),
    'i': (x,y) => [
                    circle(x, y - y_increment / 4, 4, staticProps),
                    rectangle(x, y + y_increment * 0.3, 8, 12.5, staticProps)
                  ],
    '^': (x,y) => {
       let poly = polygon(x, y, 3, x_increment - random(), {
         angle: 35.08,
         ...CONSTRAINED_PROPS
       });
       return [poly, constraint({ pointA: {x, y}, bodyB: poly, length: 0 })];
    }
    ,
    'A': (x,y) => GOALS['A'].createBody(x,y),
    'B': (x,y) => GOALS['B'].createBody(x,y),
    'C': (x,y) => GOALS['C'].createBody(x,y),
    'D': (x,y) => GOALS['D'].createBody(x,y),
    'E': (x,y) => GOALS['E'].createBody(x,y),
  },
  goals: GOALS,
  audio: {
    pings: [
      '/audio/wood-01.flac',
      '/audio/wood-02.flac',
      '/audio/wood-03.flac',
      '/audio/wood-04.flac',
      '/audio/wood-05.flac',
      '/audio/wood-06.flac',
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
