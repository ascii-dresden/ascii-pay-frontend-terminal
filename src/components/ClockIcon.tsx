import React from 'react';
import Clock from 'react-clock';

import './ClockIcon.scss';
import 'react-clock/dist/Clock.css';

export default function ClockIcon() {
  const [today, setDate] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="clock-icon">
      <Clock
        value={today}
        hourHandLength={50}
        hourHandOppositeLength={8}
        hourHandWidth={3}
        minuteHandLength={70}
        minuteHandOppositeLength={8}
        minuteHandWidth={2.5}
        renderHourMarks={false}
        renderMinuteMarks={false}
        renderSecondHand={false}
      />
    </div>
  );
}
