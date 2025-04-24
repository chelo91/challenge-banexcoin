import { Decimal } from 'decimal.js';

/**
 * Redondea un número a 2 decimales
 * @param value Número a redondear
 * @returns Número redondeado a 2 decimales
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}


/**
 * Calcula la comisión (1 %) y la reparte según exista o no referido.
 * @param amount            Importe en USD (o la divisa base) como número.
 * @returns                 fee  → comisión total
 *                           ref  → porción para el referido
 *                           plat → porción para la plataforma
 */
export function calcWithDecimal(amount: number) {
  // Trabaja en dólares -> multiplica al final por 100 si quieres céntimos
  const fee    = new Decimal(amount).mul(0.01).toDecimalPlaces(2, Decimal.ROUND_FLOOR);
  const refRaw = fee.mul(0.5);
  const ref    = refRaw.toDecimalPlaces(2, Decimal.ROUND_FLOOR);
  const plat   = fee.minus(ref); // sin pérdidas

  return { fee: fee.toNumber(), ref: ref.toNumber(), plat: plat.toNumber() };
}
