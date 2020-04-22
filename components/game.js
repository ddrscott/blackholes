import React  from 'react';
import PropTypes from 'prop-types';

import Phaser from 'phaser';
import Board from '../lib/board';
import Preload from '../lib/preload';
import Overlay from '../lib/overlay';

class Game extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const url = window.location.href
        if (url.indexOf('cheat') > -1) {
            this.setState({cheat: true});
        }
        this.setupPhaser();
    }

    setupPhaser() {
        const {map} = this.props,
            natural = {width: 480, height: 800};

        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            parent: 'phaser-game',
            width: natural.width > window.innerWidth ? window.innerWidth : natural.width,
            height: natural.height > window.innerHeight ? window.innerHeight : natural.height,
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
            scene: [Preload, Board, Overlay]
        });
        this.game.canvas.oncontextmenu = (e) => e.preventDefault();
        this.game.scene.start('preload', {stage: map});
    }
  
    componentDidUpdate({map}) {
        if (map !== this.props.map) {
            this.game.scene.start('board', {stage: this.props.map});
        }
    }


    componentWillUnmount() {
        this.game.scene.restart();
    }

    render() {
        return (
        <>
            <div ref={el => this.el = el} id="phaser-game" style={{'zIndex': 1}}/>
        </>
        );
    }
}

Game.propTypes = {
    map: PropTypes.object
};

export default Game;
