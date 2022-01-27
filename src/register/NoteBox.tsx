import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setNote10, setNote100, setNote20, setNote5, setNote50 } from './registerSlice';
import './NoteBox.scss';
import Money, { moneyToString } from '../components/Money';
import Hammer from 'react-hammerjs';

function NoteGroup(props: { name: string; image: string; centValue: number; count: number; previousCount: number }) {
  const stacks = Array.from({ length: Math.max(1, Math.max(props.count, props.previousCount)) }, (_, noteIndex) => {
    let classList = 'note';
    if (noteIndex >= props.count) {
      classList += ' previous';

      if (noteIndex >= props.previousCount) {
        classList += ' empty';
      }
    }

    if (noteIndex % 5 === 0) {
      classList += ' note-bundle';
    }

    let rotation = ((props.centValue + noteIndex * 3) % 7) - 3;
    return (
      <img
        src={props.image}
        alt={moneyToString(props.centValue)}
        key={noteIndex}
        className={classList}
        draggable={false}
        style={{ transform: `rotate(${rotation}deg)` }}
      />
    );
  });

  return (
    <div className={'note-group note-group-' + props.centValue} data-value={props.centValue}>
      <span>{props.name}</span>
      <div className="note-stack-group">{stacks}</div>
      <div className="note-group-sum">
        <span>{props.count}</span>
        <Money value={props.count * props.centValue} />
      </div>
    </div>
  );
}

export default function NoteBox() {
  const noteBox = useAppSelector((state) => state.register.noteBox);
  const previousNoteBox = useAppSelector((state) => state.register.previous?.noteBox);
  const dispatch = useAppDispatch();

  const [selectedGroup, setSelectedGroup] = useState(
    null as { cents: number; noteHeight: number; top: number; height: number; offset: number } | null
  );

  const getNoteCount = (cents: number) => {
    switch (cents) {
      case 10000:
        return noteBox.note100;
      case 5000:
        return noteBox.note50;
      case 2000:
        return noteBox.note20;
      case 1000:
        return noteBox.note10;
      case 500:
        return noteBox.note5;
    }
    return 0;
  };

  const setNoteCount = (cents: number, count: number) => {
    if (isNaN(count) || !isFinite(count)) {
      count = 0;
    }

    switch (cents) {
      case 10000:
        dispatch(setNote100(count));
        break;
      case 5000:
        dispatch(setNote50(count));
        break;
      case 2000:
        dispatch(setNote20(count));
        break;
      case 1000:
        dispatch(setNote10(count));
        break;
      case 500:
        dispatch(setNote5(count));
        break;
    }
  };

  const handleTab = (event: HammerInput) => {
    if (previousNoteBox) return;
    let currentElement: HTMLElement | null = event.target;
    let targetCents = 0;
    let targetTop = 0;
    let targetHeight = 0;

    while (currentElement != null) {
      if (currentElement.classList.contains('note-stack-group')) {
        targetTop = currentElement.offsetTop;
        targetHeight = currentElement.clientHeight;
      }
      if (currentElement.classList.contains('note-group')) {
        targetCents = parseInt(currentElement.dataset['value'] ?? '0');
        break;
      }
      currentElement = currentElement.parentElement;
    }

    if (targetCents !== 0 && targetHeight !== 0) {
      let noteHeight = document.getElementsByClassName('note')[0].clientHeight;
      let newCount = Math.round((targetHeight - (event.center.y - targetTop) - noteHeight * 0.5) / (noteHeight * 0.25));
      setNoteCount(targetCents, newCount);
    }
  };
  const handlePress = (event: HammerInput) => {
    if (previousNoteBox) return;
    let currentElement: HTMLElement | null = event.target;
    let targetCents = 0;
    let targetTop = 0;
    let targetHeight = 0;

    while (currentElement != null) {
      if (currentElement.classList.contains('note-stack-group')) {
        targetTop = currentElement.offsetTop;
        targetHeight = currentElement.clientHeight;
      }
      if (currentElement.classList.contains('note-group')) {
        targetCents = parseInt(currentElement.dataset['value'] ?? '0');
        break;
      }
      currentElement = currentElement.parentElement;
    }

    if (targetCents !== 0 && targetHeight !== 0) {
      let noteHeight = document.getElementsByClassName('note')[0].clientHeight;
      let newCount = Math.round((targetHeight - (event.center.y - targetTop) - noteHeight * 0.5) / (noteHeight * 0.25));
      setNoteCount(targetCents, newCount);

      setSelectedGroup({
        cents: targetCents,
        noteHeight: noteHeight,
        top: targetTop,
        height: targetHeight,
        offset: 0,
      });
    }
  };
  const handlePanStart = (event: HammerInput) => {
    if (previousNoteBox) return;
    let currentElement: HTMLElement | null = event.target;
    let targetCents = 0;
    let targetTop = 0;
    let targetHeight = 0;

    while (currentElement != null) {
      if (currentElement.classList.contains('note-stack-group')) {
        targetTop = currentElement.offsetTop;
        targetHeight = currentElement.clientHeight;
      }
      if (currentElement.classList.contains('note-group')) {
        targetCents = parseInt(currentElement.dataset['value'] ?? '0');
        break;
      }
      currentElement = currentElement.parentElement;
    }

    if (targetCents !== 0 && targetHeight !== 0) {
      let noteHeight = document.getElementsByClassName('note')[0].clientHeight;
      let currentCount = getNoteCount(targetCents);
      let newCount = Math.round((targetHeight - (event.center.y - targetTop) - noteHeight * 0.5) / (noteHeight * 0.25));

      setSelectedGroup({
        cents: targetCents,
        noteHeight: noteHeight,
        top: targetTop,
        height: targetHeight,
        offset: newCount - currentCount,
      });
    }
  };
  const handlePan = (event: HammerInput) => {
    if (previousNoteBox) return;

    if (selectedGroup) {
      let newCount =
        Math.round(
          (selectedGroup.height - (event.center.y - selectedGroup.top) - selectedGroup.noteHeight * 0.5) /
            (selectedGroup.noteHeight * 0.25)
        ) - selectedGroup.offset;

      setNoteCount(selectedGroup.cents, newCount);
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
      <div className="note-box">
        <div>
          <NoteGroup
            name="100 EURO"
            image="/register/note100.png"
            centValue={10000}
            count={noteBox.note100}
            previousCount={previousNoteBox?.note100 ?? 0}
          />
        </div>

        <div>
          <NoteGroup
            name="50 EURO"
            image="/register/note50.png"
            centValue={5000}
            count={noteBox.note50}
            previousCount={previousNoteBox?.note50 ?? 0}
          />
        </div>

        <div>
          <NoteGroup
            name="20 EURO"
            image="/register/note20.png"
            centValue={2000}
            count={noteBox.note20}
            previousCount={previousNoteBox?.note20 ?? 0}
          />
        </div>

        <div>
          <NoteGroup
            name="10 EURO"
            image="/register/note10.png"
            centValue={1000}
            count={noteBox.note10}
            previousCount={previousNoteBox?.note10 ?? 0}
          />
        </div>

        <div>
          <NoteGroup
            name="5 EURO"
            image="/register/note5.png"
            centValue={500}
            count={noteBox.note5}
            previousCount={previousNoteBox?.note5 ?? 0}
          />
        </div>
      </div>
    </Hammer>
  );
}
