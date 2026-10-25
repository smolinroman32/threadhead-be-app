const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function normalizeHexColor(value: string) {
    const color = value.trim();

    return HEX_COLOR.test(color) ? color.toUpperCase() : null;
}
