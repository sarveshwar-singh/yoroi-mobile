// @flow
import _ from 'lodash'
import {BigNumber} from 'bignumber.js'
import {createSelector} from 'reselect'

import {processTxHistoryData} from './crypto/transactionUtils'
import {
  TRANSACTION_STATUS,
  TRANSACTION_DIRECTION,
} from './types/HistoryTransaction'
import {ObjectValues} from './utils/flow'

import type {Dict, State} from './state'
import type {
  Transaction,
  TransactionInfo,
  RawUtxo,
} from './types/HistoryTransaction'

export const transactionsInfoSelector: (State) => Dict<
  TransactionInfo,
> = createSelector(
  (state) => state.wallet.transactions,
  (state) => state.wallet.internalAddresses,
  (state) => state.wallet.externalAddresses,
  (state) => state.wallet.confirmationCounts,
  (transactions, internalAddresses, externalAddresses, confirmationCounts) =>
    _.mapValues(transactions, (tx: Transaction) =>
      processTxHistoryData(
        tx,
        [...internalAddresses, ...externalAddresses],
        confirmationCounts[tx.id] || 0,
      ),
    ),
)

export const internalAddressIndexSelector = createSelector(
  (state) => state.wallet.internalAddresses,
  (addresses) => _.fromPairs(addresses.map((addr, i) => [addr, i])),
)

export const externalAddressIndexSelector = createSelector(
  (state) => state.wallet.externalAddresses,
  (addresses) => _.fromPairs(addresses.map((addr, i) => [addr, i])),
)

export const isUsedAddressIndexSelector = (state: State) =>
  state.wallet.isUsedAddressIndex

export const amountPendingSelector = createSelector(
  transactionsInfoSelector,
  (transactions) => {
    const pending = ObjectValues(transactions)
      .filter((tx) => tx.status === TRANSACTION_STATUS.PENDING)
      .map((tx) => tx.bruttoAmount)

    if (!pending.length) return null

    return pending.reduce((x: BigNumber, y) => x.plus(y), new BigNumber(0))
  },
)

const BigNumberSum = (data: Array<BigNumber>): BigNumber =>
  data.reduce((x: BigNumber, y) => x.plus(y), new BigNumber(0))

export const availableAmountSelector = createSelector(
  transactionsInfoSelector,
  (transactions) => {
    const processed = ObjectValues(transactions).filter(
      (tx) => tx.status === TRANSACTION_STATUS.SUCCESSFUL,
    )
    const amounts = processed.map((tx) => tx.bruttoAmount)
    return BigNumberSum(amounts)
  },
)

export const receiveAddressesSelector = createSelector(
  (state) => state.wallet.externalAddresses,
  (state) => state.wallet.numReceiveAddresses,
  (addresses, count) => addresses.slice(0, count),
)

export const canGenerateNewReceiveAddressSelector = (state: State) =>
  state.wallet.canGenerateNewReceiveAddress

export const isOnlineSelector = (state: State): boolean => state.isOnline

export const isSynchronizingHistorySelector = (state: State): boolean =>
  state.txHistory.isSynchronizing

export const lastHistorySyncErrorSelector = (state: State): any =>
  state.txHistory.lastSyncError

export const utxoBalanceSelector = (state: State) => {
  if (state.balance.isFetching || !state.balance.utxos) {
    return null
  }

  return state.balance.utxos.reduce(
    (sum: BigNumber, utxo: RawUtxo) => sum.plus(new BigNumber(utxo.amount)),
    new BigNumber(0),
  )
}

export const walletIsInitializedSelector = (state: State): boolean =>
  state.wallet.isInitialized

export const walletNameSelector = (state: State): string => state.wallet.name

export const isFetchingUtxosSelector = (state: State): boolean =>
  state.balance.isFetching

export const lastUtxosFetchErrorSelector = (state: State): any =>
  state.balance.lastFetchingError

export const utxosSelector = (state: State): ?Array<RawUtxo> =>
  state.balance.utxos

export const fingerprintsHwSupportSelector = (state: State): boolean =>
  state.auth.isFingerprintsHardwareSupported

export const systemAuthSupportSelector = (state: State): boolean =>
  state.auth.isSystemAuthEnabled

export const enrolledFingerprintsSelector = (state: State): boolean =>
  state.auth.hasEnrolledFingerprints

export const hasPendingOutgoingTransactionSelector = createSelector(
  transactionsInfoSelector,
  (transactions) =>
    ObjectValues(transactions).some(
      (tx) =>
        tx.status === TRANSACTION_STATUS.PENDING &&
        tx.direction !== TRANSACTION_DIRECTION.RECEIVED,
    ),
)
