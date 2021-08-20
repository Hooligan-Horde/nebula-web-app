import { WalletIcon } from '@nebula-js/icons';
import { formatUToken } from '@nebula-js/notation';
import { gov, NEB, u } from '@nebula-js/types';
import {
  Button,
  FormLabel,
  FormLabelAside,
  Section,
  TextInput,
  useScreenSizeValue,
} from '@nebula-js/ui';
import { NebulaTokenBalances } from '@nebula-js/webapp-fns';
import {
  useGovConfigQuery,
  useGovCreatePollTx,
  useNebulaWebapp,
} from '@nebula-js/webapp-provider';
import {
  BytesValid,
  useValidateStringBytes,
} from '@terra-dev/use-string-bytes-length';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import { useBank } from '@terra-money/webapp-provider';
import big from 'big.js';
import { FeeBox } from 'components/boxes/FeeBox';
import { FormLayout } from 'components/layouts/FormLayout';
import { useTxBroadcast } from 'contexts/tx-broadcast';
import { fixHMR } from 'fix-hmr';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

export interface PollCreateBaseProps {
  className?: string;

  title: string;
  description: ReactNode;
  children?: ReactNode;
  submitButtonStatus: 'disabled' | 'hidden' | true;
  onCreateMsg: () => gov.ExecuteMsg | undefined;
}

