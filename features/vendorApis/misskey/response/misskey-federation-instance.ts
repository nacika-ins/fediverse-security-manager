// eslint-disable-next-line no-use-before-define
export type FederationInstance = Root2;

export interface Root2 {
  id: string;
  caughtAt: string;
  host: string;
  usersCount: number;
  notesCount: number;
  followingCount: number;
  followersCount: number;
  latestRequestSentAt: string;
  lastCommunicatedAt: string;
  isNotResponding: boolean;
  isSuspended: boolean;
  softwareName: string;
  softwareVersion: string;
  openRegistrations: boolean;
  name: string;
  description: string;
  maintainerName: string;
  maintainerEmail: string;
  iconUrl: string;
  infoUpdatedAt: string;
}
