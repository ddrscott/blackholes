import Phaser from 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import PropTypes from 'prop-types';
import React from 'react';
import {Toolbar, TOOLS} from '../components/toolbar';
import Board from '../lib/board';
import Overlay from '../lib/overlay';
import Preload from '../lib/preload';



const natural = {
    width: 480,
    height: 800
};

class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tool: TOOLS[0]
        };
    }

    setupPhaser() {
        const {map} = this.props;

        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            parent: 'phaser',
            // width: natural.width > window.innerWidth ? window.innerWidth : natural.width,
            // height: natural.height > window.innerHeight ? window.innerHeight : natural.height,
            // width: natural.width * window.devicePixelRatio,
            // height: natural.height * window.devicePixelRatio,
            ...natural,
            dom: {
                createContainer: true
            },
            physics: {
                default: 'matter',
                matter: {
                    plugins: {
                        attractors: true,
                    }
                }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
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
        this.game.getState = (k) => this.state[k]
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
            <>
                <div id="phaser">
                    <Toolbar className="no-select"
                        onChange={(tool) => this.setState({tool})}
                    />
                </div>
            </>
        );
    }
}

Game.propTypes = {
    map: PropTypes.object.isRequired
};

export default Game;
