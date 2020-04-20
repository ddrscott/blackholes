import Phaser from 'phaser';

const random = () => Phaser.Math.RND.frac();

export default class Board extends Phaser.Scene {
    constructor() {
        super('main')
    }

    init({stage}) {
        this.stage = stage;
        this.score = parseInt(localStorage.getItem('score', '0'));
        this.started = false;
        this.clicks = {
            total: parseInt(localStorage.getItem('total_clicks', '0')),
            by_second: new Uint8Array(10),
            slot: 0,
            per_second: 0.0
        };
    }

    preload() {
        for (const img of IMAGES) {
            this.load.image(img, `images/${img}.png`);
        }

        this.load.image('bamboo', 'bamboo-bg.jpg');
        this.load.image('ring', 'images/ring-16.png');
        this.load.atlas('pucks', 'images/round_nodetailsOutline.png', 'images/round_nodetailsOutline.json');

        for (const mp3 of PINGS) {
            this.load.audio(mp3, [`audio/${mp3}.mp3`]);
        }
    }

    create() {
        const {game, stage} = this;

        this.matter.world.setBounds(0, -200, game.config.width, game.config.height + 300);

        this.add.image(0, 0, 'bamboo').setOrigin(0).setScale(game.config.width/450, game.config.height/450);

        this.generateTextures();

        this.buildStage(stage);

        this.input.on("pointerup", ({x}) => {
            this.lastPointerX = x;
            this.addDrop(x);
            this.onClicked();
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
                    const volume = pair.collision.depth > 8 ? 1 : pair.collision.depth / 8;
                    if (volume > 0.1) {
                        this.pings[pair.bodyA.gameObject.sound].play({volume});
                    }
                }

                if (pair.bodyA.gameObject && pair.bodyA.gameObject.onHitStart) {
                    pair.bodyA.gameObject.onHitStart(pair.bodyB);
                }
            }
        });

        this.matter.world.on('collisionend', (event) => {
            var pairs = event.pairs;
            for (const pair of pairs) {
                if (pair.bodyA.gameObject && pair.bodyA.gameObject.onHitEnd) {
                    pair.bodyA.gameObject.onHitEnd(pair.bodyB);
                }
            }
        });

        this.stats_text = this.add.text(0, 0, 'Click anywhere to Start', {
            align: 'right', 
            fontSize: '15px',
            fontFamily: FONT_FAMILY,
            fixedWidth: game.config.width - stage.x_increment,
            stroke: COLORS.outline,
            strokeThickness: 1,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                blur: 20,
                fill: '#333',
            },
        });
    }

    update() {
        let {stats_text, clicks, score} = this;
        stats_text.text = `
${parseFloat(score).toLocaleString()}
${clicks.total} clicks
${clicks.per_second.toFixed(1)} cps
`;
    }

    onClicked() {
        this.onStart();
        this.clicks.total += 1;
        let {clicks} = this;
        clicks.by_second[clicks.slot] += 1;
    }

    onSecond() {
        let {clicks} = this;
        clicks.slot = (clicks.slot + 1) % clicks.by_second.length;
        clicks.by_second[clicks.slot] = 0;
        clicks.per_second = clicks.by_second.reduce((a,b) => a + b, 0) / clicks.by_second.length;
        this.onSaveStats();
    }

    onSaveStats() {
        if (this.lastScore != this.score) {
            localStorage.setItem('score', this.score);
            this.lastScore = this.score;
        }
        if (this.lastTotalClicks != this.clicks.total) {
            localStorage.setItem('total_clicks', this.clicks.total);
            this.lastTotalClicks = this.clicks.total;
        }
    }

    onBonusDrop() {
        let delay = 1000;
        if (this.clicks.per_second > 1) {
            delay = 500 / this.clicks.per_second;
        }
        this.time.addEvent({
            delay: delay,
            callback: () => {
                const {stage} = this;

                const variance = stage.x_increment,
                    offset = random() * variance - variance/2,
                    x = this.game.config.width / 2 + offset;

                var ball = this.matter.add.image(x, -stage.y_increment, 'ring');
                ball.setCircle();
                ball.setVelocity(random() - 0.5, random() * 5 + 2);
                ball.setAngularVelocity(random() * 0.2 - 0.1 );
                ball.setFriction(0.25);
                ball.setDensity(0.5);
                ball.setBounce(0.3);

                this.onBonusDrop();
            },
            loop: false
        });
    }

    addDrop(x) {
        const {stage} = this;

        if (!x) {
            const variance = stage.x_increment,
                offset = random() * variance - variance/2;
            x = this.game.config.width / 2 + offset;
        }

        var ball = this.matter.add.image(x, -stage.y_increment, 'pucks', Phaser.Math.RND.pick(COLOR_PUCKS));
        ball.setCircle();
        ball.setScale(stage.x_increment * 2 / PUCK_SRC_SIZE);
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
        const {x_increment, y_increment} = this.stage;
        const img = `peg=${peg}`;
        let poly = undefined;

        switch (peg) {
        case 'o':
            poly = this.matter.add.image(x, y, img, null, {shape: 'circle'})
                .setFriction(0.01)
                .setStatic(true);
            poly.sound = 'wood-03';
            break;
        case 'O': 
            poly = this.matter.add.image(x, y, img, null, {shape: 'circle'})
                .setFriction(0.01)
                .setStatic(true);
            poly.sound = 'wood-03';
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
        const target = TARGETS[peg];
        if (target) {
            poly = this.matter.add.image(x + x_increment/2, y + y_increment/3, 'target-outline')
                .setFriction(0.01)
                .setSensor(true)
                .setStatic(true);

            // poly.text = this.add.text(x - y_increment*0.66, y - y_increment, target.bonus, {align: 'center', fixedWidth: y_increment * 2});
            const bonusText = this.add.text(x - y_increment*0.66, y - y_increment, target.bonus, {
                // color: COLORS.lightHex,
                align: 'center', 
                stroke: COLORS.outline,
                strokeThickness: 1,
                fixedWidth: y_increment * 2,
                resolution: 2
            });
            
            const bonusText2 = this.add.text(x - y_increment*0.66, y - y_increment * 1.5, 'x', {
                // color: COLORS.lightHex,
                align: 'center', 
                fontSize: '12px',
                stroke: COLORS.outline,
                strokeThickness: 1,
                fixedWidth: y_increment * 2,
                resolution: 2
            });

            poly.onHitStart = (other) => {
                // goals.onHitStart({config: target, board: this, stage, other, poly});
                bonusText.setColor(COLORS.outlineHex);
                bonusText2.setColor(COLORS.outlineHex);
                const points = Math.round(Math.sqrt(other.area / Math.PI)) * target.bonus;
                this.score += points;
                this.bubbleText(poly.x, poly.y - 25, "+" + points);
            };

            poly.onHitEnd = (other) => {
                bonusText.setColor('#fff');
                bonusText2.setColor('#fff');
                // goals.onHitEnd({config: target, stage, other, poly});
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
                strokeThickness: 1,
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

    onStart() {
        if (!this.started) {
            this.started = window.performance.now();
            this.time.addEvent({
                delay: 1000,
                callback: () => this.onSecond(),
                loop: true
            });
            this.onBonusDrop();
        }
    }
}

const FONT_FAMILY = '"Lucida Console", Monaco, monospace';

const COLORS = {
    light:  0xEAD297,
    lightHex: '#EAD297',
    outline: 0x735200,
    outlineHex: '#735200',
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

export const TARGETS = {
    'A': {
        bonus: 100,
    },
    'B': {
        bonus: 25,
    },
    'C': {
        bonus: 10,
    },
    'D': {

        bonus: 5,
    },
    'E': {
        bonus: 1,
    },
}
