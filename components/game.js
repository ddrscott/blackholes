import React  from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Phaser from 'phaser';
import Board from '../lib/board';

const BONUS = {
    inc: 100,
    decay: 0.25
}

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
            bonus_size: 8,
            cheat: false,
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
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            disableContextMenu: true,
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


    componentWillUnmount() {
        this.game.scene.restart();
    }

    render() {
        return (
            <div>
                <div ref={el => this.el = el} id="phaser-game" style={{'zIndex': 1}}/>
                <style jsx>{`
                  position: relative;
                  transform-origin: top;
                `}</style>
            </div>
        );
    }
}

Game.propTypes = {
    map: PropTypes.object
};

export default Game;
