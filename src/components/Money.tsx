import React from 'react';

function fromatFloatString(nStr: string): string {
  let x = nStr.split('.');
  let x1 = x[0];
  let x2 = x.length > 1 ? ',' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1 $2');
  }
  return x1 + x2;
}

export function moneyToString(value: number): string {
  return fromatFloatString((value / 100).toFixed(2)) + ' €';
}

export default function Money(props: { value: number; compact?: boolean }) {
  if (props.compact) {
    let abs = Math.abs(props.value);
    let sign = props.value < 0 ? '-' : '';
    let euro = Math.floor(abs / 100).toString();
    let cent = (abs % 100).toString().padStart(2, '0');
    return (
      <span>
        {sign + euro}
        <sup>{cent}</sup>
      </span>
    );
  }

  return <span>{moneyToString(props.value)}</span>;
}