function PollCreateBaseBase({
  className,
  title,
  description,
  onCreateMsg,
  submitButtonStatus,
  children,
}: PollCreateBaseProps) {
  const connectedWallet = useConnectedWallet();
  const history = useHistory();

  const { broadcast } = useTxBroadcast();

  const postTx = useGovCreatePollTx();

  const { data: { govConfig } = {} } = useGovConfigQuery();
  const { tokenBalances } = useBank<NebulaTokenBalances>();
  const {
    constants: { fixedGas },
  } = useNebulaWebapp();

  const [pollTitle, setPollTitle] = useState<string>('');
  const [pollDescription, setPollDescription] = useState<string>('');
  const [pollExternalLink, setPollExternalLink] = useState<string>('');

  const invalidDepositAmount = useMemo(() => {
    if (!govConfig) {
      return null;
    }

    return big(tokenBalances.uNEB).lt(govConfig.proposal_deposit)
      ? 'Not enough NEB'
      : null;
  }, [govConfig, tokenBalances.uNEB]);

  const invalidPollTitleBytes = useValidateStringBytes(pollTitle, 4, 64);

  const invalidPollDescriptionBytes = useValidateStringBytes(
    pollDescription,
    4,
    1024,
  );

  const invalidPollExternalLinkBytes = useValidateStringBytes(
    pollExternalLink,
    12,
    128,
  );

  const invalidPollExternalLinkProtocol = useMemo(() => {
    return validateLinkAddress(pollExternalLink);
  }, [pollExternalLink]);

  const buttonSize = useScreenSizeValue<'medium' | 'normal'>({
    mobile: 'medium',
    tablet: 'normal',
    pc: 'normal',
    monitor: 'normal',
  });

  const proceed = useCallback(
    async (
      _title: string,
      _description: string,
      _link: string,
      _depositAmount: u<NEB>,
    ) => {
      const stream = postTx?.({
        title: _title,
        description: _description,
        link: _link.length > 0 ? _link : undefined,
        execute_msg: onCreateMsg(),
        depositAmount: _depositAmount,
        onTxSucceed: () => {
          history.push(`/gov`);
        },
      });

      if (stream) {
        broadcast(stream);
      }
    },
    [broadcast, history, onCreateMsg, postTx],
  );

  return (
    <FormLayout className={className} title="Create Poll">
      <Section className="header">
        <h2>{title}</h2>
        <p>{description}</p>
      </Section>

      <Section>
        <FormLabel label="Title" className="form-label">
          <TextInput
            placeholder="Enter poll title"
            fullWidth
            value={pollTitle}
            onChange={({ target }) => setPollTitle(target.value)}
            error={!!invalidPollTitleBytes}
            helperText={
              invalidPollTitleBytes === BytesValid.LESS
                ? 'Title must be at least 4 bytes.'
                : invalidPollTitleBytes === BytesValid.MUCH
                ? 'Title cannot be longer than 64 bytes.'
                : undefined
            }
          />
        </FormLabel>

        <FormLabel label="Description" className="form-label">
          <TextInput
            placeholder="Summary of the poll"
            fullWidth
            multiline
            minRows={4}
            maxRows={10}
            value={pollDescription}
            onChange={({ target }) => setPollDescription(target.value)}
            error={!!invalidPollDescriptionBytes}
            helperText={
              invalidPollDescriptionBytes === BytesValid.LESS
                ? 'Proposal rational must be at least 4 bytes.'
                : invalidPollDescriptionBytes === BytesValid.MUCH
                ? 'Proposal rational cannot be longer than 1024 bytes.'
                : undefined
            }
          />
        </FormLabel>

        <FormLabel label="External Link" className="form-label">
          <TextInput
            placeholder="https://"
            fullWidth
            value={pollExternalLink}
            onChange={({ target }) => setPollExternalLink(target.value)}
            error={
              !!invalidPollExternalLinkBytes ||
              !!invalidPollExternalLinkProtocol
            }
            helperText={
              invalidPollExternalLinkBytes === BytesValid.LESS
                ? 'Information link must be at least 12 bytes.'
                : invalidPollExternalLinkBytes === BytesValid.MUCH
                ? 'Information link cannot be longer than 128 bytes.'
                : invalidPollExternalLinkProtocol
            }
          />
        </FormLabel>

        {children}

        {govConfig && (
          <FormLabel
            label="Deposit"
            aside={
              <FormLabelAside>
                <WalletIcon /> {formatUToken(tokenBalances.uNEB)}
              </FormLabelAside>
            }
            className="form-label"
          >
            <Deposit>
              <span>{formatUToken(govConfig.proposal_deposit)}</span>
              <span>NEB</span>
            </Deposit>
          </FormLabel>
        )}

        <FeeBox className="fee-box">
          <li>
            <span>Tx Fee</span>
            <span>{formatUToken(fixedGas)} UST</span>
          </li>
        </FeeBox>

        {submitButtonStatus !== 'hidden' && (
          <Button
            className="submit"
            fullWidth
            size={buttonSize}
            color="paleblue"
            disabled={
              submitButtonStatus !== true ||
              !connectedWallet ||
              !connectedWallet.availablePost ||
              !postTx ||
              pollTitle.length === 0 ||
              pollDescription.length === 0 ||
              !!invalidDepositAmount ||
              !!invalidPollTitleBytes ||
              !!invalidPollDescriptionBytes ||
              !!invalidPollExternalLinkBytes ||
              !!invalidPollExternalLinkProtocol
            }
            onClick={() =>
              govConfig &&
              proceed(
                pollTitle,
                pollDescription,
                pollExternalLink,
                govConfig.proposal_deposit,
              )
            }
          >
            Submit
          </Button>
        )}
      </Section>
    </FormLayout>
  );
}

const Deposit = styled.div`
  border-radius: 8px;
  background-color: var(--color-gray22);
  padding: 20px;
  display: flex;
  justify-content: space-between;
`;

export const StyledPollCreateBase = styled(PollCreateBaseBase)`
  --max-content-width: 704px;

  .header {
    h2 {
      font-size: 2em;
      font-weight: 500;

      margin-bottom: 0.28571429em;
    }

    p {
      font-size: 1em;
      font-weight: 400;
      color: var(--color-white44);
    }

    margin-bottom: 0.85714286em;
  }

  .form-label:not(:first-child) {
    margin-top: 2.57142857142857em;
  }

  .fee-box {
    margin: 2.57142857142857em 0;
  }

  .submit {
    display: block;
    max-width: 360px;
    margin: 0 auto;
  }
`;

export const PollCreateBase = fixHMR(StyledPollCreateBase);

function validateLinkAddress(link: string): ReactNode {
  if (link.length === 0) return undefined;
  if (!/^(http|https):\/\//.test(link)) {
    return 'Must begin with http:// or https://';
  }
  return undefined;
}
