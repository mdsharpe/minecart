import { NgModule } from '@angular/core';

import { GameShellComponent } from './containers/game-shell/game-shell.component';
import { GameRoutingModule } from './game-routing.module';
import { SharedModule } from 'app/shared';

@NgModule({
  imports: [
    GameRoutingModule,
    SharedModule
  ],
  declarations: [
    GameShellComponent
  ],
  exports: [GameShellComponent]
})
export class GameModule { }
