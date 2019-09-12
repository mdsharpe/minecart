import { NgModule } from '@angular/core';

import { GameShellComponent } from './containers/game-shell/game-shell.component';
import { GameRoutingModule } from './game-routing.module';
import { SharedModule } from 'app/shared';
import { WorldComponent } from './components/world/world.component';
import { StatsComponent } from './components/stats/stats.component';

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
  exports: [GameShellComponent]
})
export class GameModule { }
