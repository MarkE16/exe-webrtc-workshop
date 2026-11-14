function lobbyMarkup() {
  return `
    <header class="topbar"><a class="brand" href="/" aria-label="Gather home"><span class="brand-mark">✳</span> gather<span class="brand-dot">.</span></a><span class="top-label"><span class="status-dot"></span> YOUR SPACE TO CONNECT</span></header>
    <main class="layout">
      <section class="intro"><div class="eyebrow"><span></span> GOOD TO SEE YOU</div><h1>Better together,<br><em>wherever you are.</em></h1><p>Make space for conversations that matter. Jump into a call and bring everyone a little closer.</p><div class="people"><div class="avatars"><span>J</span><span>M</span><span>A</span></div><div><strong>Made for real connection</strong><small>One conversation at a time.</small></div></div></section>
      <section class="lobby" aria-labelledby="lobby-title"><div class="card-top"><span class="card-icon">✳</span><span class="tag">YOUR CALL LOBBY</span></div><h2 id="lobby-title">Let’s get you in.</h2><p class="card-copy">First, tell everyone what to call you.</p><form id="join-form"><label for="username">YOUR NAME</label><input id="username" name="username" placeholder="Enter your name" autocomplete="nickname" maxlength="50" required /><div class="divider"></div><span class="field-label">HOW WOULD YOU LIKE TO JOIN?</span><div class="choices"><button type="submit" name="mode" value="voice" class="choice"><span class="choice-icon">♩</span><span><strong>Join with voice</strong><small>Audio only, camera off</small></span><span class="arrow">↗</span></button><button type="submit" name="mode" value="video" class="choice video"><span class="choice-icon">▣</span><span><strong>Join with video</strong><small>Camera and microphone on</small></span><span class="arrow">↗</span></button></div></form><div class="card-footer"><span>✦</span> Come as you are. Leave feeling closer.</div></section>
    </main><footer><span>© GATHER · A LITTLE MORE TOGETHER</span><span>MADE FOR CONVERSATION <span class="heart">♥</span></span></footer>`
}

function callMarkup(name: string, mode: 'voice' | 'video') {
  const isVideo = mode === 'video'
  return `
    <header class="call-topbar"><a class="brand" href="/" aria-label="Gather home"><span class="brand-mark">✳</span> gather<span class="brand-dot">.</span></a><div class="room-name"><span class="live-dot"></span> THE COMMON ROOM <span class="call-time">00:00</span></div><button class="quiet-button" type="button">•••</button></header>
    <main class="call-shell ${isVideo ? 'video-call' : 'voice-call'}">
      <section class="call-stage" aria-label="Call in progress">
        ${isVideo ? `<div class="remote-video"><div class="remote-placeholder"><span>✳</span><p>Waiting for others to join</p></div><span class="stage-label">THE COMMON ROOM</span></div><div class="self-video" data-participant-id="${name}"><div class="self-avatar">${name.slice(0, 1).toUpperCase()}</div><span>You</span><i class="speaking-badge">Speaking</i></div>` : `<div class="voice-orbit" data-participant-id="${name}"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="orbit-avatar">${name.slice(0, 1).toUpperCase()}</div></div><p class="voice-status">You’re the only one here</p><p class="voice-hint">Invite someone to begin the conversation.</p>`}
      </section>
      <aside class="call-sidebar"><div class="sidebar-heading"><div><span class="eyebrow"><span></span> IN THE ROOM</span><h2>People</h2></div><span class="count">1</span></div><div class="participant" data-participant-id="${name}"><span class="participant-avatar">${name.slice(0, 1).toUpperCase()}</span><span><strong>${name}</strong><small>You</small></span><span class="mic-state">⌁</span><i class="speaking-badge">Speaking</i></div></aside>
    </main>
    <nav class="call-controls" aria-label="Call controls"><button type="button" data-media-control="audio" aria-label="Mute microphone" aria-pressed="true"><span>♩</span><small>Mute</small></button><button type="button" data-media-control="video" aria-label="Turn camera off" aria-pressed="${isVideo}"><span>▣</span><small>${isVideo ? 'Camera' : 'Start video'}</small></button><button type="button" class="end-call" aria-label="Leave call"><span>×</span><small>Leave</small></button></nav>`
}

