import Phaser from 'phaser';
import {COLORS, FONT_FAMILY} from '../lib/colors';

export default class Overlay extends Phaser.Scene {
    constructor() {
        super({
            key: 'overlay',
            active: true,
        })
    }

    // init(options) { }

    // preload() { }

    create() {
        this.input.enabled = false;

        const x_increment = 16,
            y_increment = 25;

        const {width} = this.game.config;

        this.add.text(0, 0, 'score', {
            align: 'right', 
            color: COLORS.darkHex,
            fontSize: 12,
            fontFamily: FONT_FAMILY,
            fixedWidth: width - x_increment/2,
        });

        this.score_text = this.add.text(0, y_increment/2, '0', {
            align: 'right', 
            color: COLORS.darkHex,
            fontSize: 24,
            fontFamily: FONT_FAMILY,
            fixedWidth: width - x_increment/2,
        });

        this.stats_text = this.add.text(0, y_increment * 1.75, 'Click anywhere to Start', {
            align: 'right', 
            fontSize: '14px',
            fontFamily: FONT_FAMILY,
            fixedWidth: width - x_increment/2,
        });
    }
}
