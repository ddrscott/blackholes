import React, { useState } from 'react';
import Matter from 'matter-js';
import {config as map} from '../components/maps.js';
import {Howl, Howler} from 'howler';
import styled from 'styled-components';

import {ragdoll} from '../components/ragdoll.js'

const SAVED_STATS = ['score', 'total_clicks'];

const Overlay = styled.section`
  text-shadow: 2px 2px 10px #000;
  position: absolute;
  width: 100%;
  z-index: 10;
  text-align: right;
  padding: 0.5em;
  user-select: none;
  pointer-events: none;
`

const Score = styled.span`
  font-size: 1.5em;
`;

export class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      engine: null,
      render: null,
      score: 0,
      bonus_per_second: 1,
      bonus_delay: 1000,
      bonus_delay_inc: 50,
      bonus_delay_decay: 0.5,
      total_clicks: 0,
      generating: false,
      bonus_size: 8,
      cheat: false,
      transform_scale: 1,
    };
  }

  componentDidMount() {

    this.setupMatter();

    const url = window.location.href
    if (url.indexOf('cheat') > -1) {
      this.setState({cheat: true});
    }
  }

  setupMatter() {
    if (this.state.engine) {
      return;
    }
    var Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Bodies = Matter.Bodies;

    // create an engine
    var engine = Engine.create(); 
    // react-measure
    // 800 x 480 Out[3]: 1.7777777777777777
    let {height} = this.props;
    let width = height * 0.6; // 800 x 480
    let thickness = 100;

    const {innerWidth, innerHeight} = window;

    let heightRatio = innerHeight / height,
        widthRatio = innerWidth / width,
        transform_scale = 1;
    if (heightRatio <= widthRatio && heightRatio < 1) {
      transform_scale = heightRatio;
    }
    if (widthRatio <= heightRatio && widthRatio < 1) {
      transform_scale = widthRatio;
    }
    if (transform_scale < 1) {
      this.setState({transform_scale});
    }

    // create a renderer
    var render = Render.create({
        element: this.el,
        engine: engine,
        options: {
          background: map.background,
          width: width,
          height: height,
          //showAngleIndicator: true,
          // showCollisions: true,
          // showVelocity: true,
          wireframes: false,
          // showVelocity: true,
          // showCollisions: true,
          // showSeparations: true,
          // showAxes: true,
          // showPositions: true,
          // showAngleIndicator: true,
          // showIds: true,
          // showShadows: true,
          // showVertexNumbers: true,
          // showConvexHulls: true,
          // showInternalEdges: true,
          // showMousePosition: true,
        }
    });

    // Matter.Bodies.rectangle(x, y, width, height, [options]) -> Body
    var top =    Bodies.rectangle(width / 2, thickness / -2 + 1,      width, thickness, { isStatic: true });
    var bottom = Bodies.rectangle(width / 2, height + (map.y_increment * 2) + (thickness * 0.5), width, thickness, { isStatic: true });
    var left =   Bodies.rectangle( thickness / -2, height / 2,      thickness, height, { isStatic: true });
    var right =  Bodies.rectangle( width + thickness / 2, height / 2 - 1,  thickness, height, { isStatic: true });

    this.buildMap(engine.world, map);

    // add all of the bodies to the world
    World.add(engine.world, [bottom, left, right]);

    // add mouse control
    var mouse = Matter.Mouse.create(render.canvas),
        mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 1,
                render: { visible: false }
            }
        });

    Matter.Events.on(mouseConstraint, 'mouseup', (event) => {
      map.onMouseUp.bind(this)(event.mouse.position);
      this.state.bonus_delay - this.state.bonus_delay_inc
      let {total_clicks, bonus_delay, bonus_delay_inc} = this.state;
      total_clicks = total_clicks + 1;
      bonus_delay = bonus_delay - bonus_delay_inc;
      if (bonus_delay < 1)
        bonus_delay = 1;
      this.setState({total_clicks, bonus_delay})
    });
    World.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // setup audio
    const pings = map.audio.pings.map((src) => new Howl({src}));

    // an example of using collisionStart event on an engine
    const PING_VOLUME_CLIP = Math.pow(8, 4);

    const goalIdx = {};
    for (const goal of Object.values(map.goals)) {
      for (const body of goal.bodies) {
        goalIdx[body.id] = goal;
      }
    }

    Matter.Events.on(engine, 'collisionStart', (event) => {
      var pairs = event.pairs;
      for (const pair of pairs) {
        if (pair.bodyA.isStatic || pair.bodyB.isStatic) {
          map.onPeg.bind(this)(pair.bodyA, pair.bodyB);
        }

        let goal = pair.bodyA.isSensor && goalIdx[pair.bodyA.id];
        if (goal) {
          goal.onCollision(this, pair.bodyB); 
        }
        
        let volume = Math.pow(pair.bodyB.speed, 3) / PING_VOLUME_CLIP;
        volume = volume > 1 ? 1 : volume;
        if (volume > 0.01) {
          const sound = Matter.Common.choose(pings);
          //const sound = new Howl({src, volume: (volume > 1 ? 1 : volume)});
          sound.volume(volume, sound.play())
        }
        if (pair.bodyA === bottom) {
          map.onBottom.bind(this)(pair.bodyB);
          Matter.Composite.remove(engine.world, pair.bodyB);
        }
      }
    });


    // start evertying
    Render.run(render);
    Engine.run(engine);

    this.loadSavedState();
    this.setState({render, engine})
  }

  loadSavedState() {
    for (const key of SAVED_STATS) {
      let value = parseInt(localStorage.getItem(key) || '0');
      this.setState({[key]: value});
    }
  }

  saveSavesState() {
    for (const key of SAVED_STATS) {
      localStorage.setItem(key, this.state[key]);
    }
  }

  onStart() {
    if (this.state.generating) {
      // already started
      return;
    }
    this.setState({generating: true});

    let bonus_generator = () => {
      if (!document.hidden) {
        map.onBonus(this);
      }
      window.setTimeout(bonus_generator, this.state.bonus_delay );
    };
    bonus_generator();

    setInterval(() => this.onSecond(), 1000);
  }

  addBody(body) {
    Matter.World.add(this.state.engine.world, body)
  }

  onSecond() {
    this.saveSavesState();

    let {bonus_delay, bonus_delay_decay} = this.state;

    bonus_delay = bonus_delay + (bonus_delay * bonus_delay_decay);
    if (bonus_delay > 1000)
      bonus_delay = 1000;
    this.setState({bonus_delay});
  }

  buildMap(world, {layout, x_increment, y_increment}) {
    let y = 0;
    let lines = layout.split("\n");
    lines.splice(0,1);
    for (const line of lines) {
      let x = 0;
      for (const c of line) {
        const obj = map.statics[c]
        if (obj) {
          Matter.World.add( world, obj(x, y));
        }
        x += x_increment;
      }
      y += y_increment;
    }
  }

  componentWillUnmount() {
    const {render, engine} = this.state;

    Howler.stop();
    Matter.Render.stop(render);
    Matter.Events.off(engine);
    Matter.Engine.clear(engine);
  }

  calcBonusPerSecond() {
    return (1000/this.state.bonus_delay).toFixed(1);
  }

  render() {
    return (
    <div style={{transform: `scale(${this.state.transform_scale})`}} onClick={() => this.onStart() }>
      <Overlay>
        <Score>{this.state.score.toLocaleString()}</Score>
        <div><small>Bonus/Second:</small> {this.calcBonusPerSecond()}</div>
        <div><small>Clicks:</small> {this.state.total_clicks.toLocaleString()}</div>
      </Overlay>
      <div ref={el => this.el = el} />
      { this.state.cheat &&
        <div><small>Bonus Size:</small>
          <input
            type="number" 
            min="1"
            max="100"
            value={this.state.bonus_size}
            onChange={(e) => this.setState({bonus_size: e.target.value})}
          />
        </div>
      }
      <style jsx>{`
        position: relative;
        transform-origin: top;
      `}</style>
    </div>
    );
  }
}
