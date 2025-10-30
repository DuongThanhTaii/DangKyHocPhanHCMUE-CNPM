import { useEffect, useState } from "react";
import { svApi } from "../api/svApi";
import type { MonHocTraCuuDTO } from "../types";
export const useTraCuuHocPhan = (hocKyId: string) => {
    const [data, setData] = useState<MonHocTraCuuDTO[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!hocKyId) {
            setData([]);
            return;
        }

        const fetch = async () => {
            setLoading(true);
            try {
                const result = await svApi.traCuuHocPhan(hocKyId);
                if (result.isSuccess && result.data) {
                    setData(result.data);
                } else {
                    setData([]);
                }
            } catch {
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [hocKyId]);

    return { data, loading };
};
