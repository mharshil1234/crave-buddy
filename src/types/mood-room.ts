export type createMoodRoomProps = {
    moodRoomName: string;
    hostId: string;
};

export type createMoodRoomInviteProps = {
    roomId: string;
};

export type createMoodRoomMemberProps = {
    roomId: string;
    userId: string | null;
    displayName: string;
    inviteId: string | null;
}

export type createRoomProps = {
    moodRoomName: string;
    hostId: string;
    displayName: string;
};

export type joinRoomProps = {
    inviteCode: string;
    userId: string;
    displayName: string;
};
