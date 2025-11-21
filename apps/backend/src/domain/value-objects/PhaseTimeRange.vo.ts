export class PhaseTimeRange {
    private constructor(
        public readonly startAt: Date,
        public readonly endAt: Date
    ) { }

    static create(startAt: Date, endAt: Date): PhaseTimeRange {
        if (startAt >= endAt) {
            throw new Error("startAt phải nhỏ hơn endAt");
        }
        return new PhaseTimeRange(startAt, endAt);
    }

    overlaps(other: PhaseTimeRange): boolean {
        return (
            (this.startAt >= other.startAt && this.startAt < other.endAt) ||
            (this.endAt > other.startAt && this.endAt <= other.endAt) ||
            (this.startAt <= other.startAt && this.endAt >= other.endAt)
        );
    }

    contains(date: Date): boolean {
        return date >= this.startAt && date <= this.endAt;
    }

    getDurationInDays(): number {
        const diffTime = Math.abs(this.endAt.getTime() - this.startAt.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}
