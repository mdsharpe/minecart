import { Vertices } from 'matter-js';
import { WorldView } from './world-view';
import { RecordsModel } from './records-model';

export class StatsModel {
    constructor(
        world: WorldView | null,
        records: RecordsModel | null) {
        if (world) {
            this.coinCoint = world.coins
                .filter(o => Vertices.contains(world.cart.vertices, o.position))
                .length;
            this.coinMaxCount = world.coinMaxCount;

            this.velocity = Math.round(world.cart.velocity.x);
            this.distance = Math.round(world.cart.position.x);

            this.distanceMax = Math.round(
                Math.max(
                    records ? records.distanceMax : 0,
                    world.cart.position.x
                ));
        } else {
            this.coinCoint = 0;
            this.coinMaxCount = 0;
            this.velocity = 0;
            this.distance = 0;
            this.distanceMax = 0;
        }
    }

    public readonly coinCoint: number;
    public readonly coinMaxCount: number;
    public readonly velocity: number;
    public readonly distance: number;
    public readonly distanceMax: number | null;
}
