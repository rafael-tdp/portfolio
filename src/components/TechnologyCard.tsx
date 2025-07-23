import React, { useRef } from "react";
import { iconMap } from "@/lib/technologies";

type Props = {
    id: string;
    icon: string;
    name: string;
    color?: string;
};

// Function to convert hex to HSL
function hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h * 360, s * 100, l * 100];
}

// Function to convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// Function to adjust color for better contrast
function getAdaptiveColor(originalColor: string): { lightMode: string; darkMode: string } {
    if (!originalColor) {
        return { lightMode: '#374151', darkMode: '#9ca3af' };
    }

    const [h, s, l] = hexToHsl(originalColor);

    // For light mode: ensure the color is dark enough (lightness < 60%)
    const lightModeColor = l > 60 ? hslToHex(h, s, Math.min(50, l - 20)) : originalColor;

    // For dark mode: ensure the color is light enough (lightness > 40%)
    const darkModeColor = l < 40 ? hslToHex(h, s, Math.max(60, l + 30)) : originalColor;

    return { lightMode: lightModeColor, darkMode: darkModeColor };
}

export default function TechnologyCard({ icon, name, color }: Props) {
    const IconComponent = iconMap[icon];

    const adaptiveColors = getAdaptiveColor(color || '');

    return (
        <div className="flex flex-col items-center justify-center gap-2 p-2">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md overflow-hidden">
                <div
                    className="absolute inset-0 opacity-10 dark:opacity-20"
                    style={{
                        backgroundColor: adaptiveColors.lightMode,
                    }}
                />
                <div
                    className="absolute inset-0 opacity-0 dark:opacity-20"
                    style={{
                        backgroundColor: adaptiveColors.darkMode,
                    }}
                />

                <div
                    className="absolute inset-0 rounded-xl border opacity-30 dark:opacity-50"
                    style={{
                        borderColor: adaptiveColors.lightMode,
                    }}
                />
                <div
                    className="absolute inset-0 rounded-xl border opacity-0 dark:opacity-50"
                    style={{
                        borderColor: adaptiveColors.darkMode,
                    }}
                />

                {IconComponent && (
                    <div className="relative z-10">
                        <IconComponent
                            className="text-2xl sm:text-3xl transition-colors duration-300 block dark:hidden"
                            style={{ color: adaptiveColors.lightMode }}
                        />
                        <IconComponent
                            className="text-2xl sm:text-3xl transition-colors duration-300 hidden dark:block"
                            style={{ color: adaptiveColors.darkMode }}
                        />
                    </div>
                )}
            </div>

            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                {name}
            </span>
        </div>
    );
}
