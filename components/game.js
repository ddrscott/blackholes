import React  from 'react';
import PropTypes from 'prop-types';

import Phaser from 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import Board from '../lib/board';
import Preload from '../lib/preload';
import Overlay from '../lib/overlay';

const natural = {
    width: 480,
    height: 800
};

class Game extends React.Component {

    setupPhaser() {
        const {map} = this.props;

        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            parent: 'body',
            // width: natural.width > window.innerWidth ? window.innerWidth : natural.width,
            // height: natural.height > window.innerHeight ? window.innerHeight : natural.height,
            // width: natural.width * window.devicePixelRatio,
            // height: natural.height * window.devicePixelRatio,
            ...natural,
            fps: 60,
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
            scene: [Preload, Board, Overlay],
            plugins: {
                scene: [{
                    key: 'rexUI',
                    plugin: RexUIPlugin,
                    mapping: 'rexUI'
                },
                ]
            }
        });
        console.log(this.game.config);
        this.game.canvas.oncontextmenu = (e) => e.preventDefault();
        this.game.scene.start('preload', {stage: map});
    }

    componentDidMount() {
        const url = window.location.href
        if (url.indexOf('cheat') > -1) {
            this.setState({cheat: true});
        }
        this.setupPhaser();
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
            <></>
        );
    }
}

Game.propTypes = {
    map: PropTypes.object
};

export default Game;
