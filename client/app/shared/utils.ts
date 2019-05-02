import Decimal from 'decimal.js';

export function moneyRoundUp(amount: number): number {
    return Math.ceil(+Decimal.mul(amount, 100)) / 100;
}

export function calculateSuggestedPrice(supplierPrice: string, margin: string, vatRate: string): number {
    const priceWithMargin = +supplierPrice + (+supplierPrice * +margin);
    const priceWithTaxes = priceWithMargin + priceWithMargin * +vatRate;

    return priceWithTaxes;
}

/**
 * Copy text to clipboard.
 * Accepts line breaks \n as textarea do.
 */
export function copy(value: string): void {
    const input = document.createElement('textarea');
    document.body.append(input);
    input.value = value;
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
}
