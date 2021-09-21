import { useApp, useGasPrice, useRefetchQueries } from '@libs/app-provider';
import {
  clusterArbMintTx,
  computeClusterGasWanted,
  NebulaContants,
  NebulaContractAddress,
} from '@nebula-js/app-fns';
import { HumanAddr, terraswap, Token, u, UST } from '@nebula-js/types';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import big from 'big.js';
import { useCallback } from 'react';
import { NEBULA_TX_KEYS } from '../../env';

export interface ClusterArbMintTxParams {
  amounts: u<Token>[];
  txFee: u<UST>;

  onTxSucceed?: () => void;
}

export function useClusterArbMintTx(
  clusterAddr: HumanAddr,
  terraswapPairAddr: HumanAddr,
  assets: terraswap.Asset<Token>[],
) {
  const connectedWallet = useConnectedWallet();

  const { wasmClient, txErrorReporter, constants, contractAddress } = useApp<
    NebulaContractAddress,
    NebulaContants
  >();

  const fixedFee = useGasPrice(constants.fixedGas, 'uusd');

  const refetchQueries = useRefetchQueries();

  //const {
  //  constants: { fixedFee, gasAdjustment, clusterFee },
  //  contractAddress,
  //} = useNebulaWebapp();

  const stream = useCallback(
    ({ amounts, txFee, onTxSucceed }: ClusterArbMintTxParams) => {
      if (!connectedWallet || !connectedWallet.availablePost) {
        throw new Error(`Can't post!`);
      }

      console.log(
        'arbMint.ts..()',
        amounts,
        constants.clusterFee.arbMint,
        amounts.length,
        amounts.filter((amount) => big(amount).gt(0)).length,
      );

      return clusterArbMintTx({
        txFee,
        walletAddr: connectedWallet.walletAddress,
        incentivesAddr: contractAddress.incentives,
        clusterAddr,
        terraswapPairAddr,
        assets,
        amounts,
        fixedGas: fixedFee,
        gasWanted: computeClusterGasWanted(
          constants.clusterFee.arbMint,
          amounts.length,
          amounts.filter((amount) => big(amount).gt(0)).length,
        ),
        gasAdjustment: constants.gasAdjustment,
        wasmClient,
        txErrorReporter,
        onTxSucceed: () => {
          onTxSucceed?.();
          refetchQueries(NEBULA_TX_KEYS.CLUSTER_ARB_MINT);
        },
        network: connectedWallet.network,
        post: connectedWallet.post,
      });
    },
    [
      assets,
      clusterAddr,
      connectedWallet,
      constants.clusterFee.arbMint,
      constants.gasAdjustment,
      contractAddress.incentives,
      fixedFee,
      refetchQueries,
      terraswapPairAddr,
      txErrorReporter,
      wasmClient,
    ],
  );

  return connectedWallet ? stream : null;
}
