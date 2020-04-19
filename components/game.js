import dynamic from 'next/dynamic'
import React, { useState } from 'react';
import Matter from 'matter-js';
import {Howl, Howler} from 'howler';
import styled from 'styled-components';

import Phaser from 'phaser';
import Board from '../lib/board';

const {Engine, World, Bodies, Render} = Matter;

const SAVED_STATS = ['score', 'total_clicks'];

const BONUS = {
    inc: 100,
    decay: 0.25
}

const Overlay = styled.section`
    text-shadow: 0px 0px 8px #333;
    position: absolute;
    // background: rgba(0, 0, 0, 0.3);
    width: auto;
    right: 0;
    z-index: 10;
    text-align: right;
    padding: 0.25em .5em;
    user-select: none;
    pointer-events: none;
`

const Underlay = styled.section`
    position: absolute;
    top: 0; left: 0; bottom: 0; right: 0;
    padding: 0.25em;
    user-select: none;
    pointer-events: none;
    height: 800px; /* FIXME we shouldn't need this! */
`

const Score = styled.span`
    font-size: 1.5em;
`;

const Title = styled.h1`
    color: #B78E49;
    font-weight: bold;
    margin: 0;
    padding: 0 .5em;
    opacity: 0.75;
    text-align: left;
`
const MapName = styled.div`
    ----webkit-text-stroke: 1px #B78E49;
    font-size: 1.5em;
    font-family: sans-serif;
    font-weight: 900;
    padding: 0;
    margin-left: .25em;
    margin-top: -2.2em;
    text-align: left;
    transform: rotate(-15deg);
    opacity: 0.75;
    color: #511;
`

const MapSup = styled.sup`
    -webkit-text-stroke: 0;
    font-size: .5em;
    margin-bottom: -.5em;
    display: block;
`

class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            score: 0,
            bonus_delay: 500,
            total_clicks: 0,
            clicks_per_second: 0,
            bonus_size: 8,
            cheat: false,
            transform_scale: 1,
        };
    }

    componentDidMount() {
        const url = window.location.href
        if (url.indexOf('cheat') > -1) {
            this.setState({cheat: true});
        }
        this.setupPhaser();
    }

    setupPhaser() {
        const {map} = this.props;

        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-game',
            width: 480,
            height: 800,
            transparent: true,
            physics: {
                default: 'matter',
                matter: {
                    debug: false
                }
            },
            scene: [Board]
        }

        this.game = new Phaser.Game(config);
        this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
        this.game.scene.start('main', {stage: map, component: this});
    }

    componentDidUpdate({map}) {
        if (map != this.props.map) {
            this.game.scene.start('main', {stage: this.props.map, component: this});
        }
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
        const {map} = this.props;

        if (this.on_second_interval) {
            return;
        }
        this.on_second_interval = setInterval(() => this.onSecond(), 1000);

        // setup audio
        this.pings = map.audio.pings.map((src) => new Howl({src}));

        let bonus_generator = () => {
            if (!document.hidden) {
                map.onBonus(this);
            }
            window.setTimeout(bonus_generator, this.state.bonus_delay );
        };
        bonus_generator();
    }

    onSecond() {
        this.saveSavesState();

        let {bonus_delay} = this.state;

        bonus_delay = bonus_delay + (bonus_delay * BONUS.decay);
        if (bonus_delay > 1000)
            bonus_delay = 1000;
        this.setState({bonus_delay});
    }

    componentWillUnmount() {
        if (this.on_second_interval) {
            clearInterval(this.on_second_interval);
            delete this.on_second_interval;
        }
    }

    calcBonusPerSecond() {
        return (1000/this.state.bonus_delay).toFixed(1);
    }

    render() {
        const {map} = this.props;

        return (
            <div style={{transform: `scale(${this.state.transform_scale})`}}>
                <Overlay>
                    <Score>{this.state.score.toLocaleString()}</Score>
                    <div><small>Bonus/Second:</small> {this.calcBonusPerSecond()}</div>
                    <div><small>Clicks:</small> {this.state.total_clicks.toLocaleString()}</div>
                </Overlay>
                <div ref={el => this.el = el} id="phaser-game" style={{'zIndex': 1}}/>
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
                <Underlay style={{background: map.background}}>
                    <Title>Droppings</Title>
                    <MapName><MapSup>map</MapSup>{map.name}</MapName>
                </Underlay>
                <style jsx>{`
                  position: relative;
                  transform-origin: top;
                  max-width: 480px;
                `}</style>
            </div>
        );
    }
}

export default Game;
