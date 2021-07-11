import { JSDateTime, u, UST } from '@nebula-js/types';
import { DiffSpan, Sub } from '@nebula-js/ui';
import React from 'react';
import { useStyle } from 'style-router';
import styled from 'styled-components';
import { AreaChart } from './AreaChart';

const chartData = Array.from(
  { length: Math.floor(Math.random() * 30) + 30 },
  (_, i) => {
    return {
      y: 10 * i + 10 - Math.random() * 20,
      amount: i.toString() as u<UST>,
      date: Date.now() as JSDateTime,
    };
  },
);

export interface TotalProvidedProps {
  className?: string;
}

function TotalProvidedBase({ className }: TotalProvidedProps) {
  const { color } = useStyle();

  return (
    <div className={className}>
      <p>
        270.4B <Sub>UST</Sub>
      </p>
      <p>
        <DiffSpan diff={123.12} translateIconY="0.15em">
          123.12%
        </DiffSpan>
      </p>

      <AreaChart data={chartData} color={color} />
    </div>
  );
}

export const TotalProvided = styled(TotalProvidedBase)`
  > :nth-child(1) {
    font-size: var(--font-size32);
  }

  > :nth-child(2) {
    font-size: var(--font-size12);

    margin-bottom: 1rem;
  }
`;
