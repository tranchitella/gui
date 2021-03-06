import React from 'react';

const UpdateModules = ({ docsVersion = '' }) => (
  <div>
    <h2>Enabling different kinds of updates with Update Modules</h2>
    <p>
      Application updates are supported through Mender&#39;s Update Modules feature. Although the Mender client is built primarily for dual A&#47;B image
      updates, Update Modules extends the Mender client to enable other use cases - including application updates. By using Update Modules, Mender supports
      software updates for:
    </p>

    <ul>
      <li>Packages (deb and rpm)</li>
      <li>Containers (docker)</li>
      <li>Bootloader</li>
      <li>Files (directory copy/sync)</li>
      <li>Proxy deployments for microcontrollers</li>
      <li>and more</li>
    </ul>

    <p>
      General-purpose Update Modules are available and documented together with community-supported Update Modules at{' '}
      <a href="https://hub.mender.io/c/update-modules" target="_blank" rel="noopener noreferrer">
        Mender Hub
      </a>
      .
    </p>

    <p>
      <a href={`https://docs.mender.io/${docsVersion}artifact-creation/create-a-custom-update-module`} target="_blank" rel="noopener noreferrer">
        Read our documentation
      </a>{' '}
      to learn how to develop your own Update Modules.
    </p>
  </div>
);

export default UpdateModules;
