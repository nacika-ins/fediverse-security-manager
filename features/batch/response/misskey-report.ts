/* eslint-disable no-use-before-define */
export interface MisskeyReport {
  id: string;
  createdAt: string;
  comment: string;
  resolved: boolean;
  reporterId: string;
  targetUserId: string;
  assigneeId: string;
  reporter: Reporter;
  targetUser: Reporter;
  assignee: Reporter;
}
interface Reporter {
  id: string;
  name: string;
  username: string;
  host: string;
  avatarUrl: string;
  avatarBlurhash?: any;
  avatarColor?: any;
  isAdmin: boolean;
  isModerator: boolean;
  isBot: boolean;
  isCat: boolean;
  emojis: Emoji[];
  onlineStatus: string;
}
interface Emoji {
  name: string;
  url: string;
}
