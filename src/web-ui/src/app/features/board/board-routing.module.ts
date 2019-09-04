import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BoardShellComponent } from './containers/board-shell/board-shell.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: BoardShellComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoardRoutingModule { }
