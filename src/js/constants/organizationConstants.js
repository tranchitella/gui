module.exports = {
  AUDIT_LOGS_TYPES: [
    { title: 'Deployment', queryParameter: 'object_deployment_name', value: 'deployment' },
    { title: 'User', queryParameter: 'object_id', value: 'user' }
  ],
  RECEIVE_AUDIT_LOGS: 'RECEIVE_AUDIT_LOGS',
  SET_ORGANIZATION: 'SET_ORGANIZATION'
};