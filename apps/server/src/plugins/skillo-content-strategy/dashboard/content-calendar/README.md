# Content Calendar (CSP)

Notion-style content calendar for the Content Strategy Plugin: **Table**, **Kanban**, and **Calendar** views.

## Structure

- **`types.ts`** – `ContentCalendarItem`, status/contentType enums, view mode and filter types.
- **`constants.ts`** – Status/content type/platform options and column order.
- **`mock-data.ts`** – Sample items for MVP (replace with API later).
- **`context/calendar-context.tsx`** – State: items, viewMode, filter, CRUD, `getFilteredItems`, `groupItemsByStatus`.
- **`components/ViewSwitcher.tsx`** – All Content / Upcoming + Table / Kanban / Calendar.
- **`components/TableView.tsx`** – Notion-style table: Title, Date, Platforms, Status, Content Type, Brand, Linked.
- **`components/KanbanView.tsx`** – Columns by status; HTML5 drag-and-drop to change status.
- **`components/CalendarView.tsx`** – Month grid; items per day; click to edit.
- **`components/ContentItemForm.tsx`** – Add/Edit form (title, date, platforms, status, type, brand tag, notes).
- **`ContentCalendar.tsx`** – Composes switcher + active view + form.
- **`fetcher.ts`** / **`transformer.ts`** – Prepared for API and data transforms.

## Data model

```ts
ContentCalendarItem {
  id, title, description?, date, platforms[], status, contentType,
  linkedContentIds[], brandTag?, notes?, createdAt, updatedAt
}
```

## Extending

1. **API** – In `calendar-context.tsx`, replace `useState(MOCK_CALENDAR_ITEMS)` with a fetch from `fetcher.ts` (or CSP GraphQL). Use `transformer.ts` for sort/filter/group.
2. **Drag date in Calendar** – Add `onDrop` on day cells and call `updateItemDate(id, dateStr)`.
3. **Linked content UI** – In `ContentItemForm`, add a multi-select of other items for `linkedContentIds`.
4. **Delete** – Add a delete action in the form or row context menu and call `deleteItem(id)` from context.

## Route

Dashboard → **Content Strategy** → **Content Calendar** (`/content-strategy/calendar`).
