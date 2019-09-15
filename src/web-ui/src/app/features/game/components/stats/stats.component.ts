import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { StatsModel } from '../../models';

@Component({
    selector: 'app-stats',
    templateUrl: './stats.component.html',
    styleUrls: ['./stats.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsComponent {
    @Input() public stats: StatsModel | null = null;
}
