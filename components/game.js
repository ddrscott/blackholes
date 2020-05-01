import Phaser from 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import localForage from "localforage";
import PropTypes from 'prop-types';
import React from 'react';
import {Toolbar, TOOLS} from '../components/toolbar';
import {ScoreBoard} from '../components/score-board';
import Board from '../lib/board';
import Preload from '../lib/preload';
import {MainMenu} from '../components/main-menu';


const natural = {
    width: 480,
    height: 800
};


class Game extends React.Component {

    constructor(props) {
        super(props);

        const fetchInt = (key) => {
            let n = parseInt(localStorage.getItem(key) || 0);
            return isNaN(n) ? 0 : n;
        }

        this.state = {
            tool: TOOLS[0],
            score: fetchInt('score'),
            logs: 'Loading...',
            showMenu: true,
            started: false,
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
            // dom: {
            //     createContainer: true
            // },
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
                autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
            },
            disableContextMenu: true,
            scene: [Preload, Board],
            plugins: {
                scene: [{
                    key: 'rexUI',
                    plugin: RexUIPlugin,
                    mapping: 'rexUI'
                },
                ]
            }
        });
        this.game.getState = (k) => this.state[k];
        this.game.scene.start('preload', {stage: map});

        this.game.events.on('score', (score) => this.setState({score}));
        this.game.events.on('logs', (logs) => this.setState({logs}));
        this.game.scale.on('resize', () => this.resizeContainer());

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState !== 'visible') {
                this.setState({showMenu: true});
            }
        });
        this.resizeContainer();
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
        // this.game.scene.restart();
    }

    resizeContainer() {
        window.setTimeout(() => {
            const canvasStyle = document.querySelector('#phaser canvas').getAttribute("style");
            document.querySelector('.game').setAttribute("style", canvasStyle);
        }, 10);
    }

    restartScene() {
        this.setState({
            showMenu: false,
            started: true,
        });
        this.game.scene.stop('preload', {stage: this.props.map});
        this.game.scene.start('preload', {stage: this.props.map});
        this.game.scene.stop('board', {stage: this.props.map});
        this.game.scene.start('board', {stage: this.props.map});
    }

    togglePause() {
        this.setState({showMenu: !this.state.showMenu});
    }

    render() {
        if (this.game && this.game.scene) {
            if (this.state.showMenu) {
                this.game.scene.pause('board');
            } else {
                this.game.scene.resume('board');
            }
        }
        return <div className="game no-select">
            <ScoreBoard
                title={this.props.map.name}
                score={this.state.score}
                logs={this.state.logs}
                onClick={() => {
                    this.setState({showMenu: !this.state.showMenu})
                }}
            />
            <MainMenu
                active={this.state.showMenu}
                onRestart={() => this.restartScene()}
            >
                {this.state.started && (
                    <button onClick={() => this.togglePause()} onTouchEnd={() => this.togglePause()}>
                        Resume
                    </button>
                )}
                <button onClick={() => this.restartScene()} onTouchEnd={() => this.restartScene()}>
                    {this.state.started ? 'Restart' : 'Start'}
                </button>
            </MainMenu>
            {!this.state.showMenu && this.state.started && <Toolbar className="no-select" onChange={(tool) => this.setState({tool})} /> }
        </div>
    }
}

Game.propTypes = {
    map: PropTypes.object.isRequired
};

export default Game;
