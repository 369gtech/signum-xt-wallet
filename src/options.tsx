import './main.css';

import React, { FC, Suspense, useCallback, useEffect, useState } from 'react';

import classNames from 'clsx';
import * as ReactDOM from 'react-dom';
import browser from 'webextension-polyfill';

import DisableOutlinesForClick from 'app/a11y/DisableOutlinesForClick';
import RootSuspenseFallback from 'app/a11y/RootSuspenseFallback';
import ErrorBoundary from 'app/ErrorBoundary';
import Dialogs from 'app/layouts/Dialogs';
import { getMessage, onInited } from 'lib/i18n';
import { T } from 'lib/i18n/react';
import { clearStorage } from 'lib/temple/reset';
import { AlertFn, ConfirmFn, DialogsProvider, useAlert, useConfirm } from 'lib/ui/dialog';

const OptionsWrapper: FC = () => (
  <ErrorBoundary whileMessage="opening options" className="min-h-screen">
    <DialogsProvider>
      <Suspense fallback={<RootSuspenseFallback />}>
        <Dialogs />
        <DisableOutlinesForClick />
        <Options />
      </Suspense>
    </DialogsProvider>
  </ErrorBoundary>
);

const Options: FC = () => {
  const alert = useAlert();
  const confirm = useConfirm();
  const [_, setI18nInitialized] = useState(false);

  useEffect(() => {
    // forces a re-render after i18n file was loaded
    onInited(() => {
      setI18nInitialized(true);
    });
  }, []);

  const internalHandleReset = useCallback(() => {
    handleReset(alert, confirm);
  }, [alert, confirm]);

  return (
    <div className="p-4">
      <h1 className="mb-2 text-xl font-semibold">{getMessage('templeWalletOptions')}</h1>

      <div className="my-6">
        <button
          className={classNames(
            'relative',
            'px-2 py-1',
            'bg-primary-orange rounded',
            'border-2 border-primary-orange',
            'flex items-center',
            'text-primary-orange-lighter',
            'text-sm font-semibold',
            'transition duration-200 ease-in-out',
            'opacity-90 hover:opacity-100 focus:opacity-100',
            'shadow-sm hover:shadow focus:shadow'
          )}
          onClick={internalHandleReset}
        >
          {getMessage('resetExtension')}
        </button>
      </div>
    </div>
  );
};

ReactDOM.render(<OptionsWrapper />, document.getElementById('root'));

let resetting = false;

async function handleReset(alert: AlertFn, confirm: ConfirmFn) {
  if (resetting) return;
  resetting = true;

  const confirmed = await confirm({
    title: getMessage('actionConfirmation'),
    children: <T id="resetExtensionConfirmation" />
  });
  if (confirmed) {
    (async () => {
      try {
        await clearStorage();
        browser.runtime.reload();
      } catch (err: any) {
        await alert({
          title: getMessage('error'),
          children: err.message
        });
      }
    })();
  }

  resetting = false;
}