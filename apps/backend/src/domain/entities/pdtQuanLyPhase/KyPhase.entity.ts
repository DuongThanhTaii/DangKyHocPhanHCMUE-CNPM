export class KyPhase {
    constructor(
        public readonly id: string,
        public readonly hocKyId: string,
        public readonly phase: string,
        public readonly startAt: Date,
        public readonly endAt: Date,
        public isEnabled: boolean
    ) { }

    /**
     * Toggle is_enabled status
     */
    toggle(): void {
        this.isEnabled = !this.isEnabled;
    }

    /**
     * Check if phase is currently active (based on is_enabled only, NO time check)
     */
    isActive(): boolean {
        return this.isEnabled;
    }

    /**
     * Factory method from persistence
     */
    static fromPersistence(data: {
        id: string;
        hocKyId: string;
        phase: string;
        startAt: Date;
        endAt: Date;
        isEnabled: boolean;
    }): KyPhase {
        return new KyPhase(
            data.id,
            data.hocKyId,
            data.phase,
            data.startAt,
            data.endAt,
            data.isEnabled
        );
    }

    /**
     * To persistence (for update)
     */
    toPersistence() {
        return {
            id: this.id,
            hoc_ky_id: this.hocKyId,
            phase: this.phase,
            start_at: this.startAt,
            end_at: this.endAt,
            is_enabled: this.isEnabled,
        };
    }
}
