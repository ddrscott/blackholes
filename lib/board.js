import Phaser from 'phaser';

import {COLORS, FONT_FAMILY, FONT_SERIF} from '../lib/colors';
import Ticker from '../lib/ticker';
import {create as createStar, AIR_FRICTION} from '../lib/tools/star';
import {musicPanel, slider} from '../lib/ui';
import {playTrack, BACKGROUND_TRACK} from '../lib/music';

import {TOOLS} from '../components/toolbar';

const FADE_MUSIC = false;
const random = () => Phaser.Math.RND.frac();
const DEFAULT_GRAVITY = 0.1;
const NEXT_AT_FACTOR = 2;
const MAX_BODIES = 300;

export default class Board extends Phaser.Scene {
    constructor() {
        super({
            key: 'board',
            physics: {
                matter: {
                    gravity: {y: DEFAULT_GRAVITY}
                }
            }
        })
    }

    init({stage}) {
        const fetchInt = (key) => {
            let n = parseInt(localStorage.getItem(key) || 0);
            return isNaN(n) ? 0 : n;
        }

        const fetchJSON = (key, defaultVal) => {
            let str = localStorage.getItem(key);
            if (str === undefined || str === null) {
                return defaultVal;
            }
            return JSON.parse(str);
        }
    
        this.stage = this.checkDimensions(stage);
        this.score = fetchInt('score');
        this.started = false;
        this.clicks = {
            total: fetchInt('total_clicks'),
            by_second: new Uint32Array(10),
            slot: 0,
            per_second: 0.0
        };
        this.pointsPerSecond = new Ticker(10);
        this.holes = fetchJSON('holes', {
            max: 1,
            nextAt: 10000,
        });
    }


    preload() {
        this.load.image('white', 'images/white.png');
        this.load.audio('suck', 'audio/suck.mp3');
    }

    create() {
        window.scene = this;

        const {game, stage} = this;

        // always start at max holes.
        this.holes.remaining = this.holes.max;

        this.matter.world.setGravity(0, DEFAULT_GRAVITY);

        this.sound.pauseOnBlur = false;
        this.disablevisibilitychange = true;

        this.matter.world.setBounds(0, -200, game.config.width, game.config.height + 300);

        this.suckSound = this.sound.add('suck', {volume: .5});

        this.input.off("pointerup");
        this.input.on("pointerup", (evt) => {
            const {x} = evt;
            this.lastPointerX = x;
            this.onClicked();

            const tool = this.game.getState('tool');
            tool && tool.onUp && tool.onUp(this, evt);
        });

        this.input.off("pointermove");
        this.input.on('pointermove', (evt) => {
            const tool = this.game.getState('tool');
            tool && tool.onPointerMove && tool.onPointerMove(this, evt);
        });

        this.input.off("pointerdown");
        this.input.on("pointerdown", (evt) => {
            const tool = this.game.getState('tool');
            tool && tool.onDown && tool.onDown(this, evt);
        });

        this.matter.world.off("collisionstart");
        this.matter.world.on('collisionstart', (event) => {
            var pairs = event.pairs;
            for (const pair of pairs) {
                if (Math.sqrt(pair.collision.depth) > 1 && pair.bodyA.gameObject && pair.bodyA.gameObject.sound) {
                    const volume = pair.collision.depth > 8 ? 1 : pair.collision.depth / 8;
                    if (volume > 0.1) {
                        const stage_depth = parseInt(pair.bodyA.position.y / this.game.config.height * 12) * 100;
                        // this.pings[pair.bodyA.gameObject.sound].play({volume, detune: stage_depth});
                    }
                }

                if (pair.bodyA.gameObject && pair.bodyA.gameObject.onHitStart) {
                    pair.bodyA.gameObject.onHitStart(pair.bodyB);
                }
            }
        });

        this.matter.world.off("collisionend");
        this.matter.world.on('collisionend', (event) => {
            var pairs = event.pairs;
            for (const pair of pairs) {
                if (pair.bodyA.gameObject && pair.bodyA.gameObject.onHitEnd) {
                    pair.bodyA.gameObject.onHitEnd(pair.bodyB);
                }
            }
        });

        this.events.off('points');
        this.events.on('points', ({points, x, y}) => {
            this.game.events.emit('points', {points, x, y});
            // this.bubbleText(x, y, '+' + points);
            this.suckSound.play();
            this.score += points;
            this.pointsPerSecond.add(points);
            if (this.score > this.holes.nextAt) {
                this.bubbleText(this.game.config.width/3, 150, '+1 Hole!!!');
                this.holes.nextAt = parseInt(this.holes.nextAt * NEXT_AT_FACTOR);
                this.holes.max += 1;
                this.holes.remaining += 1;
            }
            this.updateStats();
        });

        this.events.off('useHole');
        this.events.on('useHole', () => {
            scene.holes.remaining -= 1;
            // this.game.events.emit('title', `${this.holes.remaining} of ${this.holes.max}`);
            this.updateStats();
        });

        this.events.off('tapped');
        this.events.on('tapped', ({x, y}) => {
            const {width, height} = this.game.config;
            createStar(this, x, y, undefined, [0, 0]); 
        });

        // this.game.events.emit('title', `${this.holes.remaining} of ${this.holes.max}`);
        this.updateStats();
        this.onStart();
    }

