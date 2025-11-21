import { useEffect, useState } from "react";
import { svApi } from "../api/svApi";
import type { SVTKBWeeklyItemDTO } from "../types";

export const useSVTKBWeekly = (
    hocKyId: string,
    dateStart: string,
    dateEnd: string
) => {
    const [tkb, setTkb] = useState<SVTKBWeeklyItemDTO[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!hocKyId || !dateStart || !dateEnd) {
            setTkb([]);
            return;
        }

        const fetch = async () => {
            setLoading(true);
            try {
                const result = await svApi.getTKBWeekly(hocKyId, dateStart, dateEnd);
                if (result.isSuccess && result.data) {
                    setTkb(result.data);
                } else {
                    setTkb([]);
                }
            } catch {
                setTkb([]);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [hocKyId, dateStart, dateEnd]);

    return { tkb, loading };
};
