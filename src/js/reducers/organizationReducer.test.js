import reducer, { initialState } from './organizationReducer';
import OrganizationConstants from '../constants/organizationConstants';
import { defaultState } from '../../../tests/mockData';

describe('organization reducer', () => {
  it('should return the initial state', async () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle RECEIVE_AUDIT_LOGS', async () => {
    expect(reducer(undefined, { type: OrganizationConstants.RECEIVE_AUDIT_LOGS, events: defaultState.organization.events, total: 2 }).eventsTotal).toEqual(2);
    expect(reducer(initialState, { type: OrganizationConstants.RECEIVE_AUDIT_LOGS, events: defaultState.organization.events, total: 4 }).eventsTotal).toEqual(
      4
    );
  });
  it('should handle RECEIVE_CURRENT_CARD', async () => {
    expect(reducer(undefined, { type: OrganizationConstants.RECEIVE_CURRENT_CARD, card: defaultState.organization.card }).card).toEqual(
      defaultState.organization.card
    );
    expect(reducer(initialState, { type: OrganizationConstants.RECEIVE_CURRENT_CARD, card: defaultState.organization.card }).card).toEqual(
      defaultState.organization.card
    );
  });
  it('should handle RECEIVE_SETUP_INTENT', async () => {
    expect(reducer(undefined, { type: OrganizationConstants.RECEIVE_SETUP_INTENT, intentId: defaultState.organization.intentId }).intentId).toEqual(
      defaultState.organization.intentId
    );
    expect(reducer(initialState, { type: OrganizationConstants.RECEIVE_SETUP_INTENT, intentId: 4 }).intentId).toEqual(4);
  });
  it('should handle SET_ORGANIZATION', async () => {
    expect(
      reducer(undefined, { type: OrganizationConstants.SET_ORGANIZATION, organization: defaultState.organization.organization }).organization.plan
    ).toEqual(defaultState.organization.organization.plan);
    expect(
      reducer(initialState, { type: OrganizationConstants.SET_ORGANIZATION, organization: defaultState.organization.organization }).organization.name
    ).toEqual(defaultState.organization.organization.name);
  });
});
