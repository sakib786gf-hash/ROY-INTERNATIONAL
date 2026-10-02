/**
 * Converts a numeric amount to Indian Currency words
 * e.g., 75500 -> "SEVENTY FIVE THOUSAND FIVE HUNDRED RUPEES ONLY"
 */

const ones = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
  'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
];

const tens = [
  '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'
];

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';
  
  let str = '';
  if (num >= 100) {
    str += ones[Math.floor(num / 100)] + ' HUNDRED ';
    num %= 100;
  }
  
  if (num >= 20) {
    str += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  
  if (num > 0) {
    str += ones[num] + ' ';
  }
  
  return str.trim();
}

export function numberToIndianWords(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return 'ZERO RUPEES.';
  }

  let num = Math.floor(Math.abs(amount));
  
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  
  const remainder = num;
  
  let result = '';
  
  if (crore > 0) {
    result += convertLessThanThousand(crore) + ' CRORE ';
  }
  if (lakh > 0) {
    result += convertLessThanThousand(lakh) + ' LAKH ';
  }
  if (thousand > 0) {
    result += convertLessThanThousand(thousand) + ' THOUSAND ';
  }
  if (remainder > 0) {
    result += convertLessThanThousand(remainder) + ' ';
  }

  result = result.trim() + ' RUPEES.';
  return result;
}
