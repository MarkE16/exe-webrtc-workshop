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
      
    }),

    LIVEKIT.handleTrackUnsubscribed(function (track, _publication, _participant) {
      
    }),

    LIVEKIT.handleLocalTrackUnpublished(function (publication, _participant) {
      
    }),

    LIVEKIT.handleActiveSpeakersChanged(function (speakers) {
      
    }),

    LIVEKIT.handleParticipantConnected(function (participant) {
      
    }),

    LIVEKIT.handleParticipantDisconnected(function (participant) {
      
    }),

    LIVEKIT.handleConnected(function () {
      
    }),

    LIVEKIT.handleDisconnected(function () {
      console.log('disconnected from room');
    })
  );
});

window.addEventListener("beforeunload", cleanup);
