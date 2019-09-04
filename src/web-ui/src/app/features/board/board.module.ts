import { NgModule } from '@angular/core';

import { BoardShellComponent } from './containers/board-shell/board-shell.component';
import { BoardRoutingModule } from './board-routing.module';
import { SharedModule } from 'app/shared';

@NgModule({
  imports: [
    BoardRoutingModule,
    SharedModule
  ],
  declarations: [
    BoardShellComponent
  ],
  exports: [BoardShellComponent]
})
export class BoardModule { }
