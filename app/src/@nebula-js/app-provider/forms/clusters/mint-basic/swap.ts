import { useFixedFee, useUstBalance } from '@libs/app-provider';
import { useForm } from '@libs/use-form';
import { clusterSwapForm } from '@nebula-js/app-fns';
import { cluster, UST } from '@nebula-js/types';
import { useConnectedWallet } from '@terra-money/use-wallet';
import { useNebulaApp } from '../../../hooks/useNebulaApp';

export interface ClusterSwapFormParams {
  clusterState: cluster.ClusterStateResponse;
}

export function useClusterSwapForm({ clusterState }: ClusterSwapFormParams) {
  const connectedWallet = useConnectedWallet();

  const { queryClient, gasPrice, constants, contractAddress } = useNebulaApp();

  const fixedFee = useFixedFee();

  const uUST = useUstBalance();

  return useForm(
    clusterSwapForm,
    {
      queryClient,
      ustBalance: uUST,
      clusterState,
      terraswapFactoryAddr: contractAddress.terraswap.factory,
      swapGasWantedPerAsset: constants.swapGasWantedPerAsset,
      clusterFee: constants.nebula.clusterFee,
      fixedFee,
      gasPrice,
      connected: !!connectedWallet,
    },
    () => {
      return {
        ustAmount: '' as UST,
      };
    },
  );
}
