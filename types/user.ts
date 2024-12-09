import { type ComAtprotoLabelDefs, type AppBskyActorDefs } from '@atproto/api';

export type User = {
  did: string;
  handle: string;
  name: string;
  avatar: string | null;
  associated?: AppBskyActorDefs.ProfileAssociated;
  labels?: ComAtprotoLabelDefs.Label[];
};
