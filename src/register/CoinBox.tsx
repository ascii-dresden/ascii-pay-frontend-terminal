import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setCoin1, setCoin10, setCoin100, setCoin2, setCoin20, setCoin200, setCoin5, setCoin50 } from './registerSlice';
import './CoinBox.scss';
import Money from '../components/Money';
import Hammer from 'react-hammerjs';

type SuperscriptIndex = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
const superscriptMap = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

function CoinGroup(props: {
  name: string;
  stackCount: number;
  centValue: number;
  count: number;
  previousCount: number;
}) {
  const maxCoinIndex = props.stackCount * 5;

  const createCoinStack = (stackIndex: number) =>
    Array.from({ length: 5 }, (_, invCoinIndex) => {
      const coinIndex = maxCoinIndex - (stackIndex * 5 + invCoinIndex);
      let classList = 'coin';

      if (coinIndex <= props.count) {
        classList += ' active';
      }
      if (coinIndex + maxCoinIndex <= props.count) {
        classList += ' overflow';
      }
      if (2 * maxCoinIndex <= props.count) {
        classList += ' dead';
      }
      if (coinIndex <= props.previousCount) {
        classList += ' previous';
      }
      return <span key={coinIndex} className={classList}></span>;
    });
  const stacks = Array.from({ length: props.stackCount }, (_, stackIndex) => {
    const value = (props.centValue * 5 * (props.stackCount - stackIndex)).toString().padStart(3, '0');
    let supValue = value.substr(0, value.length - 2);

    if (!value.endsWith('00')) {
      supValue =
        supValue +
        superscriptMap[value[value.length - 2] as SuperscriptIndex] +
        superscriptMap[value[value.length - 1] as SuperscriptIndex];
    }

    return (
      <div className="coin-stack" key={stackIndex} data-value={supValue}>
        {createCoinStack(stackIndex)}
      </div>
    );
  });

  return (
    <div className={'coin-group coin-group-' + props.centValue} data-value={props.centValue}>
      <span>{props.name}</span>
      <div className="coin-stack-group">{stacks}</div>
      <div className="coin-group-sum">
        <span>{props.count}</span>
        <Money value={props.count * props.centValue} />
      </div>
    </div>
  );
}

