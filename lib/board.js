import Phaser from 'phaser';
import * as goals from '../lib/goals';

const random = () => Phaser.Math.RND.frac();

export default class Board extends Phaser.Scene {
    constructor() {
        super('main')
    }

    init({stage, component}) {
        this.stage = stage;
        this.score = 0;
        this.component = component;
    }

    preload() {
        for (const img of IMAGES) {
            this.load.image(img, `images/${img}.png`);
        }

        this.load.image('bamboo', 'bamboo-bg.jpg');
        this.load.atlas('pucks', 'images/round_nodetailsOutline.png', 'images/round_nodetailsOutline.json');

        for (const mp3 of PINGS) {
            this.load.audio(mp3, [`audio/${mp3}.mp3`]);
        }
    }

    create() {
        const {game, stage} = this;

        this.matter.world.setBounds(0, -200, game.config.width, game.config.height + 300);

        this.generateTextures();

        this.buildStage(stage);

        this.input.on("pointerdown", ({x,y}) => {
            this.lastPointerX = x;
            this.addDrop(x);
            // this.add.tween(text).to( { alpha: 1 }, 1000, "Linear", true);
        });

        this.input.keyboard.on('keyup-SPACE', () => {
            this.addDrop(this.lastPointerX);
        });

        this.matter.add.pointerConstraint({length: 0});

        this.floor = this.matter.add.rectangle(
            0, game.config.height + stage.y_increment * 3,
            game.config.width * 10, stage.y_increment * 4,
            {isStatic: true}
        );

        this.pings = {};
        for (const name of PINGS) {
            this.pings[name] = this.sound.add(name).setVolume(0.5);
        }

        this.matter.world.on('collisionstart', (event) => {
            var pairs = event.pairs;
            for (const pair of pairs) {
                if (pair.bodyA === this.floor) {
                    if (pair.bodyB.gameObject) {
                        pair.bodyB.gameObject.destroy();
                    }
                    continue;
                }

                if (Math.sqrt(pair.collision.depth) > 1 && pair.bodyA.gameObject && pair.bodyA.gameObject.sound) {
                    this.pings[pair.bodyA.gameObject.sound].play();
                }

                if (pair.bodyA.gameObject && pair.bodyA.gameObject.onHitStart) {
                    pair.bodyA.gameObject.onHitStart(pair.bodyB);
                }
                continue;

                let goal = pair.bodyA.isSensor && goalIdx[pair.bodyA.id];
                if (goal) {
                    goal.onCollision(this, pair.bodyB); 
                    let rend = pair.bodyA.render;
                    if (rend.collisionFillStyle) {
                        rend.fillStyleRestore = rend.fillStyleRestore || rend.fillStyle;
                        rend.fillStyle = rend.collisionFillStyle;
                    }
                }

                if (this.pings) {
                    let volume = Math.sqrt(pair.collision.depth) / 100;
                    volume = volume > 1 ? 1 : volume;

                    if (volume > 0.001) {
                        const sound = Matter.Common.choose(this.pings);
                        sound.volume(volume, sound.play())
                    }
                }
            }
        });

        this.matter.world.on('collisionend', (event) => {
            var pairs = event.pairs;
            for (const pair of pairs) {
                if (pair.bodyA.gameObject && pair.bodyA.gameObject.onHitEnd) {
                    pair.bodyA.gameObject.onHitEnd(pair.bodyB);
                }
                if (pair.bodyA === this.floor) {
                    if (pair.bodyB.gameObject) {
                        pair.bodyB.gameObject.destroy();
                    }
                }
            }
        });


    }

    update() {
    }

    addDrop(x) {
        const {stage} = this;

        if (!x) {
            const variance = stage.x_increment,
                offset = random() * variance - variance/2;
            x = this.game.config.width / 2 + offset;
        }

        var ball = this.matter.add.image(x, -stage.y_increment, 'pucks', Phaser.Math.RND.pick(BROWN_PUCKS));
        ball.setCircle();
        ball.setScale(stage.x_increment * 1.9 / PUCK_SRC_SIZE);
        ball.setVelocity(random() - 0.5, random() * 5 + 2);
        ball.setAngularVelocity(random() * 0.2 - 0.1 );
        ball.setFriction(0.001);
        ball.setDensity(1.0);
        ball.setBounce(0.3);

    }

    buildStage(stage) {
        let y = 0;
        let lines = stage.layout.split("\n");
        lines.splice(0,1);
        for (const line of lines) {
            let x = 0;
            for (const peg of line) {
                this.addPeg(peg, x, y);
                x += stage.x_increment;
            }
            y += stage.y_increment;
        }
    }

