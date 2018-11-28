// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers, withState} from 'recompose'

import MnemonicExplanationModal from './MnemonicExplanationModal'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle, withTranslations} from '../../../utils/renderUtils'
import WalletForm from '../WalletForm'

import type {State} from '../../../state'

const getTranslations = (state: State) => state.trans.CreateWalletScreen

const CreateWalletScreen = ({
  formSubmit,
  hideMnemonicExplanation,
  visibleMnemonicExplanation,
  navigateToMnemonicScreen,
}) => (
  <>
    <WalletForm onSubmit={formSubmit} />
    <MnemonicExplanationModal
      visible={visibleMnemonicExplanation}
      onRequestClose={hideMnemonicExplanation}
      onConfirm={navigateToMnemonicScreen}
    />
  </>
)

export default compose(
  withTranslations(getTranslations),
  withNavigationTitle(({translations}) => translations.title),
  withState('visibleMnemonicExplanation', 'setMnemonicExplanation', false),
  withState('formData', 'setFormData', null),
  withHandlers({
    formSubmit: ({setFormData, setMnemonicExplanation}) => (data) => {
      setFormData(data)
      setMnemonicExplanation(true)
    },
    hideMnemonicExplanation: ({setMnemonicExplanation}) => () => {
      setMnemonicExplanation(false)
    },
    navigateToMnemonicScreen: ({
      formData,
      setFormData,
      setMnemonicExplanation,
      navigation,
    }) => () => {
      setFormData(null)
      setMnemonicExplanation(false)
      navigation.navigate(WALLET_INIT_ROUTES.MNEMONIC_SHOW, formData)
    },
  }),
)(CreateWalletScreen)
