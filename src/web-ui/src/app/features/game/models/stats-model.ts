import { WorldView } from './world-view';

export class StatsModel {
    constructor(world: WorldView | null) {
        if (world) {
            const x = world.cart.position.x;
            this.distance = Math.round(x / 100);
            this.velocity = Math.round(world.cart.velocity.x);
        }else {
            this.distance = 0;
            this.velocity = 0;
        }
    }
    
    public readonly distance: number;
    public readonly velocity: number;
}
