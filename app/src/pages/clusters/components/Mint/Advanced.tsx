import { formatUToken, microfy } from '@libs/formatter';
import { ClusterInfo } from '@nebula-js/app-fns';
import {
  useClusterMintAdvancedForm,
  useClusterMintTx,
} from '@nebula-js/app-provider';
import { breakpoints, Button, useScreenSizeValue } from '@nebula-js/ui';
import { CT, terraswap, Token, u, UST } from '@nebula-js/types';
import { FeeBox } from 'components/boxes/FeeBox';
import { WarningMessageBox } from 'components/boxes/WarningMessageBox';
import { useTxBroadcast } from 'contexts/tx-broadcast';
import { fixHMR } from 'fix-hmr';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { TokenFormMint } from './TokenFormMint';
import { useConnectedWallet } from '@terra-money/wallet-provider';

export interface MintAdvancedProps {
  clusterInfo: ClusterInfo;
  className?: string;
}

function MintAdvancedBase({ className, clusterInfo }: MintAdvancedProps) {
  // ---------------------------------------------
  // dependencies
  // ---------------------------------------------
  const connectedWallet = useConnectedWallet();

  const { broadcast } = useTxBroadcast();

  const postTx = useClusterMintTx(
    clusterInfo.clusterState.cluster_contract_address,
    clusterInfo.clusterState.target,
    clusterInfo.clusterTokenInfo.symbol,
  );

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [updateInput, states] = useClusterMintAdvancedForm({
    clusterState: clusterInfo.clusterState,
    terraswapPool: clusterInfo.terraswapPool,
  });

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const initForm = useCallback(() => {
    updateInput({
      amounts: clusterInfo.clusterState.target.map(() => '' as CT),
      addedAssets: new Set<terraswap.Asset<Token>>(),
    });
  }, [clusterInfo.clusterState.target, updateInput]);

  const proceed = useCallback(
    (amounts: Token[], txFee: u<UST>) => {
      const stream = postTx?.({
        amounts: amounts.map(
          (amount) =>
            (amount.length > 0 ? microfy(amount).toFixed() : '0') as u<Token>,
        ),
        txFee,
        onTxSucceed: initForm,
      });

      if (stream) {
        console.log('Advanced.tsx..()', stream);
        broadcast(stream);
      }
    },
    [broadcast, initForm, postTx],
  );

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  const buttonSize = useScreenSizeValue<'normal' | 'medium'>({
    mobile: 'medium',
    tablet: 'normal',
    pc: 'normal',
    monitor: 'normal',
  });

  return (
    <div className={className}>
      <TokenFormMint
        clusterInfo={clusterInfo}
        updateInput={updateInput}
        states={states}
      >
        <FeeBox className="feebox">
          {clusterInfo.clusterTokenInfo &&
            'mintedAmount' in states &&
            states.mintedAmount && (
              <li>
                <span>Minted {clusterInfo.clusterTokenInfo.symbol}</span>
                <span>
                  {formatUToken(states.mintedAmount)}{' '}
                  {clusterInfo.clusterTokenInfo.symbol}
                </span>
              </li>
            )}

          {'pnl' in states && states.pnl && (
            <li>
              <span>PNL</span>
              <span>{formatUToken(states.pnl)} UST</span>
            </li>
          )}

          {states.txFee !== null && (
            <li>
              <span>Tx Fee</span>
              <span>{states.txFee ? formatUToken(states.txFee) : 0} UST</span>
            </li>
          )}
        </FeeBox>

        {states.invalidMintQuery ? (
          <WarningMessageBox level="critical" className="warning">
            {states.invalidMintQuery}
          </WarningMessageBox>
        ) : null}

        <Button
          className="submit"
          color="paleblue"
          size={buttonSize}
          disabled={
            !connectedWallet ||
            !connectedWallet.availablePost ||
            !states ||
            !states.txFee ||
            states.amounts.every((amount) => amount.length === 0)
          }
          onClick={() => states.txFee && proceed(states.amounts, states.txFee)}
        >
          Mint
        </Button>
      </TokenFormMint>
    </div>
  );
}

const StyledMintAdvanced = styled(MintAdvancedBase)`
  .warning {
    margin-top: 2.14285714em;
  }

  .feebox {
    margin-top: 2.8em;
  }

  .submit {
    display: block;
    width: 100%;
    max-width: 360px;
    margin: 2.8em auto 0 auto;
  }

  @media (max-width: ${breakpoints.mobile.max}px) {
    .feebox {
      font-size: 0.9em;
      margin-top: 2.2em;
    }

    .submit {
      margin-top: 2.2em;
    }
  }
`;

export const MintAdvanced = fixHMR(StyledMintAdvanced);
