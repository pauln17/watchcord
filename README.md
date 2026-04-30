# Watchcord

Watchcord helps Discord users catch the messages that matter before they disappear into the noise.

Built for busy servers, developer communities, support channels, and fast-moving group chats, Watchcord lets users create targeted watches for a whole server or a specific text channel. Each watch can use matching conditions to decide what should trigger an alert, then notify the user directly by DM.

No more manually checking every channel. Watchcord watches the noise for you.

## Core Idea

A watch controls where Watchcord listens.

- A server watch checks messages across the server.
- A channel watch checks messages in one text channel.

A condition controls when that watch triggers.

- `ANY` matches any message in the watch scope.
- `TERM` matches messages using include and exclude terms.
- Conditions can be limited to specific users or roles.
- A watch can have multiple conditions.

When a message matches, Watchcord sends you a DM embed with the watch name, matched conditions, author, message link, and message preview.

## Using Watchcord

The examples below are split across multiple lines to make the fields clear. In Discord, the command picker shows these as command options.

## Create A Watch

Create a server-wide watch:

```text
/watch add
  name: Server Support Alerts
  scope: Guild
  enabled: True
```

Create a channel watch:

```text
/watch add
  name: Release Announcement Alerts
  scope: Channel
  channel: #announcements
  enabled: True
```

Create a disabled watch so you can add conditions before alerts start:

```text
/watch add
  name: Hiring Lead Alerts
  scope: Channel
  channel: #jobs
  enabled: False
```

After creating a watch, Watchcord returns a watch ID. Use that ID to view, edit, remove, or add conditions to the watch.

## List And View Watches

List your watches in the current server:

```text
/watch list
```

View one watch and its conditions:

```text
/watch view
  id: WATCH_ID
```

The watch details show whether the watch is enabled, where it listens, and which conditions are attached.

## Edit A Watch

Rename a watch:

```text
/watch edit
  id: WATCH_ID
  name: Production Incident Alerts
```

Enable or disable a watch:

```text
/watch edit
  id: WATCH_ID
  enabled: False
```

Move a watch to a text channel:

```text
/watch edit
  id: WATCH_ID
  scope: Channel
  channel: #engineering
```

Change a watch back to server-wide:

```text
/watch edit
  id: WATCH_ID
  scope: Guild
```

## Remove A Watch

Remove a watch:

```text
/watch remove
  id: WATCH_ID
```

Removing a watch also removes its conditions.

## Add Conditions

Match any message in the watch scope:

```text
/condition add
  watch-id: WATCH_ID
  name: Any Message Match
  type: Any
```

Match messages containing important terms:

```text
/condition add
  watch-id: WATCH_ID
  name: Incident Keyword Match
  type: Term
  include: outage, degraded, incident
```

Match useful terms while ignoring noisy ones:

```text
/condition add
  watch-id: WATCH_ID
  name: Production Alert Match
  type: Term
  include: production, deploy, incident
  exclude: staging, test, sandbox
```

Match exact casing:

```text
/condition add
  watch-id: WATCH_ID
  name: Priority Tag Match
  type: Term
  include: P0
  sensitive: True
```

Only match messages from specific users:

```text
/condition add
  watch-id: WATCH_ID
  name: Maintainer Message Match
  type: Any
  target-users: USER_ID, USER_ID
```

Only match messages from people with specific roles:

```text
/condition add
  watch-id: WATCH_ID
  name: Staff Release Match
  type: Term
  include: shipped, released, rollout
  target-roles: ROLE_ID
```

## Remove A Condition

Remove a condition:

```text
/condition remove
  id: CONDITION_ID
```

## Example Workflows

### Production incident alerts

Create a channel watch:

```text
/watch add
  name: Production Incident Alerts
  scope: Channel
  channel: #engineering
```

Add a keyword condition:

```text
/condition add
  watch-id: WATCH_ID
  name: Incident Keyword Match
  type: Term
  include: outage, incident, degraded
  exclude: staging, test
```

Watchcord will DM you when a message in `#engineering` includes one of the incident terms and does not include an excluded term.

### Updates from a specific user

Create a server watch:

```text
/watch add
  name: Maintainer Update Alerts
  scope: Guild
```

Add a user-targeted condition:

```text
/condition add
  watch-id: WATCH_ID
  name: Maintainer Message Match
  type: Any
  target-users: USER_ID
```

Watchcord will DM you when that user sends a message anywhere covered by the watch.

### Release notes from a team role

Create a channel watch:

```text
/watch add
  name: Release Note Alerts
  scope: Channel
  channel: #releases
```

Add a role-targeted condition:

```text
/condition add
  watch-id: WATCH_ID
  name: Release Team Match
  type: Term
  include: shipped, released, rollout
  target-roles: ROLE_ID
```

Watchcord will DM you when a matching message is sent by someone with that role.

## Notes

- Watchcord only sends alerts to the user who created the watch.
- Watchcord ignores messages sent by the watch owner.
- Commands must be used inside a Discord server.
- A `TERM` condition needs at least one include or exclude term.
- An `ANY` condition should not include terms.
- Channel watches require a text channel.
- Comma-separated fields can contain multiple values, such as `outage, incident, deploy`.

## License

ISC