export default function CoinBox() {
  const coinBox = useAppSelector((state) => state.register.coinBox);
  const previousCoinBox = useAppSelector((state) => state.register.previous?.coinBox);
  const dispatch = useAppDispatch();

  const [selectedGroup, setSelectedGroup] = useState(
    null as { cents: number; count: number; top: number; height: number; offset: number } | null
  );

  useEffect(() => {
    document.body.classList.add('coin-box-body');
    return () => {
      document.body.classList.remove('coin-box-body');
    };
  });

  const getCoinCount = (cents: number) => {
    switch (cents) {
      case 200:
        return coinBox.coin200;
      case 100:
        return coinBox.coin100;
      case 50:
        return coinBox.coin50;
      case 20:
        return coinBox.coin20;
      case 10:
        return coinBox.coin10;
      case 5:
        return coinBox.coin5;
      case 2:
        return coinBox.coin2;
      case 1:
        return coinBox.coin1;
    }
    return 0;
  };

  const setCoinCount = (cents: number, count: number) => {
    if (isNaN(count) || !isFinite(count)) {
      count = 0;
    }

    switch (cents) {
      case 200:
        dispatch(setCoin200(count));
        break;
      case 100:
        dispatch(setCoin100(count));
        break;
      case 50:
        dispatch(setCoin50(count));
        break;
      case 20:
        dispatch(setCoin20(count));
        break;
      case 10:
        dispatch(setCoin10(count));
        break;
      case 5:
        dispatch(setCoin5(count));
        break;
      case 2:
        dispatch(setCoin2(count));
        break;
      case 1:
        dispatch(setCoin1(count));
        break;
    }
  };

  const handleTab = (event: HammerInput) => {
    if (previousCoinBox) return;
    let currentElement: HTMLElement | null = event.target;
    let targetCents = 0;
    let targetCentCount = 0;
    let targetTop = 0;
    let targetHeight = 0;

    while (currentElement != null) {
      if (currentElement.classList.contains('coin-stack-group')) {
        targetTop = currentElement.offsetTop;
        targetHeight = currentElement.clientHeight;
        targetCentCount = currentElement.getElementsByClassName('coin').length;
      }
      if (currentElement.classList.contains('coin-group')) {
        targetCents = parseInt(currentElement.dataset['value'] ?? '0');
        break;
      }
      currentElement = currentElement.parentElement;
    }

    if (targetCents !== 0 && targetHeight !== 0) {
      let newCount = targetCentCount - Math.round(((event.center.y - targetTop) / targetHeight) * targetCentCount);
      setCoinCount(targetCents, newCount);
    }
  };

  const handlePress = (event: HammerInput) => {
    if (previousCoinBox) return;
    let currentElement: HTMLElement | null = event.target;
    let targetCents = 0;
    let targetCentCount = 0;
    let targetTop = 0;
    let targetHeight = 0;

    while (currentElement != null) {
      if (currentElement.classList.contains('coin-stack-group')) {
        targetTop = currentElement.offsetTop;
        targetHeight = currentElement.clientHeight;
        targetCentCount = currentElement.getElementsByClassName('coin').length;
      }
      if (currentElement.classList.contains('coin-group')) {
        targetCents = parseInt(currentElement.dataset['value'] ?? '0');
        break;
      }
      currentElement = currentElement.parentElement;
    }

    if (targetCents !== 0 && targetHeight !== 0) {
      let newCount = targetCentCount - Math.round(((event.center.y - targetTop) / targetHeight) * targetCentCount);
      setCoinCount(targetCents, newCount);

      setSelectedGroup({
        cents: targetCents,
        count: targetCentCount,
        top: targetTop,
        height: targetHeight,
        offset: 0,
      });
    }
  };

  const handlePanStart = (event: HammerInput) => {
    if (previousCoinBox) return;
    let currentElement: HTMLElement | null = event.target;
    let targetCents = 0;
    let targetCentCount = 0;
    let targetTop = 0;
    let targetHeight = 0;

    while (currentElement != null) {
      if (currentElement.classList.contains('coin-stack-group')) {
        targetTop = currentElement.offsetTop;
        targetHeight = currentElement.clientHeight;
        targetCentCount = currentElement.getElementsByClassName('coin').length;
      }
      if (currentElement.classList.contains('coin-group')) {
        targetCents = parseInt(currentElement.dataset['value'] ?? '0');
        break;
      }
      currentElement = currentElement.parentElement;
    }

    if (targetCents !== 0 && targetHeight !== 0) {
      let currentCount = getCoinCount(targetCents);
      let newCount = targetCentCount - Math.round(((event.center.y - targetTop) / targetHeight) * targetCentCount);

      setSelectedGroup({
        cents: targetCents,
        count: targetCentCount,
        top: targetTop,
        height: targetHeight,
        offset: newCount - currentCount,
      });
    }
  };

  const handlePan = (event: HammerInput) => {
    if (previousCoinBox) return;

    if (selectedGroup) {
      let newCount =
        selectedGroup.count -
        Math.round(((event.center.y - selectedGroup.top) / selectedGroup.height) * selectedGroup.count) -
        selectedGroup.offset;

      setCoinCount(selectedGroup.cents, newCount);
    }
  };

  return (
    <Hammer
      direction={'DIRECTION_ALL'}
      onTap={handleTab}
      onPress={handlePress}
      onPanStart={handlePanStart}
      onPan={handlePan}
    >
      <div className="coin-box">
        <div>
          <CoinGroup
            name="2 EURO"
            stackCount={12}
            centValue={200}
            count={coinBox.coin200}
            previousCount={previousCoinBox?.coin200 ?? 0}
          />
        </div>

        <div>
          <CoinGroup
            name="1 EURO"
            stackCount={11}
            centValue={100}
            count={coinBox.coin100}
            previousCount={previousCoinBox?.coin100 ?? 0}
          />
        </div>

        <div>
          <CoinGroup
            name="50 CENT"
            stackCount={11}
            centValue={50}
            count={coinBox.coin50}
            previousCount={previousCoinBox?.coin50 ?? 0}
          />
        </div>

        <div>
          <CoinGroup
            name="20 CENT"
            stackCount={12}
            centValue={20}
            count={coinBox.coin20}
            previousCount={previousCoinBox?.coin20 ?? 0}
          />
        </div>

        <div>
          <CoinGroup
            name="10 CENT"
            stackCount={13}
            centValue={10}
            count={coinBox.coin10}
            previousCount={previousCoinBox?.coin10 ?? 0}
          />
        </div>

        <div>
          <CoinGroup
            name="5 CENT"
            stackCount={15}
            centValue={5}
            count={coinBox.coin5}
            previousCount={previousCoinBox?.coin5 ?? 0}
          />
        </div>

        <div>
          <CoinGroup
            name="2 CENT"
            stackCount={6}
            centValue={2}
            count={coinBox.coin2}
            previousCount={previousCoinBox?.coin2 ?? 0}
          />
          <CoinGroup
            name="1 CENT"
            stackCount={7}
            centValue={1}
            count={coinBox.coin1}
            previousCount={previousCoinBox?.coin1 ?? 0}
          />
        </div>
      </div>
    </Hammer>
  );
}
