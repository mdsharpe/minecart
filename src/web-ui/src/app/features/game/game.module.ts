import { NgModule } from '@angular/core';

import { SharedModule } from 'app/shared';
import { GameRoutingModule } from './game-routing.module';
import { WorldComponent } from './components/world/world.component';
import { StatsComponent } from './components/stats/stats.component';
import { GameShellComponent } from './containers/game-shell/game-shell.component';

@NgModule({
    imports: [
        GameRoutingModule,
        SharedModule
    ],
    declarations: [
        GameShellComponent,
        WorldComponent,
        StatsComponent
    ],
    exports: [
        GameShellComponent
    ]
})
export class GameModule { }
