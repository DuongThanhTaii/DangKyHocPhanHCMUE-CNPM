import type { ReactNode } from "react";
export interface MenuItem {
    to: string;
    icon: ReactNode;
    label: string;
}

export interface LayoutConfig {
    role: string;
    headerTitle: string;
    menuItems: MenuItem[];
}