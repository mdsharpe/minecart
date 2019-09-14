import { WorldView } from './world-view';

export class StatsModel {
    constructor(world: WorldView | null) {
        if (world) {
            const x = world.cart.bodies[0].position.x;
            this.distance = Math.round(x / 100);
        }else {
            this.distance = 0;
        }
    }
    
    public readonly distance: number;
}
