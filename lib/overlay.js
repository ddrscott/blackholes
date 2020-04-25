import Phaser from 'phaser';
import {COLORS, FONT_FAMILY} from '../lib/colors';

export default class Overlay extends Phaser.Scene {
    constructor() {
        super({
            key: 'overlay',
            active: true,
        })
    }
    preload() {
        this.load.html('score-panel', '/score-panel.html')
    }

    create() {
        this.input.enabled = false;

        const x_increment = 16,
            y_increment = 25;

        const {width} = this.game.config;

        this.stats_text = this.add.text(0, y_increment * 1.75, '', {
            align: 'right', 
            fontSize: '14px',
            fontFamily: 'Nine Pin',
            fixedWidth: width - x_increment/2,
        });
        
        this.scorePanel = this.add.dom(0, 0).createFromCache('score-panel').setOrigin(0);
        this.scoreElm = this.scorePanel.node.querySelector('.score');
        this.stageElm = this.scorePanel.node.querySelector('.stage');
        this.statsElm = this.scorePanel.node.querySelector('.stats');

        this.scorePanel.on('click', () => {
            console.log('touched!!!!!!!!!!!!!1');
        });
    }

    setScore(score) {
        this.scoreElm.innerText = score;
    }

    setStage(name) {
        this.stageElm.innerText = name;
    }

    setStats(text) {
        this.statsElm.innerText = text;
    }
}
