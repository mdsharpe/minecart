import { Engine, Body } from 'matter-js';

export interface WorldView {
    engine: Engine;
    cart: Body;  
}
