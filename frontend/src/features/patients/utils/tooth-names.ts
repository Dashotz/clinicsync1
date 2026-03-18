/** Universal numbering (1–32) to display name for charting modals */
export const TOOTH_NUMBER_TO_NAME: Record<number, string> = {
  1: '3rd Molar',
  2: '2nd Molar',
  3: '1st Molar',
  4: '2nd Bicuspid',
  5: '1st Bicuspid',
  6: 'Cuspid',
  7: 'Lateral Incisor',
  8: 'Central Incisor',
  9: 'Central Incisor',
  10: 'Lateral Incisor',
  11: 'Cuspid',
  12: '1st Bicuspid',
  13: '2nd Bicuspid',
  14: '1st Molar',
  15: '2nd Molar',
  16: '3rd Molar',
  17: '3rd Molar',
  18: '2nd Molar',
  19: '1st Molar',
  20: '2nd Bicuspid',
  21: '1st Bicuspid',
  22: 'Cuspid',
  23: 'Lateral Incisor',
  24: 'Central Incisor',
  25: 'Central Incisor',
  26: 'Lateral Incisor',
  27: 'Cuspid',
  28: '1st Bicuspid',
  29: '2nd Bicuspid',
  30: '1st Molar',
  31: '2nd Molar',
  32: '3rd Molar',
};

export function getToothDisplayName(toothNumber: number): string {
  return TOOTH_NUMBER_TO_NAME[toothNumber] ?? `Tooth ${toothNumber}`;
}
