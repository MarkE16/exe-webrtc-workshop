import {
  LocalParticipant,
  LocalTrackPublication,
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  VideoPresets
} from "livekit-client";

// For the purposes of the workshop, we will use the URL
// of my LiveKit deployment, but you should use your own deployment
// (either self-hosted or LiveKit Cloud) in a real application,
// and store the URL that points to your deployment in an environment variable.
const URL = "wss://test-xf6qq2xb.livekit.cloud";

const room = new Room({
  adaptiveStream: true,
  dynacast: true,
  videoCaptureDefaults: {
    resolution: VideoPresets.h720,
    frameRate: 30
  },
});

const LIVEKIT = {
  // prepare the connection, so that actually attempting
  // to connect to the room is faster
  async prepareConnection(token: string) {
    await room.prepareConnection(URL, token);
  },

  async connect(token: string) {
    await room.connect(URL, token);
  },

  async setSettings(settings: { audio: boolean, video: boolean }) {
    // you can also call enableCameraAndMicrophone directly, but this is a more general approach
    const localParticipant = room.localParticipant;
    if (settings.audio) {
      await localParticipant.setMicrophoneEnabled(true);
    } else {
      await localParticipant.setMicrophoneEnabled(false);
    }

    if (settings.video) {
      await localParticipant.setCameraEnabled(true);
    } else {
      await localParticipant.setCameraEnabled(false);
    }
  },

  getExistingParticipants() {
    return Array.from(room.remoteParticipants.values());
  },

  setParticipantVolume(identity: string, volume: number) {
    room.remoteParticipants.get(identity)?.setVolume(volume);
  },

  /* Event handlers */

  handleTrackSubcribed(fn: (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => void) {
    room.on(RoomEvent.TrackSubscribed, fn);

    return function unsubscribe() {
      room.off(RoomEvent.TrackSubscribed, fn);
    }
  },

  handleTrackUnsubscribed(fn: (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => void) {
    room.on(RoomEvent.TrackUnsubscribed, fn);

    return function unsubscribe() {
      room.off(RoomEvent.TrackUnsubscribed, fn);
    }
  },

  handleActiveSpeakersChanged(fn: (speakers: Participant[]) => void) {
    room.on(RoomEvent.ActiveSpeakersChanged, fn);

    return function unsubscribe() {
      room.off(RoomEvent.ActiveSpeakersChanged, fn);
    }
  },

  handleParticipantConnected(fn: (participant: RemoteParticipant) => void) {
    room.on(RoomEvent.ParticipantConnected, fn);

    return function unsubscribe() {
      room.off(RoomEvent.ParticipantConnected, fn);
    }
  },

  handleParticipantDisconnected(fn: (participant: RemoteParticipant) => void) {
    room.on(RoomEvent.ParticipantDisconnected, fn);

    return function unsubscribe() {
      room.off(RoomEvent.ParticipantDisconnected, fn);
    }
  },

  handleLocalTrackUnpublished(fn: (publication: LocalTrackPublication, participant: LocalParticipant) => void) {
    room.on(RoomEvent.LocalTrackUnpublished, fn);

    return function unsubscribe() {
      room.off(RoomEvent.LocalTrackUnpublished, fn);
    }
  },

  handleConnected(fn: () => void) {
    room.on(RoomEvent.Connected, fn);

    return function unsubscribe() {
      room.off(RoomEvent.Connected, fn);
    }
  },

  handleDisconnected(fn: () => void) {
    room.on(RoomEvent.Disconnected, fn);

    return function unsubscribe() {
      room.off(RoomEvent.Disconnected, fn);
    }
  }
}

export default LIVEKIT;
