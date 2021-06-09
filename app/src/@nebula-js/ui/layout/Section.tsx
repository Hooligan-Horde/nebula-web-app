import styled, { css } from 'styled-components';
import React, { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { screen } from '../env';

export interface SectionProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  isLoading?: boolean;
  children: ReactNode;
}

function SectionBase({ isLoading, children, ...sectionProps }: SectionProps) {
  return (
    <section {...sectionProps}>
      {children}
      {isLoading && <div>Loading...</div>}
    </section>
  );
}

const loadingStyle = css`
  pointer-events: none;
`;

export const Section = styled(SectionBase)`
  ${({ isLoading = false }) => (isLoading ? loadingStyle : '')};

  padding: 2.85rem 2.3rem;

  border-radius: 8px;

  background-color: ${({ theme }) => theme.colors.gray18};
  color: ${({ theme }) => theme.colors.white92};

  h1 {
    font-size: 2rem;
  }

  // small layout
  @media (max-width: ${screen.tablet.max}px) {
    padding: 2.6rem 2rem;

    h1 {
      font-size: 1.6rem;
    }
  }
`;
