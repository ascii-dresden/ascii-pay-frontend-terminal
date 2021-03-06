import React from 'react';
import { MdArrowBack } from 'react-icons/md';
import Money from '../components/Money';
import { useAppSelector } from '../store';
import './Envelope.scss';
import { getTotal } from './registerSlice';
import { useTranslation } from 'react-i18next';

export default function Envelope() {
  const { t } = useTranslation();

  const coinBox = useAppSelector((state) => state.register.coinBox);
  const noteBox = useAppSelector((state) => state.register.noteBox);
  const previousCoinBox = useAppSelector((state) => state.register.previous?.coinBox);
  const previousNoteBox = useAppSelector((state) => state.register.previous?.noteBox);

  if (!previousCoinBox || !previousNoteBox) {
    return (
      <div className="envelope empty">
        <MdArrowBack />
        <span>{t('register.start')}</span>
      </div>
    );
  }

  const currentTotal = getTotal(coinBox, noteBox);
  const previousTotal = getTotal(previousCoinBox, previousNoteBox);

  const today = new Date();
  const date = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${today.getFullYear()}`;

  return (
    <div className="envelope">
      <div className="cash-book">
        <span>{t('register.cashBook')}</span>
        <div className="cash-book-list">
          <Money value={previousTotal} />
          <Money value={previousTotal - currentTotal} />
          <Money value={currentTotal} />
          <span>-</span>
          <span>{date}</span>
          <span>{previousNoteBox.note100}</span>
          <span>{previousNoteBox.note50}</span>
          <span>{previousNoteBox.note20}</span>
          <span>{previousNoteBox.note10}</span>
          <span>{previousNoteBox.note5}</span>
          <span>{previousCoinBox.coin200}</span>
          <span>{previousCoinBox.coin100}</span>
          <span>{previousCoinBox.coin50}</span>
          <span>{previousCoinBox.coin20}</span>
          <span>{previousCoinBox.coin10}</span>
          <span>{previousCoinBox.coin5}</span>
          <span>{previousCoinBox.coin2}</span>
          <span>{previousCoinBox.coin1}</span>
          <Money value={previousTotal} />
        </div>
      </div>

      <div className="envelope-columns">
        <div>
          <span>{t('register.envelope')}</span>
          <div>
            <div>
              <span>{t('register.name')}</span>
              <span className="secondary">{t('register.yourName')}</span>
            </div>
            <div>
              <span>{t('register.date')}</span>
              <span>{date}</span>
            </div>
            <div>
              <span>{t('register.total')}</span>
              <Money value={previousTotal - currentTotal} />
            </div>
          </div>
        </div>

        <div>
          <span>{t('register.coins')}</span>
          <div>
            <div>
              <span>2 EURO</span>
              <span>{previousCoinBox.coin200 - coinBox.coin200}</span>
            </div>
            <div>
              <span>1 EURO</span>
              <span>{previousCoinBox.coin100 - coinBox.coin100}</span>
            </div>
            <div>
              <span>50 CENT</span>
              <span>{previousCoinBox.coin50 - coinBox.coin50}</span>
            </div>
            <div>
              <span>20 CENT</span>
              <span>{previousCoinBox.coin20 - coinBox.coin20}</span>
            </div>
            <div>
              <span>10 CENT</span>
              <span>{previousCoinBox.coin10 - coinBox.coin10}</span>
            </div>
            <div>
              <span>5 CENT</span>
              <span>{previousCoinBox.coin5 - coinBox.coin5}</span>
            </div>
            <div>
              <span>2 CENT</span>
              <span>{previousCoinBox.coin2 - coinBox.coin2}</span>
            </div>
            <div>
              <span>1 CENT</span>
              <span>{previousCoinBox.coin1 - coinBox.coin1}</span>
            </div>
          </div>
        </div>

        <div>
          <span>{t('register.notes')}</span>
          <div>
            <div>
              <span>100 EURO</span>
              <span>{previousNoteBox.note100 - noteBox.note100}</span>
            </div>
            <div>
              <span>50 EURO</span>
              <span>{previousNoteBox.note50 - noteBox.note50}</span>
            </div>
            <div>
              <span>20 EURO</span>
              <span>{previousNoteBox.note20 - noteBox.note20}</span>
            </div>
            <div>
              <span>10 EURO</span>
              <span>{previousNoteBox.note10 - noteBox.note10}</span>
            </div>
            <div>
              <span>5 EURO</span>
              <span>{previousNoteBox.note5 - noteBox.note5}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
