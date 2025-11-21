import { useEffect, useState } from "react";
import { gvAPI } from "../api/gvAPI";
import type { TKBWeeklyItemDTO } from "../types";

export const useGVTKBWeekly = (
    hocKyId: string,
    dateStart: string,
    dateEnd: string
) => {
    const [tkb, setTkb] = useState<TKBWeeklyItemDTO[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!hocKyId || !dateStart || !dateEnd) {
            setTkb([]);
            return;
        }

        const fetch = async () => {
            setLoading(true);
            try {
                const result = await gvAPI.getTKBWeekly(hocKyId, dateStart, dateEnd);
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
