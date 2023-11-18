// removes all the assistant buttons
export const removeAssistantBtn = () => {
  //  remove assistant buttons, if any
  const assistantButtons = document.getElementsByClassName('freshInbox-assistantBtn');

  if (assistantButtons.length < 1) return;

  for (const btn of assistantButtons) {
    // remove the button
    btn.remove();
  }
};
