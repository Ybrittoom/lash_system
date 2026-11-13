export function isValidAmount(value) {
    return (
        typeof value === "number" && Number.isFinite(value) &&
        value >= 0 &&
        value <= 999999999.999 &&
        Number(value.toFixed(3)) === value
    )
}