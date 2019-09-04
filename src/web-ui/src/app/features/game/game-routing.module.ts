import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameShellComponent } from './containers/game-shell/game-shell.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: GameShellComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
