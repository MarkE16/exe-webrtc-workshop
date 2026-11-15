import './style.css'
import './call-ui.css'
import './media-state.css'
import './speaking-state.css'
import './participant-volume.css'
import './stage-participants.css'
import { addParticipant, addVideoElement, initUI, removeParticipant, removeVideoElement, setSpeakingParticipants } from './ui-helpers'
import LIVEKIT from './livekit'
import { Track } from 'livekit-client'

const app = document.querySelector<HTMLDivElement>('#app')!
const unsubscribeFns: (() => void)[] = [];
let token: string | null = null;

async function handleJoin(username: string, usingVideo: boolean): Promise<void> {
  const response = await fetch(`http://localhost:3000/token?username=${encodeURIComponent(username)}`);
  if (!response.ok) {
    console.error('Failed to fetch token:', response.statusText);
    return;
  }

  const data = await response.json() as { token: string };
  token = data.token;

  if (!token) {
    console.error('No token received from server');
    return;
  }

  try {
    await LIVEKIT.prepareConnection(token);
    await LIVEKIT.connect(token);

    await LIVEKIT.setSettings({
      audio: true,
      video: usingVideo
    });
    console.log('Connected to LiveKit room successfully');
  } catch (error) {
    console.error('Error connecting to LiveKit room:', error);
  }
}

function cleanup() {
  for (const unsubscribe of unsubscribeFns) {
    unsubscribe();
  }
  unsubscribeFns.length = 0; // Clear the array
}

window.addEventListener("DOMContentLoaded", function () {
  initUI(app, handleJoin, (state) => LIVEKIT.setSettings(state));

  unsubscribeFns.push(
    LIVEKIT.handleTrackSubcribed(function (track, _publication, participant) {
      const element = track.attach();
      if (track.kind === Track.Kind.Video) {
        addVideoElement(element, participant.identity, participant.name || participant.identity);
      }
    }),

    LIVEKIT.handleTrackUnsubscribed(function (track, _publication, _participant) {
      // remove tracks from all attached elements
      const elements = track.detach();
      for (const element of elements) {
        if (track.kind === Track.Kind.Video) {
          removeVideoElement(element);
        }
      }
    }),

    LIVEKIT.handleLocalTrackUnpublished(function (publication, _participant) {
      // when local tracks are ended, update UI to remove them from rendering
      publication.track?.detach();
    }),

    LIVEKIT.handleActiveSpeakersChanged(function (speakers) {
      setSpeakingParticipants(speakers.map((speaker) => speaker.identity));
    }),

    LIVEKIT.handleParticipantConnected(function (participant) {
      addParticipant(participant.identity, participant.name || participant.identity, (volume) => {
        LIVEKIT.setParticipantVolume(participant.identity, volume);
      });
    }),

    LIVEKIT.handleParticipantDisconnected(function (participant) {
      removeParticipant(participant.identity);
    }),

    LIVEKIT.handleConnected(function () {
      // get existing participants
      const participants = LIVEKIT.getExistingParticipants();
      for (const participant of participants) {
        addParticipant(participant.identity, participant.name || participant.identity, (volume) => {
          LIVEKIT.setParticipantVolume(participant.identity, volume);
        });
      }
    }),

    LIVEKIT.handleDisconnected(function () {
      console.log('disconnected from room');
    })
  );
});

window.addEventListener("beforeunload", cleanup);
