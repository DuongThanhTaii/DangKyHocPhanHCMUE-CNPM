export class KyPhase {
    private constructor(
        public readonly id: string,
        public hocKyId: string,
        public phase: string,
        public startAt: Date,
        public endAt: Date,
        public isEnabled: boolean
    ) { }

    static create(props: {
        id: string;
        hocKyId: string;
        phase: string;
        startAt: Date;
        endAt: Date;
        isEnabled?: boolean;
    }): KyPhase {
        const phase = new KyPhase(
            props.id,
            props.hocKyId,
            props.phase,
            props.startAt,
            props.endAt,
            props.isEnabled !== undefined ? props.isEnabled : true
        );

        if (!phase.isValidTimeRange()) {
            throw new Error("startAt phải nhỏ hơn endAt");
        }

        return phase;
    }

    static fromPersistence(props: {
        id: string;
        hocKyId: string;
        phase: string;
        startAt: Date;
        endAt: Date;
        isEnabled: boolean;
    }): KyPhase {
        return new KyPhase(
            props.id,
            props.hocKyId,
            props.phase,
            props.startAt,
            props.endAt,
            props.isEnabled
        );
    }

    isValidTimeRange(): boolean {
        return this.startAt < this.endAt;
    }

    isActive(): boolean {
        const now = new Date();
        return this.isEnabled && now >= this.startAt && now <= this.endAt;
    }

    enable(): void {
        this.isEnabled = true;
    }

    disable(): void {
        this.isEnabled = false;
    }
}
