import * as React from 'react';

import { MdOutlineForward, MdBackspace } from 'react-icons/md';
import Money from './Money';

import './Keypad.scss';

const MAX = 999_999;
const MIN = -999_999;

function validateValue(value: number): number {
  return Math.max(MIN, Math.min(MAX, value));
}

export default function Keypad(props: {
  value: number;
  onChange: (value: number) => void;
  onSubmit: (value: number) => void;
}) {
  const onDigitPressed = (digit: number) => {
    let newValue = props.value * 10 + (Math.sign(props.value) || 1) * digit;
    props.onChange(validateValue(newValue));
  };

  const onBackspace = () => {
    let newValue = Math.sign(props.value) * Math.floor(Math.abs(props.value / 10));
    props.onChange(validateValue(newValue));
  };

  const onNegate = () => {
    let newValue = -props.value;
    props.onChange(validateValue(newValue));
  };

  const onSubmit = () => {
    props.onSubmit(props.value);
  };

  return (
    <div className="keypad">
      <div className="keypad-display">
        <Money value={props.value} />
      </div>
      <div className="keypad-submit">
        <MdOutlineForward onClick={() => onSubmit()} />
      </div>
      <div className="keypad-keys">
        <div className="keypad-key" onClick={() => onDigitPressed(7)}>
          7
        </div>
        <div className="keypad-key" onClick={() => onDigitPressed(8)}>
          8
        </div>
        <div className="keypad-key" onClick={() => onDigitPressed(9)}>
          9
        </div>
        <div className="keypad-key" onClick={() => onDigitPressed(4)}>
          4
        </div>
        <div className="keypad-key" onClick={() => onDigitPressed(5)}>
          5
        </div>
        <div className="keypad-key" onClick={() => onDigitPressed(6)}>
          6
        </div>
        <div className="keypad-key" onClick={() => onDigitPressed(1)}>
          1
        </div>
        <div className="keypad-key" onClick={() => onDigitPressed(2)}>
          2
        </div>
        <div className="keypad-key" onClick={() => onDigitPressed(3)}>
          3
        </div>
        <div className="keypad-key" onClick={() => onNegate()}>
          ±
        </div>
        <div className="keypad-key" onClick={() => onDigitPressed(0)}>
          0
        </div>
        <div className="keypad-key" onClick={() => onBackspace()}>
          <MdBackspace />
        </div>
      </div>
    </div>
  );
}
