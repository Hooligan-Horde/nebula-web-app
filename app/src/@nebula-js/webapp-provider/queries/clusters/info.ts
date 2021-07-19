import { HumanAddr } from '@anchor-protocol/types';
import { ClusterInfo, clusterInfoQuery } from '@nebula-js/webapp-fns';
import { createQueryFn } from '@terra-dev/react-query-utils';
import { useBrowserInactive } from '@terra-dev/use-browser-inactive';
import { MantleFetch, useTerraWebapp } from '@terra-money/webapp-provider';
import { useQuery, UseQueryResult } from 'react-query';
import { useNebulaWebapp } from '../../contexts/webapp';
import { NEBULA_QUERY_KEYS } from '../../env';

const queryFn = createQueryFn(
  (
    mantleEndpoint: string,
    mantleFetch: MantleFetch,
    terraswapFactoryAddr: HumanAddr,
    clusterAddr: HumanAddr,
  ) => {
    return clusterInfoQuery({
      mantleEndpoint,
      mantleFetch,
      terraswapFactoryAddr,
      wasmQuery: {
        clusterState: {
          contractAddress: clusterAddr,
          query: {
            cluster_state: {
              cluster_contract_address: clusterAddr,
            },
          },
        },
        clusterConfig: {
          contractAddress: clusterAddr,
          query: {
            config: {},
          },
        },
      },
    });
  },
);

export function useClusterInfoQuery(
  clusterAddr: HumanAddr,
): UseQueryResult<ClusterInfo | undefined> {
  const { mantleFetch, mantleEndpoint, queryErrorReporter } = useTerraWebapp();

  const {
    contractAddress: { terraswap },
  } = useNebulaWebapp();

  const { browserInactive } = useBrowserInactive();

  const result = useQuery(
    [
      NEBULA_QUERY_KEYS.CLUSTER_INFO,
      mantleEndpoint,
      mantleFetch,
      terraswap.factory,
      clusterAddr,
    ],
    queryFn,
    {
      refetchInterval: browserInactive && 1000 * 60 * 5,
      enabled: !browserInactive,
      keepPreviousData: true,
      onError: queryErrorReporter,
    },
  );

  return result;
}
