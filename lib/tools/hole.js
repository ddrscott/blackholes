import Phaser from 'phaser';
const MIN_RADIUS = 25;
const MAX_RADIUS = 240;
const MAX_FORCE = 1;
const ALMOST_BLACK = 0x020202;
const VELOCITY = 0.25;
const GROWTH_FACTOR = 0.3;

const DESTROY_AT_DISTANCE = 5;

export default class Hole {
    label = 'Black';

    onDown(scene, {x, y}) {
        if (scene.holes.remaining < 1) {
            scene.bubbleText(x, y, `Max Holes Reached!\nMore at ${scene.holes.nextAt}\n points`);
            return;
        }

        this.downAt = {x,y};
        this.graphics = scene.add.graphics(x, y);
        this.graphics.depth = -1;
        this.scene = scene;
    }
    
    onPointerMove(scene, {x, y}) {
        if (this.downAt) {
            let dist = Phaser.Math.Distance.Between(this.downAt.x, this.downAt.y, x, y);
            if (dist > MAX_RADIUS) {
                dist = MAX_RADIUS;
            }
            this.drawCircle(this.downAt, dist);
        }
    }
    
    drawCircle({x, y}, radius){
        if (this.graphics) {
            this.graphics.clear();
            this.graphics.fillStyle(ALMOST_BLACK, 0.90);
            this.graphics.fillCircle(x, y, radius);
        }
    }

    onUp(scene, {x, y}) {
        if (!this.downAt) {
            return;
        }

        if (this.graphics) {
            this.graphics.clear();
            this.graphics.destroy();
        }

        scene.events.emit('useHole');

        let radius = Phaser.Math.Distance.Between(this.downAt.x, this.downAt.y, x, y);
        if (radius < MIN_RADIUS) {
            radius = MIN_RADIUS;
        }
        if (radius > MAX_RADIUS) {
            radius = MAX_RADIUS;
        }

        let hitRadius = radius * 0.01;
        if (hitRadius < DESTROY_AT_DISTANCE) {
            hitRadius = DESTROY_AT_DISTANCE;
        }


        const obj = scene.add.circle(this.downAt.x, this.downAt.y, radius, ALMOST_BLACK, 0.8);
        // const obj = scene.add.image(this.downAt.x, this.downAt.y, 'white');
        // obj.displayWidth = radius;
        // obj.displayHeight = radius;
        // obj.setTint(0x000000);
        // obj.setBlendMode(Phaser.BlendModes.MULTIPLY);

        scene.matter.add.gameObject(obj, {
            label: this.label,
            shape: 'circle', 
            radius: radius,
            hitRadius: hitRadius,
            isSensor: true,
            ignoreGravity: true,
            frictionAir: 0,
            plugin: {
                attractors: [this.attractor.bind(this)]
            }
        });

        obj.name = 'hole';
        // obj.setVelocity(0, VELOCITY);
        obj.setDepth(-1);


        if (radius == MIN_RADIUS) {
            const tween = scene.tweens.add({
                targets: obj,
                // alpha: { from: 4, to: 0 },
                scale: { from: 0, to: 1 },
                ease: 'Elastic',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 500,
                repeat: 0,            // -1: infinity
                yoyo: false,
                onComplete: () => {
                    tween.remove();
                },
            });
        }

        this.downAt = false;
    }

    attractor(bodyA, bodyB) {
        if (bodyB.label == this.label) {
            return;
        }

        const height = this.scene.game.config.height;

        // only consider bodies in view
        if (bodyA.position.y - bodyA.radius > height) {
            return;
        }

        const Matter = Phaser.Physics.Matter.Matter;
        var bToA = Matter.Vector.sub(bodyB.position, bodyA.position),
            distanceSq = Matter.Vector.magnitude(bToA) || 0.0001,
            normal = Matter.Vector.normalise(bToA),
            magnitude = -0.002 * (bodyA.mass * bodyB.mass / distanceSq),
            force = Matter.Vector.mult(normal, magnitude < -0.002 ? -0.002 : magnitude);

        // console.log({magnitude});

        if (distanceSq < bodyA.hitRadius && bodyB.gameObject) {
            this.disappear(bodyB.gameObject, bodyA);
        } else {
            Matter.Body.applyForce(bodyB, bodyB.position, force);
        }
    }

    disappear(star, hole) {
        if (!star._disappearing) {
            star._disappearing = this.scene.tweens.add({
                targets: star,
                // alpha: { from: 4, to: 0 },
                scale: {from: star.scale, to: 0.001 },
                ease: 'Cubic',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 250,
                repeat: 0,            // -1: infinity
                yoyo: false,
                onComplete: () => {
                    // if (hole && hole.radius) {
                        const points = parseInt(MIN_RADIUS / hole.radius / hole.scale.x  * 100);
                        this.scene.events.emit('points', {points, x: hole.position.x, y: hole.position.y});
                        if (hole.scale.x * hole.radius > MAX_RADIUS) {
                            this.collapse(hole);
                        } else {
                            this.grow(hole, star.radius * GROWTH_FACTOR );
                        }
                    // }
                    star.destroy();
                    // TODO move star instead of replacing it.
                    // const {width, height} = this.scene.game.config;
                    // // console.log(star);
                    // star.displayHeight = star.radius;
                    // star.displayWidth = star.radius;
                    // star.setVelocity(0, star.radius / 3);
                    // star.x = 100;
                    // star.y = 0;
                    star._disappearing.remove();
                    delete star._disappearing;
                },
            });
        }
    }

    collapse(body) {
        if (!body._collapsing) {
            body._collapsing = this.scene.tweens.add({
                targets: [body.gameObject],
                scale: {from: body.gameObject.scale, to: 0.0},
                ease: 'Bounce',
                duration: 500,
                onComplete: () => {
                    body.gameObject.destroy();
                    body._collapsing.remove();
                    this.scene.holes.remaining += 1;
                    this.scene.updateStats();
                },
            });
        }
    }

    grow(body, amount) {
        const currentRadius = body.scale.x * body.radius,
            update = (currentRadius + amount)/body.radius;
        body.gameObject.setScale(update);
    }
}