type MediaState = { audio: boolean; video: boolean }
type MediaStateHandler = (state: MediaState) => Promise<void> | void

function setControlState(control: 'audio' | 'video', enabled: boolean) {
  const button = document.querySelector<HTMLButtonElement>(`[data-media-control="${control}"]`)
  if (!button) return
  button.classList.toggle('is-off', !enabled)
  button.setAttribute('aria-pressed', String(enabled))
  button.setAttribute('aria-label', enabled ? `Turn ${control === 'audio' ? 'microphone' : 'camera'} off` : `Turn ${control === 'audio' ? 'microphone' : 'camera'} on`)
  button.querySelector('small')!.textContent = control === 'audio' ? (enabled ? 'Mute' : 'Unmute') : (enabled ? 'Camera' : 'Start video')
  if (control === 'video') document.querySelector('.self-video')?.classList.toggle('camera-off', !enabled)
  if (control === 'audio') document.querySelector('.mic-state')!.textContent = enabled ? '⌁' : '⌁̸'
}

function addMediaStateHelpers(initialState: MediaState, onMediaStateChange?: MediaStateHandler) {
  const state = { ...initialState }
  setControlState('audio', state.audio)
  setControlState('video', state.video)
  for (const control of ['audio', 'video'] as const) {
    document.querySelector<HTMLButtonElement>(`[data-media-control="${control}"]`)?.addEventListener('click', async () => {
      state[control] = !state[control]
      setControlState(control, state[control])
      await onMediaStateChange?.(state)
    })
  }
}

function setSpeakingParticipants(activeParticipantIds: string[]) {
  const activeIds = new Set(activeParticipantIds)
  document.querySelectorAll<HTMLElement>('[data-participant-id]').forEach((element) => {
    element.classList.toggle('is-speaking', activeIds.has(element.dataset.participantId!))
  })
}

function updateParticipantCount() {
  const count = document.querySelector<HTMLElement>('.call-sidebar .count')
  if (count) count.textContent = String(document.querySelectorAll('.participant').length)
}

function addParticipant(identity: string, displayName = identity) {
  if (document.querySelector(`[data-participant-id="${CSS.escape(identity)}"]`)) return
  const sidebar = document.querySelector<HTMLElement>('.call-sidebar')
  if (!sidebar) return

  const participant = document.createElement('div')
  participant.className = 'participant'
  participant.dataset.participantId = identity
  const initial = displayName.trim().charAt(0).toUpperCase() || '?'
  participant.innerHTML = `<span class="participant-avatar">${initial}</span><span><strong></strong><small>Connected</small></span><span class="mic-state">⌁</span><i class="speaking-badge">Speaking</i>`
  participant.querySelector('strong')!.textContent = displayName
  sidebar.appendChild(participant)
  updateParticipantCount()
}

function removeParticipant(identity: string) {
  document.querySelectorAll<HTMLElement>('[data-participant-id]').forEach((element) => {
    if (element.dataset.participantId === identity && element.classList.contains('participant')) element.remove()
  })
  updateParticipantCount()
}

function initUI(app: HTMLDivElement, handleJoin: (username: string, usingVideo: boolean) => Promise<void>, onMediaStateChange?: MediaStateHandler) {
  app.innerHTML = lobbyMarkup()
  const form = document.querySelector<HTMLFormElement>('#join-form')!
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const name = document.querySelector<HTMLInputElement>('#username')!.value.trim()
    if (!name) return document.querySelector<HTMLInputElement>('#username')!.focus()
    const mode = ((event as SubmitEvent).submitter as HTMLButtonElement).value as 'voice' | 'video'
    const initialState = { audio: true, video: mode === 'video' }
    handleJoin(name, initialState.video);
    app.innerHTML = callMarkup(name, mode);
    addMediaStateHelpers(initialState, onMediaStateChange)
  })
}

function addVideoElement(video: HTMLMediaElement) {
  const remoteVideoContainer = document.querySelector<HTMLDivElement>('.remote-video')!
  remoteVideoContainer.appendChild(video)  
}

function removeVideoElement(video: HTMLMediaElement) {
  const remoteVideoContainer = document.querySelector<HTMLDivElement>('.remote-video')!
  remoteVideoContainer.removeChild(video)
}

export { initUI, addVideoElement, removeVideoElement, setSpeakingParticipants, addParticipant, removeParticipant }
