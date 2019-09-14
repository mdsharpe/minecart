import { Engine, World, Composite } from 'matter-js';

export interface WorldView {
    engine: Engine;
    cart: Composite;  
}