    addPeg(peg, x, y) {
        const {stage} = this;
        const {x_increment, y_increment} = this.stage;
        const img = `peg=${peg}`;
        let poly = undefined;

        switch (peg) {
        case 'o':
            poly = this.matter.add.image(x, y, img, null, {shape: 'circle'})
                .setFriction(0.01)
                .setStatic(true);
            poly.sound = 'wood-01';
            break;
        case 'O': 
            poly = this.matter.add.image(x, y, img, null, {shape: 'circle'})
                .setFriction(0.01)
                .setStatic(true);
            poly.sound = 'wood-02';
            break;
        case '|':
            poly = this.matter.add.image(x, y, img)
                .setFriction(0.01)
                .setStatic(true);
            break;
        case '^':
            poly = this.matter.add.image(x, y, img)
                .setPolygon(x_increment, 3)
                .setFriction(0.01)
                .setAngle(210)
                .setDensity(0.75);
            poly.sound = 'wood-03';
            this.matter.add.worldConstraint(poly, 0, 1, {pointA: {x, y}});
            break;
        }
        const goalConfig = goals.CONFIG[peg];
        if (goalConfig) {
            poly = this.matter.add.image(x + x_increment/2, y, 'target-outline')
                .setFriction(0.01)
                .setSensor(true)
                .setStatic(true);

            poly.text = this.add.text(x - y_increment*0.66, y - y_increment * 0.33, goalConfig.bonus, {align: 'center', fixedWidth: y_increment * 2});

            poly.onHitStart = (other) => {
                goals.onHitStart({config: goalConfig, board: this, stage, other, poly, component: this.component});
            };

            poly.onHitEnd = (other) => {
                goals.onHitEnd({config: goalConfig, stage, other, poly, component: this.component});
            };
        }
    }

    bubbleText(x,y, text) {
        //text.anchor.setTo(0.5, 0.5);
        //text.alpha = 0.1;
        //this.add.tween(text).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 1000, true)

        var obj = this.make.text({x, y,
            text: text,
            origin: 0.5,
            style: {
                //fontFamily: 'Comic Sans',
                fontSize: '24px',
                color: '#fff',
                align: 'center',
                stroke: COLORS.outline,
                strokeThickness: 2,
            }
        });
        var tween = this.tweens.add({
            targets: obj,
            alpha: { from: 0, to: 1 },
            scale: { from: 0, to: 1 },
            y: `-=${this.stage.y_increment}`,
            // alpha: { start: 0, to: 1 },
            // alpha: 1,
            // alpha: '+=1',
            ease: 'Back',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 250,
            repeat: 0,            // -1: infinity
            yoyo: false,
            onComplete: () => {
                obj.destroy();
                tween.remove();
            },
        });
    }



    generateTextures() {
        const {stage} = this;
        this.generateCircle('peg=o', stage.x_increment, COLORS.light, COLORS.outline);
        this.generateCircle('peg=O', stage.x_increment * 1.5, COLORS.light, COLORS.outline);
        this.generateRectangle('peg=|', stage.x_increment * 0.5, stage.y_increment, COLORS.outline, COLORS.outline);
        this.generateTriangle('peg=^', stage.x_increment, COLORS.light, COLORS.outline);

        // targets
        this.generateRectangle('target-outline', stage.y_increment, stage.y_increment, null, COLORS.target);
    }

    generateCircle(name, radius, pin_color, stroke) {
        const graphic = this.add.graphics(),
            line = 2;

        graphic.fillStyle(stroke);
        graphic.fillCircle(radius / 2, radius / 2, radius / 2);

        graphic.lineStyle(line, pin_color);
        graphic.strokeCircle(radius / 2, radius / 2, line);
        graphic.generateTexture(name, radius, radius);
        graphic.clear();
    }

    generateRectangle(name, width, height, fill, stroke) {
        const graphic = this.add.graphics(),
            line = 2;

        if (fill) {
            graphic.fillStyle(fill);
            graphic.fillRect(0, 0, width, height);
        }

        graphic.lineStyle(line, stroke);
        graphic.strokeRect(line/2, line/2, width-line, height-line);
        graphic.generateTexture(name, width, height);
        graphic.clear();
    }

    generateTriangle(name, length, pin_color, stroke) {
        const graphic = this.add.graphics(),
            line = 2;

        // hardcoded for 16 px based on matter body
        const triangle = {
            x1: 16 + 8,
            y1: 13.856 + 13.856,
            x2: 16 + -16,
            y2: 13.856 + 0,
            x3: 16 + 8,
            y3: 13.856 + -13.856,
        }

        graphic.fillStyle(stroke);
        graphic.fillTriangleShape(triangle);
        graphic.lineStyle(line, pin_color);
        graphic.strokeCircle(16, 13.856, line);
        graphic.generateTexture(name, 16 + 8, 13.856 * 2);
        graphic.clear();
    }
}

const FONT_FAMILY = 'Comic Sans';

const COLORS = {
    light:  0xEAD297,
    outline: 0x735200,
    target: 0x808080,
}

const IMAGES = [
    'ring-16',
    'ring-64',
    'stick-8',
    'triangle-64',
]

const PUCKS = [
    'bear',
    'buffalo',
    'chick',
    'chicken',
    'cow',
    'crocodile',
    'dog',
    'duck',
    'elephant',
    'frog',
    'giraffe',
    'goat',
    'gorilla',
    'hippo',
    'horse',
    'monkey',
    'moose',
    'narwhal',
    'owl',
    'panda',
    'parrot',
    'penguin',
    'pig',
    'rabbit',
    'rhino',
    'sloth',
    'snake',
    'walrus',
    'whale',
    'zebra',
]

const BROWN_PUCKS = [
    'bear',
    'buffalo',
    'goat',
    'horse',
    'monkey',
    'moose',
    'owl',
    'sloth',
    'walrus',
]

const COLOR_PUCKS = PUCKS.filter(n => !BROWN_PUCKS.includes(n));

const PUCK_SRC_SIZE = 140;

const PINGS = [
    'wood-01',
    'wood-02',
    'wood-03',
    'wood-04',
    'wood-05',
    'wood-06'
]
