export interface RecordsModelOptions {
    distanceMax: number;
}

export class RecordsModel {
    constructor(options: RecordsModelOptions) {
        this.distanceMax = options.distanceMax;
    }

    public distanceMax: number;
}