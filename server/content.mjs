// Server-only case materials. Never import this module into the browser bundle.
export const evidence = {
  access: { title: 'B-07 / authentication journal', source: 'Read-only terminal export', timestamp: '23:17–23:28', location: 'Main desk · B-07', content: `23:17:04  NIKHIL.S  B-07     DENIED / expired visitor permit
23:18:51  ARJUN.K   B-07     GRANTED / service-token replay
23:21:33  ARJUN.K   BLACKBOX GRANTED / archive read
23:28:09  SYSTEM    ALL     EMERGENCY LOCKDOWN

The first failed login raised the incident flag. A later login succeeded through the service-token endpoint. These are authentication identities, not eyewitness identifications.`, metadata: { integrity: 'Write-once audit mirror', clock: 'Facility master time' } },
  directory: { title: 'Personnel / credential register', source: 'Security directory', timestamp: '22:50:00', location: 'Main desk · B-07', content: `ARJUN.K — Arjun Khanna · archive custodian · badge AK-09
Account disabled at 22:50 after a reported token loss. HR exit gate records him leaving at 22:46. Disabling the account revokes interactive login immediately; legacy service tokens remain valid until the next key rotation.

NIKHIL.S — Nikhil Sen · visiting researcher · badge NS-04
Visitor permit ended at 23:00. No service credentials issued.

MEERA.R — Meera Rao · on-call systems engineer · badge MR-12
Approved for maintenance of recording equipment. No BLACKBOX content clearance.

Badge assignment is individual. Equipment access alone does not establish archive authorization.`, metadata: { edition: 'Night-shift roster / certified copy' } },
  memo: { title: 'Unfinished handover', source: 'Signed paper note', timestamp: '22:55', location: 'Central investigation desk', content: `To the night engineer:
Arjun reported his service token missing. His account is disabled, but the legacy endpoint will still accept the token until keys rotate at midnight. Do not confuse the account name in a replay entry with the person at the keyboard.

Camera 07 is still pending synchronization. The maintenance sheet is clipped beside its recorder. Read the actual offset before using a camera time as an alibi.

If incident review is required, preserve the conduit inspection packet. The cabinet is released only after an investigator identifies the correct service bay.
— L. Das, security supervisor`, metadata: { condition: 'Original, initialled LD' } },
  camera: { title: 'Camera 07 / retained contact sheet', source: 'CCTV recorder · visual transcript', timestamp: 'Recorder time 23:13:42', location: 'Security observation station', content: `FRAME 1881 · 23:13:42 — A person enters the east service passage carrying a grey maintenance case. Face is obscured by the door frame. The lanyard is turned away.
FRAME 1890 · 23:13:51 — The person kneels at a junction labelled E / 7. No other person is visible.
FRAME 2022 · 23:16:03 — The person leaves without the case.

This camera cannot identify the operator. It establishes activity at a labelled physical junction. Recorder timestamps are NOT master-clock timestamps.`, metadata: { camera: '07', export: 'Frames preserved before recorder shutdown' } },
  maintenance: { title: 'WO-219 / recorder timing fault', source: 'Maintenance clipboard', timestamp: '21:40', location: 'Recorder service alcove', content: `CAMERA 07: internal clock is exactly 00:06:00 BEHIND the facility master clock. Fault verified against the corridor wall clock. Offset remained constant through lockdown.

To reconstruct a facility time, ADD six minutes to each Camera 07 timestamp. Do not correct terminal or access-journal times: those already use the master clock.

Synchronization deferred to preserve recorded material.
Technician: M. Rao. Work order closes at 23:30.`, metadata: { reference: 'WO-219', measuredDrift: '−360 seconds' } },
  routing: { title: 'East passage / conduit schedule', source: 'Rack-mounted service drawing', location: 'Server rack · routing plate', content: `PASSAGE     JUNCTION       SERVICE BAY
West        W / 7          A02-07
East        E / 3          B04-03
East        E / 7          B04-07
North       N / 7          C01-07

A junction number is not a room number. Use BOTH the passage and the junction label when locating a connection.

B04 bays expose the legacy maintenance bridge to terminal B-07. A physical connection here can replay a service token without the credential owner being present.`, metadata: { revision: 'Facilities drawing 12C' } },
}

