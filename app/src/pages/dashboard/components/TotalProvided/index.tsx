import { JSDateTime, uUST } from '@nebula-js/types';
import { DiffSpan } from '@nebula-js/ui';
import React from 'react';
import styled, { useTheme } from 'styled-components';
import { AreaChart } from './AreaChart';

const chartData = Array.from(
  { length: Math.floor(Math.random() * 30) + 30 },
  (_, i) => {
    return {
      y: 10 * i + 10 - Math.random() * 20,
      amount: i.toString() as uUST,
      date: Date.now() as JSDateTime,
    };
  },
);

export interface TotalProvidedProps {
  className?: string;
}

function TotalProvidedBase({ className }: TotalProvidedProps) {
  const theme = useTheme();

  return (
    <div className={className}>
      <p>
        270.4B <span>UST</span>
      </p>
      <p>
        <DiffSpan diff={123.12} translateIconY="0.15em">
          123.12%
        </DiffSpan>
      </p>

      <AreaChart data={chartData} theme={theme} />
    </div>
  );
}

export const TotalProvided = styled(TotalProvidedBase)`
  > :nth-child(1) {
    font-size: 2.2em;

    span {
      font-size: 12px;
    }
  }

  > :nth-child(2) {
    font-size: 12px;

    margin-bottom: 1rem;
  }
`;
