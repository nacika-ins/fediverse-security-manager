/* eslint-disable no-use-before-define */
export interface User {
  id: string
  name: string
  username: string
  host: string
  avatarUrl: string
  avatarBlurhash: any
  avatarColor: any
  isAdmin: boolean
  isModerator: boolean
  isBot: boolean
  isCat: boolean
  emojis: Emoji[]
  onlineStatus: string
}

export interface Root2 {
  id: string
  createdAt: string
  isRead: boolean
  type: string
  user: User
  userId: string
  note: Note
  reaction: string
  choice: number
  invitation: Invitation
  body: string
  header: string
  icon: string
}

export interface Emoji {
  name: string
  url: string
}

export interface Note {
  id: string
  createdAt: string
  text: string
  cw: string
  userId: string
  user: User2
  replyId: string
  renoteId: string
  reply: Reply
  renote: Renote
  isHidden: boolean
  visibility: string
  mentions: string[]
  visibleUserIds: string[]
  fileIds: string[]
  files: File[]
  tags: string[]
  poll: Poll
  channelId: string
  channel: Channel
  localOnly: boolean
  emojis: Emoji4[]
  reactions: Reactions
  renoteCount: number
  repliesCount: number
  uri: string
  url: string
  myReaction: MyReaction
}

export interface User2 {
  id: string
  name: string
  username: string
  host: string
  avatarUrl: string
  avatarBlurhash: any
  avatarColor: any
  isAdmin: boolean
  isModerator: boolean
  isBot: boolean
  isCat: boolean
  emojis: Emoji2[]
  onlineStatus: string
}

export interface Emoji2 {
  name: string
  url: string
}

export interface Reply {}

export interface Renote {}

export interface File {
  id: string
  createdAt: string
  name: string
  type: string
  md5: string
  size: number
  isSensitive: boolean
  blurhash: string
  properties: Properties
  url: string
  thumbnailUrl: string
  comment: string
  folderId: string
  folder: Folder
  userId: string
  user: User3
}

export interface Properties {
  width: number
  height: number
  orientation: number
  avgColor: string
}

export interface Folder {
  id: string
  createdAt: string
  name: string
  foldersCount: number
  filesCount: number
  parentId: string
  parent: Parent
}

export interface Parent {}

export interface User3 {
  id: string
  name: string
  username: string
  host: string
  avatarUrl: string
  avatarBlurhash: any
  avatarColor: any
  isAdmin: boolean
  isModerator: boolean
  isBot: boolean
  isCat: boolean
  emojis: Emoji3[]
  onlineStatus: string
}

export interface Emoji3 {
  name: string
  url: string
}

export interface Poll {}

export interface Channel {}

export interface Emoji4 {
  name: string
  url: string
}

export interface Reactions {}

export interface MyReaction {}

export interface Invitation {}

export type MisskeyNotifications = Root2[]
