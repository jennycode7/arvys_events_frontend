# Arvys Events — HTML, CSS and JavaScript

A browser-based event management prototype for a project demonstration.

## Run it
1. Extract the folder.
2. Open `index.html` in a modern browser. No package installation or server is required.
3. Use the Dashboard, Events and Attendees navigation.
4. Create events, edit/delete events, and register attendees.

## Features
- Dashboard statistics
- Create, edit, delete events
- Attendee registration and removal
- Capacity checks and duplicate email prevention per event
- Search events and attendees
- Responsive layout
- Persists data in browser `localStorage`
- Includes sample events and registrations on first launch

## Important limitation
This is a frontend-only prototype. Data is stored in the current browser's localStorage; it is not shared across devices and has no server-side authentication. For production use, connect it to a backend and database.

## Files
- `index.html` — structure and forms
- `style.css` — styling and responsive layout
- `app.js` — rendering, state, localStorage and validation
