import { Pickaxe, SquareSquare } from "lucide-react";

export const featureFlagsConfig = [
    {
        label: "Advanced table",
        value: "advancedTable" as const,
        icon: Pickaxe,
        tooltipTitle: "Toggle advanced table",
        tooltipDescription: "A filter and sort builder to filter and sort rows."
    },
    {
        label: "Floating bar",
        value: "floatingBar" as const,
        icon: SquareSquare,
        tooltipTitle: "Toggle floating bar",
        tooltipDescription: "A floating bar that sticks to the top of the table."
    }
];
