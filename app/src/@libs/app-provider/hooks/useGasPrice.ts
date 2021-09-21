import { GasPrice } from '@libs/app-fns';
import { Gas } from '@libs/types';
import big, { BigSource } from 'big.js';
import { useMemo } from 'react';
import { useApp } from '../contexts/app';

export function useGasPrice<Denom extends keyof GasPrice>(
  gas: Gas<BigSource>,
  denom: Denom,
): GasPrice[Denom] {
  const { gasPrice } = useApp();

  return useMemo(() => {
    return big(gas).mul(gasPrice[denom]).toFixed() as GasPrice[Denom];
  }, [denom, gas, gasPrice]);
}
