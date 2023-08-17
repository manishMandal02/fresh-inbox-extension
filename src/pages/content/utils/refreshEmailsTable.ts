export const refreshEmailsTable = () => {
  const RefreshBtnSelector = '[data-tooltip="Refresh"]';
  return new Promise<string>((resolve, reject) => {
    const refreshBtn = document.querySelector(RefreshBtnSelector) as HTMLDivElement | null;

    console.log('🚀 ~ file: refreshEmailsTable.ts:6 ~ refreshEmailsTable ~ refreshBtn:', refreshBtn);

    if (!refreshBtn) {
      console.log('❌ refresh button not found');
      reject(' refresh button not found');
    }
    refreshBtn.click();
    resolve('success');
  });
};
