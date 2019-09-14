import { WorldView } from './world-view';
import { Bounds } from 'matter-js';

export class StatsModel {
    constructor(world: WorldView | null) {
        if (world) {
            const x = world.cart.position.x;
            this.distance = Math.round(x / 100);
            this.velocity = Math.round(world.cart.velocity.x);
            this.coinCoint = world.coins
                ////.filter(o => Bounds.overlaps(world.cart.vertices, o.vertices))
                .length;
        } else {
            this.distance = 0;
            this.velocity = 0;
            this.coinCoint = 0;
        }
    }

    public readonly distance: number;
    public readonly velocity: number;
    public readonly coinCoint: number;
}
