import { Engine, Body } from 'matter-js';

export interface WorldViewOptions {
    engine: Engine;
    cart: Body;
    coins: Body[];
    coinMaxCount: number;
}

export class WorldView {
    constructor(options: WorldViewOptions) {
        this.engine = options.engine;
        this.cart = options.cart;
        this.coins = options.coins;
        this.coinMaxCount = options.coinMaxCount;
    }

    public readonly engine: Engine;
    public readonly cart: Body;
    public readonly coins: Body[];
    public readonly coinMaxCount: number;
}