    update() {
        let {clicks} = this;
        // this.game.events.emit('logs', `${clicks.total} clicks\n${clicks.per_second} cps\n${this.points.per_second} pps`);
        this.clearOffscreenObjects(scene);
    }

    updateStats() {
        this.game.events.emit('title', `${this.holes.remaining} of ${this.holes.max}`);
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
        this.pointsPerSecond.onSecond();

        // update music speed
        let musicSpeed = BACKGROUND_TRACK.minSpeed - this.pointsPerSecond.per_second;
        if (musicSpeed < 100) {
            musicSpeed = 100;
        }
        BACKGROUND_TRACK.speed = musicSpeed;
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
        localStorage.setItem('holes',  JSON.stringify(this.holes));
    }


    generateStars() {
        const MAX_DELAY = 1000;
        // let delay = 1000; / (this.holes.max - this.holes.remaining + 1);
        // if (this.clicks.per_second > 1) {
        //     delay /= this.clicks.per_second * 2;
        // }
        let delay = 1000;
        if (this.pointsPerSecond.per_second) {
            delay = 1000 / this.pointsPerSecond.per_second * 10;
            // console.log({delay: delay, pps: this.pointsPerSecond.per_second, bodies: this.children.list.length })
        }

        if (delay < 0) {
           delay = random() * 50;
        }
        if (delay > MAX_DELAY) {
            delay = MAX_DELAY;
        }
        this.time.addEvent({
            delay: delay,
            callback: () => {
                if (this.children.list.length < MAX_BODIES) {
                    createStar(this, random() * this.game.config.width * 2 - this.game.config.width, -10); 
                }
                this.generateStars();
            },
            loop: false
        });
    }

    checkDimensions(stage) {
        let updated = {...stage};
        let lines = stage.layout.split("\n");
        // always ignore first new line!!!
        let max_y = lines.length - 2;
        let max_x = 0;
        for (const line of lines) {
            if (line.length > max_x) {
                max_x = line.length;
            }
        }
        // ignore trailing new line
        max_x -= 1;
        if (updated.y_increment === 'auto') {
            updated.y_increment = this.game.config.height / max_y;
        }
        if (updated.x_increment === 'auto') {
            updated.x_increment = this.game.config.width / max_x;
        }
        return updated;
    }

    bubbleText(x,y, text) {
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
        });//.setShadow(0,3,'#333', 10);

        var tween = this.tweens.add({
            targets: obj,
            // alpha: { from: 4, to: 0 },
            scale: { from: 0, to: 1 },
            y: `-=50`,
            x: `-=${30 * random() - 15}`,
            ease: 'Cubic',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 1000,
            repeat: 0,            // -1: infinity
            yoyo: false,
            onComplete: () => {
                obj.destroy();
                tween.remove();
            },
        });
    }

    onStart() {
        if (!this.started) {
            this.started = window.performance.now();
            this.time.addEvent({
                delay: 1000,
                callback: () => this.onSecond(),
                loop: true
            });
            // draw starts
            this.generateStars();
            playTrack(this, 'audio/delicate_bell.mp3', BACKGROUND_TRACK);
            // const preload = this.scene.get('preload');
            // playTrack(this);
            // this.scene.sendToBack('preload');
            // this.scene.resume('board');
        }
    }

    clearOffscreenObjects(scene) {
        const {width, height} = scene.game.config,
            margin = height;

        const holes = scene.children.list.reduceRight( (agg, obj) => {
            if (obj.getData('wrap')) {
              if (obj.y > height + margin) obj.y = -margin/2;
              if (obj.x > width + margin) obj.x = -margin/2;
              if (obj.y < -margin) obj.y = height + margin/2;
              if (obj.x < -margin) obj.x = width + margin/2;
            }
            if (obj.name === 'hole') {
                return agg + 1;
            }
            return agg;
        }, 0)

//         scene.children.list
//         .filter((obj) => obj.name === 'star')
//         .reduceRight((_, obj) => {
//             if (holes > 0) {
//                 obj.body.frictionAir = AIR_FRICTION
//             } else {
//                 obj.body.frictionAir = AIR_FRICTION
//             }
//         }, null);
    }
}
