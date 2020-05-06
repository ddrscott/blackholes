import Phaser from 'phaser';
import {COLORS, FONT_SERIF} from '../lib/colors';

export default class Preload extends Phaser.Scene {
    constructor() {
        super({
            key: 'preload',
        })
    }

    init(options) {
        this.nextOptions = options;
    }

    preload() {
        for (const url of BACKGROUNDS) {
            this.load.image(url, url);
        }
        this.load.on('complete', () => {
            this.game.scene.pause('board', this.nextOptions);
        });
    }

    create() {
        const {width, height} = this.game.config,
            bgUrl = BACKGROUNDS[0],
            bgImage = this.textures.get(bgUrl).getSourceImage();

        this.background = this.add.tileSprite(0, 
            0, 
            width,
            height,
            bgUrl
        ).setOrigin(0).setTileScale(height / bgImage.height)
    }

    update(time) {
        this.background.tilePositionY = parseInt(-time/200);
    }
}

const BACKGROUNDS = [
    'images/raphael-nogueira-svbDI1Pq30s-unsplash.jpg'
]