Object.assign(evidence, {
  timeline: { title: 'Corrected incident chronology', source: 'Investigator reconstruction', location: 'Case worksheet', content: `23:17:04 — Expired visitor credential denied.
23:18:51 — ARJUN.K service token accepted.
23:19:42 — Camera 07 records entry into east passage (corrected).
23:21:33 — BLACKBOX archive accessed.
23:22:03 — Person exits east passage (corrected).
23:28:09 — Lockdown.

The camera window overlaps the archive read. The failed visitor login precedes the replay and does not establish who performed it.`, metadata: { method: 'Recorder time + verified six-minute offset' } },
  custody: { title: 'B04-07 / sealed inspection packet', source: 'Evidence cabinet', timestamp: '23:32', location: 'Cabinet · physical evidence', content: `Recovered from east passage junction E / 7:
• Grey maintenance case, checked out at 22:58 to badge MR-12.
• Service bridge adapter, serial SB-19, connected to B04-07.
• Adapter buffer records a token replay followed by a BLACKBOX request.

Tamper seal: C-0331.
For an authorized read of the seized buffer, enter the tamper-seal reference into the terminal archive custody check. This is an evidence reference, not a user password.

A checked-out case is circumstantial. Confirm the operator with the signed buffer record before accusing anyone.`, metadata: { witness: 'L. Das', chain: 'Sealed in place, transferred to cabinet' } },
  archive: { title: 'BLACKBOX / signed bridge audit', source: 'Recovered adapter buffer', timestamp: '23:21:33', location: 'Restricted archive viewer', content: `ADAPTER SB-19 · signed local audit
Operator presence certificate: MR-12 / Meera Rao
Certificate matched device-local PIN confirmation at 23:18:44.
Authentication replay: ARJUN.K / stolen service token
Physical endpoint: B04-07
Archive object read: ORCHID / containment transfer manifest
Read completed: 23:21:33. No write or deletion recorded.

MR-12 signed the adapter operation; ARJUN.K authenticated the archive request. These are separate roles. The record proves access, not motive.`, metadata: { signature: 'Verified against device trust registry', object: 'ORCHID', confidence: 'Device record corroborated by physical recovery' } },
})
for (const [id, item] of Object.entries(evidence)) item.id = id
export const puzzles = [
  { id: 'credential', title: 'Credential review', question: 'Which credential authenticated after its owner’s account was disabled? Submit the login identity, not the person you suspect.', label: 'Credential identity', requires: ['access', 'directory', 'memo'], answer: ['arjun.k', 'arjun k'], reward: null },
  { id: 'timeline', title: 'Clock reconciliation', question: 'At what facility-master time did the person ENTER the east passage? Use HH:MM:SS.', label: 'Corrected entry time', requires: ['camera', 'maintenance'], answer: ['23:19:42'], reward: 'timeline' },
  { id: 'location', title: 'Physical correlation', question: 'Which service bay corresponds to the junction in the retained camera frames? Use the facilities drawing.', label: 'Service bay', requires: ['timeline', 'routing'], answer: ['b04-07', 'b04 07'], reward: null },
  { id: 'custody', title: 'Archive custody check', question: 'Enter the tamper-seal reference from the physical inspection packet to read the seized adapter buffer.', label: 'Tamper seal', requires: ['custody'], answer: ['c-0331', 'c0331'], reward: 'archive' },
]
export const finalAnswers = {
  operator: ['meera rao', 'meera.r', 'meera r'], credential: ['arjun.k', 'arjun k'],
  location: ['b04-07', 'b04 07'], archive: ['orchid', 'orchid containment transfer manifest', 'orchid / containment transfer manifest'],
}
export const hints = {
  credential: ['Compare an accepted identity with its account status.', 'The directory and handover explain two different login mechanisms.', 'ARJUN.K was disabled, but its legacy service token remained valid.'],
  timeline: ['The recorder and terminal do not share the same clock.', 'Read WO-219 at the service alcove; use the first camera frame.', 'Add six minutes to 23:13:42. The entry time is 23:19:42.'],
  location: ['A junction label is not a room number.', 'Match both East and 7 against the server-rack drawing.', 'East / E / 7 routes to B04-07.'],
  custody: ['Physical evidence is now available in the cabinet.', 'The packet names a tamper seal used by the archive custody check.', 'Read the buffer using seal C-0331.'],
  final: ['Authentication identity and operator identity are different.', 'The signed buffer identifies the operator; the directory expands the badge owner.', 'Meera Rao operated the adapter using ARJUN.K at B04-07 to read ORCHID.'],
}
