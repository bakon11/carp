import type {
  RelationFilter,
  TransactionHistoryResponse,
} from '../../../shared/models/TransactionHistory';
import { sqlHistoryForCredentials } from '../models/sqlHistoryForCredentials.queries';
import { sqlHistoryForAddresses } from '../models/sqlHistoryForAddresses.queries';
import type { PoolClient } from 'pg';
import type { PaginationType } from './PaginationService';

export async function historyForCredentials(
  request: PaginationType & {
    dbTx: PoolClient;
    stakeCredentials: Buffer[];
    relationFilter: RelationFilter;
  }
): Promise<TransactionHistoryResponse> {
  if (request.stakeCredentials.length === 0) return { transactions: [] };
  const txs = await sqlHistoryForCredentials.run(
    {
      credentials: request.stakeCredentials,
      after_block_id: request.after?.block_id ?? -1,
      after_tx_id: (request.after?.tx_id ?? -1)?.toString(),
      limit: request.limit.toString(),
      until_block_id: request.until.block_id,
      relation: request.relationFilter,
    },
    request.dbTx
  );
  return {
    transactions: txs.map(entry => ({
      block: {
        height: entry.height,
        hash: entry.block_hash.toString('hex'),
        epoch: entry.epoch,
        slot: entry.slot,
        era: entry.era,
        tx_ordinal: entry.tx_index,
        is_valid: entry.is_valid,
      },

      transaction: {
        hash: entry.hash.toString('hex'),
        payload: entry.payload.toString('hex'),
      },
    })),
  };
}

export async function historyForAddresses(
  request: PaginationType & {
    addresses: Buffer[];
    dbTx: PoolClient;
  }
): Promise<TransactionHistoryResponse> {
  if (request.addresses?.length === 0) return { transactions: [] };
  const txs = await sqlHistoryForAddresses.run(
    {
      addresses: request.addresses,
      after_block_id: request.after?.block_id ?? -1,
      after_tx_id: (request.after?.tx_id ?? -1)?.toString(),
      limit: request.limit.toString(),
      until_block_id: request.until.block_id,
    },
    request.dbTx
  );
  return {
    transactions: txs.map(entry => ({
      block: {
        height: entry.height,
        hash: entry.block_hash.toString('hex'),
        epoch: entry.epoch,
        slot: entry.slot,
        era: entry.era,
        tx_ordinal: entry.tx_index,
        is_valid: entry.is_valid,
      },

      transaction: {
        hash: entry.hash.toString('hex'),
        payload: entry.payload.toString('hex'),
      },
    })),
  };
}
