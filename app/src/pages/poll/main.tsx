import { Section } from '@nebula-js/ui';
import { FormLayout } from 'components/layouts/FormLayout';
import { fixHMR } from 'fix-hmr';
import styled from 'styled-components';
import React from 'react';
import { ChevronRightRounded } from '@material-ui/icons';
import { Link } from 'react-router-dom';

export interface PollMainProps {
  className?: string;
}

function PollMainBase({ className }: PollMainProps) {
  return (
    <FormLayout className={className} title="Create Poll">
      <Section>
        <h2>Choose a proposal</h2>
        <ul className="list">
          <li>
            <h3>Cluster registration</h3>
            <ul>
              <li>
                <Link to="/polls/create/whitelist-cluster">
                  <span>Whitelist Cluster</span>
                  <ChevronRightRounded />
                </Link>
              </li>
              <li>
                <Link to="/polls/create/blacklist-cluster">
                  <span>Blacklist Cluster</span>
                  <ChevronRightRounded />
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <h3>Parameter Change</h3>
            <ul>
              <li>
                <Link to="/polls/create/cluster-parameter-change">
                  <span>Cluster Parameter Change</span>
                  <ChevronRightRounded />
                </Link>
              </li>
              <li>
                <Link to="/polls/create/governance-parameter-change">
                  <span>Governance Parameter Change</span>
                  <ChevronRightRounded />
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <h3>Others / Suggestions</h3>
            <ul>
              <li>
                <Link to="/polls/create/community-pool-spend">
                  <span>Community Pool spend</span>
                  <ChevronRightRounded />
                </Link>
              </li>
              <li>
                <Link to="/polls/create/text">
                  <span>Text Poll</span>
                  <ChevronRightRounded />
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </Section>
    </FormLayout>
  );
}

const StyledPollMain = styled(PollMainBase)`
  h2 {
    font-size: 1.42857143em;
    font-weight: 500;
    text-align: center;

    margin-bottom: 2.28571429em;
  }

  ul {
    list-style: none;
    padding: 0;

    h3 {
      font-size: 12px;
      font-weight: 500;
      color: var(--color-white44);
      padding-bottom: 0.85714286em;

      border-bottom: 1px solid var(--color-gray22);
    }

    a {
      display: flex;
      justify-content: space-between;
      align-items: center;

      font-size: 1.14285714em;
      font-weight: 500;
      color: var(--color-white92);
      text-decoration: none;

      padding: 1.14285714em var(--section-padding-h);
      margin: 0 calc(var(--section-padding-h) * -1);

      &:hover {
        background-color: var(--color-gray22);
      }

      svg {
        font-size: 1em;
        transform: scale(1.2);
      }
    }
  }

  .list > li:not(:first-child) {
    margin-top: 2.85714286em;
  }
`;

export default fixHMR(StyledPollMain);
