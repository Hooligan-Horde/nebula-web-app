import { WasmClient } from '@libs/query-client';
import { Gas, Rate, u, UST } from '@libs/types';
import { NetworkInfo, TxResult } from '@terra-dev/wallet-types';
import { CreateTxOptions } from '@terra-money/terra.js';

export interface TxCommonParams {
  // tx
  txFee: u<UST>;
  gasWanted: Gas;
  gasAdjustment: Rate<number>;
  fixedFee: u<UST<string | number>>;
  // network
  network: NetworkInfo;
  wasmClient: WasmClient;
  post: (tx: CreateTxOptions) => Promise<TxResult>;
  // error handle
  txErrorReporter?: (error: unknown) => string;
}
