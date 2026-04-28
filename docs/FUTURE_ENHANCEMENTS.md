# Future Enhancements

Features are tagged by effort: `Quick win` · `Medium lift` · `Big feature`

---

## AI & Intelligence

### User preference memory `Quick win`
Store dietary restrictions, budget level, and travel style across sessions so the AI never asks the same question twice. Could be persisted in a `user_preferences` table keyed by session or account ID.

### Real-time data integration `Medium lift`
Connect live APIs — weather, Google Maps, Yelp, Viator — so recommendations reflect current hours, closures, and crowd levels. Requires a caching layer to avoid latency and API cost spikes.

### Multi-model routing `Medium lift`
Use a fast model (GPT-4o mini) for quick replies and a smarter model for complex itinerary planning, reducing cost without sacrificing quality. Route by message intent classification at the API server layer.

### Voice input support `Big feature`
Add speech-to-text on mobile so travellers can ask questions hands-free while exploring the city. Integrate the Web Speech API (web) or Expo Audio (mobile).

---

## User Experience

### Exportable itinerary `Quick win`
Let users download their plan as a PDF or add stops directly to Google Calendar / Apple Maps with one tap. PDF generation via `pdfkit` or a headless browser; calendar via the Google Calendar API and Apple's `x-apple-datadetectors`.

### Photo-rich responses `Medium lift`
Embed curated photos of recommended places (via Unsplash or Google Places API) directly in the chat for visual discovery. Photos would be fetched server-side and injected as structured content alongside the text response.

### Interactive map view `Big feature`
Render itinerary stops on a Google or Mapbox map with walking routes between them — visual planning alongside the conversation. Requires a structured itinerary output format (JSON) that the frontend can parse into map markers.

### Offline mode `Big feature`
Cache the user's final itinerary locally on mobile so they can access it without data — critical when roaming in Paris. Use Expo SQLite or AsyncStorage for persistence; service workers for the web app.

---

## Collaboration & Social

### Trip sharing & public links `Quick win`
Generate a shareable read-only link to any itinerary so users can send their Paris plan to friends or post it on social media. A `shared_conversations` table with a public UUID slug and a read-only view would cover this.

### Shared trip planning `Big feature`
Let multiple travellers collaborate on the same conversation in real time — great for couples or groups with different interests. Requires WebSocket or SSE multiplexing per conversation, plus presence indicators in the UI.

---

## Business & Monetisation

### Affiliate booking links `Medium lift`
Integrate GetYourGuide, Viator, or OpenTable so the AI surfaces bookable tours and restaurant reservations with affiliate revenue. The AI can be prompted to append deep-link CTAs when recommending specific venues or experiences.

### White-label / multi-city `Big feature`
Abstract the Paris persona into a configurable city template — sell to tourism boards or hotels as their own branded concierge. Requires a `city_config` schema (system prompt, theme tokens, allowed scope) and per-tenant routing.
