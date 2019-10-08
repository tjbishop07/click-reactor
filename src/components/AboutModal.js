import React, { useEffect } from 'react';
import { Button, Modal, Image, Divider } from 'semantic-ui-react'
import logo from '../img/logo-transparent.png';

export default function AboutModal(props) {

  const { isOpen } = props;
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleUrl = (url) => {
    if (!url) {
      return;
    }
    window.location.href = url;
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      basic>
      <Modal.Content>
        <div style={{ textAlign: 'center' }}>
          <Image src={logo} alt="Click Reactors" style={{ margin: '0 auto' }} />
          <h2>Click Reactors (C/R)</h2>
          <Divider horizontal style={{ color: '#ffffff', marginTop: '40px' }}>v. 1.02 (Beta)</Divider>
          <p>Developed By: Tom Bishop (tjbishop@gmail.com)</p>
          <Button
            onClick={() => handleUrl('https://github.com/tjbishop07/click-reactor')}
            secondary
            labelPosition='right'
            icon='github'
            content='Source Code'
          /><br />
          <Button
            style={{ marginTop: '20px' }}
            onClick={() => { window.location.reload(); }}
            primary
            labelPosition='right'
            icon='refresh'
            content='Check for new version'
          />
        </div>
      </Modal.Content>
    </Modal>
  );
}