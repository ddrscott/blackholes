import Phaser from 'phaser';

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
        this.load.image('bamboo', 'bamboo-bg.jpg');
        this.load.on('complete', () => {
            this.game.scene.start('board', this.nextOptions);
        });
    }

    create() {
        const {width, height} = this.game.config;

        this.add.image(0, 0, 'bamboo').setOrigin(0).setScale(width/450, height/450);

        this.add.text(0, height, ' Droppings', {
            fontFamily: '\'Sorts Mill Goudy\', serif',
            fontSize: 80,
            color: '#EAD297',
            align: 'center',
        }).setOrigin(0, 0)
           .setAngle(-90)
           .setStroke('#FFFF', 16)
           .setAlpha(.3);
    }
}