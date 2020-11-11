import React, { useState } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import { XTerm } from 'xterm-for-react';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { encode, decode } from 'msgpack5';

export const Terminal = props => {
  const { deviceId } = props;
  const [socket, setSocket] = useState(null);
  const xtermRef = React.useRef(null);

  const onData = data => {
    const msg = { cmd: 'shell', data: data };
    const encodedData = encode(msg);
    socket.send(encodedData);
  };

  React.useEffect(() => {
    const term = xtermRef.current.terminal;

    try {
      fitAddon.fit();
    } catch {
      console.log('fit not possible, terminal not yet visible');
    }
    term.resize(80, 40);

    var socket = new WebSocket('wss://' + window.location.host + '/api/management/v1/deviceconnect/devices/' + deviceId + '/connect');
    socket.onopen = () => {
      console.log('[websocket] Connection established');
    };

    socket.onclose = event => {
      if (event.wasClean) {
        console.log('[close] Connection closed cleanly, code=' + event.code + ' reason=' + event.reason);
      } else {
        console.log('[close] Connection died');
      }
    };

    socket.onerror = error => {
      console.log('[error] ' + error.message);
    };

    socket.onmessage = event => {
      event.data.arrayBuffer().then(function (data) {
        const obj = decode(data);
        if (obj.cmd == 'shell') {
          var myString = '';
          for (var i = 0; i < obj.data.byteLength; i++) {
            myString += String.fromCharCode(obj.data[i]);
          }
          term.write(myString);
        }
      });
    };

    setSocket(socket);
  }, []);

  const options = {
    cursorBlink: 'block',
    macOptionIsMeta: true,
    scrollback: 100
  };

  const fitAddon = new FitAddon();
  const searchAddon = new SearchAddon();

  return <XTerm ref={xtermRef} addons={[fitAddon, searchAddon]} options={options} onData={onData} />;
};

export const TerminalDialog = props => {
  const { open, onCancel, deviceId } = props;

  return (
    <Dialog open={open} fullWidth={true} maxWidth="lg">
      <DialogTitle>Terminal</DialogTitle>
      <DialogContent className="dialog-content" style={{ padding: 0 }}>
        <Terminal deviceId={deviceId} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TerminalDialog;
