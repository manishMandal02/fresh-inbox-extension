import React, { useEffect, useState } from 'react';
import MainButton from './MainButton';
import { createPortal } from 'react-dom';
import { randomId } from '../../utils/randomId';

type EmailActionModalDetails = {
  name: string;
  email: string;
  parentElId: string;
};

const MailMagicButton = () => {
  const [showEmailActionModal, setShowEmailActionModal] = useState<EmailActionModalDetails | null>(null);
  // handle on hover
  const handleMouseOver = (email: string, name: string) => {
    // set global state
    mailMagicGlobalVariables.isMouseOverMailMagicBtn = true;
    setTimeout(() => {
      setShowEmailActionModal({
        name,
        email,
        parentElId: mailMagicGlobalVariables.mainBtnContainerId,
      });
    }, 300);
  };
  const handleMouseOut = () => {
    setTimeout(() => {
      setShowEmailActionModal(null);
    }, 800);
    mailMagicGlobalVariables.isMouseOverMailMagicBtn = false;
  };

  // get all mails visible on page
  const getAllMails = () => {
    // get all mail nodes on current page in the table by email attribute
    const allMailNodes = Array.from(document.querySelectorAll('tr>td>div:last-child>span>span[email]'));

    console.log('🚀 ~ file: index.ts:16 ~ getAllMails ~ allMailNodes:', allMailNodes.length);

    if (allMailNodes.length > 0) {
      for (const emailNode of allMailNodes) {
        const email = emailNode.getAttribute('email');
        const name = emailNode.getAttribute('name');

        //***** append unsubscribe  button
        // container to add unsubscribe button
        const mailMagicBtnContainer = emailNode.closest('div');

        mailMagicGlobalVariables.mainBtnContainerId = randomId();
        mailMagicBtnContainer.id = mailMagicGlobalVariables.mainBtnContainerId;

        // append the button to container (with react portal)
        createPortal(
          <MainButton onMouseOver={() => handleMouseOver(email, name)} onMouseOut={() => handleMouseOut()} />,
          mailMagicBtnContainer
        );
      }
    } else {
      console.log('❌ No emails found on page');
    }
  };

  useEffect(() => {
    setTimeout(() => {
      getAllMails();
    }, 2500);
  }, []);

  return <></>;
};

export default MailMagicButton;
