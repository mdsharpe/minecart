import { NgModule, SkipSelf, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared';

@NgModule({
    imports: [
        CommonModule,
        SharedModule.forRoot()
    ],
    exports: [
        SharedModule
    ],
    declarations: []
})
export class CoreModule {
    constructor(
        @SkipSelf()
        @Optional()
        parentModule: CoreModule
    ) {
        if (parentModule) {
            throw new Error(
                'CoreModule is already loaded. Import it in the AppModule only.'
            );
        }
    }
}
