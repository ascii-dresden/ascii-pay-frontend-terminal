import React from 'react';
import { MdEuroSymbol, MdPhoto } from 'react-icons/md';
import { SERVER_URI } from '..';
import Money from '../components/Money';
import Stamp from '../components/Stamp';
import { useAppDispatch, useAppSelector } from '../store';
import { StampType } from '../types/graphql-global';
import './Basket.scss';
import {
  groupPaymentItems,
  PaymentItem,
  paymentItemEqual,
  removePaymentItemAtIndex,
  setKeypadValue,
} from './paymentSlice';

export function findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
  let l = array.length;
  while (l--) {
    if (predicate(array[l], l, array)) return l;
  }
  return -1;
}

export default function Basket() {
  const storedPaymentItems = useAppSelector((state) => state.payment.storedPaymentItems);
  const keypadValue = useAppSelector((state) => state.payment.keypadValue);
  const dispatch = useAppDispatch();

  if (storedPaymentItems.length <= 0 && keypadValue === 0) {
    return <div className="basket-empty">No entries!</div>;
  }

  const paymentItemMap = groupPaymentItems(storedPaymentItems);

  const onRemove = (item: PaymentItem) => {
    let i = findLastIndex(storedPaymentItems, (v) => paymentItemEqual(v, item));
    dispatch(removePaymentItemAtIndex(i));
  };

  let content: any = [];
  let index = 0;

  for (let [value, count] of paymentItemMap) {
    let image;

    if (value.product) {
      if (value.product.image) {
        image = (
          <div>
            <img src={SERVER_URI + value.product.image} alt="" />
          </div>
        );
      } else {
        image = (
          <div>
            <MdPhoto />
          </div>
        );
      }
    } else {
      image = (
        <div>
          <MdEuroSymbol />
        </div>
      );
    }

    let stamps: any[] = [];
    if (value.payWithStamps === StampType.COFFEE) {
      stamps.push(<Stamp key="coffee-10" value={-10} type={StampType.COFFEE} />);
    } else if (value.payWithStamps === StampType.BOTTLE) {
      stamps.push(<Stamp key="bottle-10" value={-10} type={StampType.BOTTLE} />);
    }

    if (value.giveStamps === StampType.COFFEE) {
      stamps.push(<Stamp key="coffee+1" value={1} type={StampType.COFFEE} />);
    } else if (value.giveStamps === StampType.BOTTLE) {
      stamps.push(<Stamp key="bottle+1" value={1} type={StampType.BOTTLE} />);
    }

    let colorClass = value.colorHint ? ' ' + value.colorHint : '';

    content.push(
      <div key={index} onClick={() => onRemove(value)}>
        <div className="basket-entry">
          <div className={'basket-entry-image' + colorClass}>
            <div>{image}</div>
          </div>
          <div className="basket-entry-content">
            <div>{value.product?.name ?? value.nameHint}</div>
            <div className="basket-entry-stamps">{stamps}</div>
          </div>
          <div className="basket-entry-price">
            {count > 1 ? <span className="basket-entry-count">{count}</span> : null}
            <Money value={value.price} />
          </div>
        </div>
      </div>
    );

    index += 1;
  }

  if (keypadValue !== 0) {
    content.push(
      <div key={index} onClick={() => dispatch(setKeypadValue(0))}>
        <div className="basket-entry inactive">
          <div className={'basket-entry-image'}>
            <div>
              <div>
                <MdEuroSymbol />
              </div>
            </div>
          </div>
          <div className="basket-entry-content">
            <div>Eigener Betrag</div>
          </div>
          <div className="basket-entry-price">
            <Money value={keypadValue} />
          </div>
        </div>
      </div>
    );

    index += 1;
  }

  return (
    <div className="basket">
      <div>{content}</div>
    </div>
  );
}