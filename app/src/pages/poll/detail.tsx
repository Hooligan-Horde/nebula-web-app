import {
  formatRate,
  formatUTokenWithPostfixUnits,
  truncate,
} from '@libs/formatter';
import { gov } from '@nebula-js/types';
import {
  breakpoints,
  Button,
  HorizontalScrollTable,
  PartitionBarGraph,
  Section,
  TwoLine,
  useScreenSizeValue,
} from '@nebula-js/ui';
import { GovVoters, pickGovPollVoted } from '@nebula-js/app-fns';
import {
  useGovPollQuery,
  useGovStakerQuery,
  useGovVotersQuery,
} from '@nebula-js/app-provider';
import { useConnectedWallet, useWallet } from '@terra-money/wallet-provider';
import { MainLayout } from 'components/layouts/MainLayout';
import { fixHMR } from 'fix-hmr';
import React, { useMemo, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import useResizeObserver from 'use-resize-observer/polyfilled';
import { VoteForm } from './components/VoteForm';

export interface PollDetailProps {
  className?: string;
}

function PollDetailBase({ className }: PollDetailProps) {
  const { network } = useWallet();

  const match = useRouteMatch<{ pollId: string }>('/poll/:pollId');

  const { data: { parsedPoll } = {} } = useGovPollQuery(+match!.params.pollId);

  const [startVote, setStartVote] = useState<boolean>(false);

  const { ref, width = 300 } = useResizeObserver();

  const {
    data: { pages } = {},
    hasNextPage,
    fetchNextPage,
  } = useGovVotersQuery(+match!.params.pollId, 10);

  const connectedWallet = useConnectedWallet();

  const { data: { govStaker } = {} } = useGovStakerQuery(
    connectedWallet?.walletAddress,
  );

  const userVoterInfo = useMemo(() => {
    return pickGovPollVoted(govStaker, +match!.params.pollId);
  }, [govStaker, match]);

  const voters = useMemo<Array<gov.VotersResponse['voters'][number]>>(() => {
    if (!pages || pages.length === 0) {
      return [];
    }

    return [].concat(
      ...(pages
        .filter((page): page is GovVoters => !!page)
        .map((page) => page.voters.voters) as any),
    );
  }, [pages]);

  const buttonSize = useScreenSizeValue<'normal' | 'medium'>({
    mobile: 'medium',
    tablet: 'normal',
    pc: 'normal',
    monitor: 'normal',
  });

  return (
    <MainLayout className={className}>
      <h1>Poll details</h1>

      <div className="layout">
        <div className="description-column">
          <Section className="summary">
            <header>
              <div>
                <s>Whitelist CV</s>
              </div>
              <div data-in-progress-over={parsedPoll?.inProgressOver}>
                {parsedPoll?.status}
              </div>
            </header>

            <h2>{parsedPoll?.poll.title}</h2>

            <p>
              <span>Creator</span>
              <a
                href={`https://finder.terra.money/${network.chainID}/address/${parsedPoll?.poll.creator}`}
                target="_blank"
                rel="noreferrer"
              >
                {truncate(parsedPoll?.poll.creator)}
              </a>
            </p>
            <p>
              <span>Estimated end time</span>
              {parsedPoll?.endsIn.toLocaleString()}
            </p>
            {userVoterInfo && (
              <p>
                <span>You voted</span>
                {userVoterInfo.vote.toUpperCase()},{' '}
                {formatUTokenWithPostfixUnits(userVoterInfo.balance)} NEB
              </p>
            )}
            {!userVoterInfo &&
            parsedPoll?.poll.status === 'in_progress' &&
            parsedPoll?.inProgressOver === false ? (
              startVote && !!match ? (
                <VoteForm
                  className="form"
                  pollId={+match.params.pollId}
                  onVoteComplete={() => setStartVote(false)}
                />
              ) : (
                <Button
                  size={buttonSize}
                  color="paleblue"
                  fullWidth
                  onClick={() => setStartVote(true)}
                >
                  Vote
                </Button>
              )
            ) : null}
          </Section>

          <Section className="detail">
            <div>
              <h4>Description</h4>
              <p>{parsedPoll?.poll.description}</p>
            </div>

            <div>
              <h4>
                <s>Affected Cluster</s>
              </h4>
              <p>Next DOGE (NDOG)</p>
            </div>

            <div>
              <h4>
                <s>Oracle Feeder</s>
              </h4>
              <p>terra128968w0r6cche4pmf4xn5358kx2gth6tr</p>
            </div>

            <div>
              <h4>
                <s>Asset Allocation</s>
              </h4>
              <ul>
                <li>
                  <i /> Mirror Protocol (MIR) : 40%
                </li>
                <li>
                  <i /> Anchor Protocol (ANC) : 40%
                </li>
                <li>
                  <i /> Luna (LUNA) : 40%
                </li>
              </ul>
            </div>

            <div>
              <h4>
                <s>Penalty Parameters</s>
              </h4>
              <p>Alpha Plus : 1</p>
              <p>Alpha Minus : -1</p>
              <p>Sigma Plus : 1</p>
              <p>Sigma Minus : -1</p>
            </div>
          </Section>
        </div>

        <Section className="voters">
          <header>
            <TwoLine
              text={`Yes ${
                parsedPoll ? formatRate(parsedPoll?.votes.yesRatio) : '-'
              }%`}
              subText={`${
                parsedPoll
                  ? formatUTokenWithPostfixUnits(parsedPoll.votes.yes)
                  : '-'
              } NEB`}
            />
            <TwoLine
              text={`No ${
                parsedPoll ? formatRate(parsedPoll?.votes.noRatio) : '-'
              }%`}
              subText={`${
                parsedPoll
                  ? formatUTokenWithPostfixUnits(parsedPoll.votes.no)
                  : '-'
              } NEB`}
            />
            <TwoLine
              text={`Abstain ${
                parsedPoll ? formatRate(parsedPoll?.votes.abstainRatio) : '-'
              }%`}
              subText={`${
                parsedPoll
                  ? formatUTokenWithPostfixUnits(parsedPoll.votes.abstain)
                  : '-'
              } NEB`}
            />
          </header>

          <div ref={ref} className="voters-table">
            <PartitionBarGraph
              data={[
                { value: +(parsedPoll?.votes.yesRatio ?? 0), color: '#23bed9' },
                { value: +(parsedPoll?.votes.noRatio ?? 0), color: '#f15e7e' },
                {
                  value: +(parsedPoll?.votes.abstainRatio ?? 0),
                  color: '#a4a4a4',
                },
                {
                  value:
                    1 -
                    +(parsedPoll?.votes.yesRatio ?? 0) -
                    +(parsedPoll?.votes.noRatio ?? 0) -
                    +(parsedPoll?.votes.abstainRatio ?? 0),
                  color: '#3d3d3d',
                },
              ]}
              width={width}
              height={16}
              gap={0}
            />
          </div>

          <Table minWidth={300} startPadding="0rem" endPadding="0rem">
            <thead>
              <tr>
                <th>
                  <span>Voter</span>
                </th>
                <th>
                  <span>Vote</span>
                </th>
                <th>
                  <span>Balance</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {voters.map(({ voter, vote, balance }) => (
                <tr key={'row' + voter}>
                  <td>
                    <a
                      href={`https://finder.terra.money/${network.chainID}/address/${voter}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {truncate(voter)}
                    </a>
                  </td>
                  <td>{vote.toUpperCase()}</td>
                  <td>{formatUTokenWithPostfixUnits(balance)} NEB</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {hasNextPage && (
            <Button onClick={() => fetchNextPage()}>Load More</Button>
          )}
        </Section>
      </div>
    </MainLayout>
  );
}

const Table = styled(HorizontalScrollTable)`
  td,
  th {
    text-align: left;

    &:last-child {
      text-align: right;
    }
  }

  thead {
    tr {
      th {
        border-bottom: 1px solid var(--color-gray24);
      }
    }
  }
`;

const StyledPollDetail = styled(PollDetailBase)`
  h1 {
    margin-bottom: 24px;
  }

  a {
    color: inherit;
  }

  [data-in-progress-over='true'] {
    text-decoration: line-through;
  }

  .layout {
    display: flex;

    gap: 32px;

    .description-column {
      flex: 1;

      .summary {
        margin-bottom: 12px;

        > header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;

          font-size: 14px;
          height: 45px;

          border-bottom: 1px solid var(--color-gray24);

          margin-bottom: 16px;
        }

        > h2 {
          font-size: 24px;
          color: var(--color-white100);

          margin-bottom: 30px;
        }

        > p {
          font-size: 14px;

          span {
            color: var(--color-white44);
            margin-right: 8px;
          }

          margin-bottom: 14px;
        }

        > button {
          display: block;
          margin: 40px auto 0 auto;
          max-width: 360px;
        }

        > .form {
          margin-top: 40px;
        }
      }
    }

    .detail {
      > div {
        font-size: 14px;

        h4 {
          color: var(--color-white44);
          font-weight: 500;

          margin-bottom: 4px;
        }

        p {
          line-height: 21px;
          color: var(--color-white100);
        }

        &:not(:last-child) {
          margin-bottom: 28px;
        }
      }
    }

    .voters {
      min-width: 420px;
      max-width: 420px;

      background-color: var(--color-gray14);

      header {
        display: flex;
        gap: 18px;

        margin-bottom: 3rem;
      }

      .voters-table {
        margin-bottom: 2rem;
      }
    }
  }

  @media (max-width: 1100px) {
    .layout {
      flex-direction: column;

      gap: 12px;

      .voters {
        min-width: unset;
        max-width: unset;
      }
    }
  }

  @media (max-width: ${breakpoints.tablet.max}px) {
    h1 {
      margin-bottom: 20px;
    }

    .layout {
      .description-column {
        .summary {
          > p {
            span {
              display: block;
            }
          }
        }
      }
    }
  }
`;

export default fixHMR(StyledPollDetail);
