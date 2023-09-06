import { Channel, Member, Profile, Server } from '@prisma/client';
import { create } from 'zustand';

type ServerStore = {
  server: Server | null;
  members: (Member & { profile: Profile })[] | null;
  channels: Channel[] | null;

  setServer: (server: Server) => void;
  setMembers: (members: (Member & { profile: Profile })[]) => void;
  setChannels: (channels: Channel[]) => void;
};

export const useServerStore = create<ServerStore>((set) => ({
  server: null,
  members: null,
  channels: null,
  setServer: (server) => set({ server }),
  setMembers: (members) => set({ members }),
  setChannels: (channels) => set({ channels }),
}));
