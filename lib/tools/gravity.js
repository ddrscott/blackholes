import Phaser from 'phaser';
const MIN_RADIUS = 5;
const ALMOST_BLACK = 0x020202;

const DESTROY_AT_DISTANCE = 5;

export default class Gravity {
    label = 'B.Hole';
    bodies = [];

    onDown(scene, {x, y}) {
        this.downAt = {x,y};
        const backgroundScene = scene.scene.get('preload');
        this.graphics = backgroundScene.add.graphics(x, y);
    }
    
    onPointerMove(scene, {x, y}) {
        if (this.downAt) {
            const dist = Phaser.Math.Distance.Between(this.downAt.x, this.downAt.y, x, y);
            this.graphics.clear();
            this.graphics.fillStyle(ALMOST_BLACK, 0.95);
            this.graphics.fillCircle(this.downAt.x, this.downAt.y, dist);
        }
    }
    
    onUp(scene, {x, y}) {
        if (!this.downAt) {
            return;
        }

        const radius = Phaser.Math.Distance.Between(this.downAt.x, this.downAt.y, x, y);
        if (radius < MIN_RADIUS) {
            this.downAt = false;
            return
        }

        const item = scene.matter.add.circle(this.downAt.x, this.downAt.y, radius);
        item.label = this.label;
        item.isStatic = true;
        item.isSensor = true;

        this.bodies.push(item);

        this.adjustWorldGravity(scene);

        item.plugin.attractors.push(this.attractor.bind(this));

        this.downAt = false;
    }

    adjustWorldGravity(scene) {
        const totalArea = scene.game.config.width * scene.game.config.height,
            sumArea = this.bodies.reduce((a,b) => a + b.area, 0),
            newGravity = sumArea > totalArea ? 0 : scene.matter.world.localWorld.gravity.y - (sumArea / totalArea);

        scene.matter.world.setGravity(0, newGravity < 0 ? 0 : newGravity);
    }

    attractor(bodyA, bodyB) {
        const Matter = Phaser.Physics.Matter.Matter;
        var bToA = Matter.Vector.sub(bodyB.position, bodyA.position),
            distanceSq = Matter.Vector.magnitude(bToA) || 0.0001,
            normal = Matter.Vector.normalise(bToA),
            magnitude = -0.005 * (bodyA.mass * bodyB.mass / distanceSq),
            force = Matter.Vector.mult(normal, magnitude);

        if (distanceSq < DESTROY_AT_DISTANCE && bodyB.gameObject) {
            bodyB.gameObject.destroy();
        } else {
            Matter.Body.applyForce(bodyB, bodyB.position, force);
        }
    }
}
