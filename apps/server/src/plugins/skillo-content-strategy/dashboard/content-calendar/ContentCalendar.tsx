import { useState } from 'react';
import { useCalendar } from './context/calendar-context';
import { ViewSwitcher } from './components/ViewSwitcher';
import { TableView } from './components/TableView';
import { KanbanView } from './components/KanbanView';
import { CalendarView } from './components/CalendarView';
import { ContentItemForm } from './components/ContentItemForm';
import type { ContentCalendarItem } from './types';

export function ContentCalendar() {
    const { viewMode, selectedItemId, setSelectedItemId, getItemById } = useCalendar();
    const [showAddForm, setShowAddForm] = useState(false);

    const editingItem = selectedItemId ? getItemById(selectedItemId) : null;
    const showForm = showAddForm || editingItem;

    const handleAdd = () => {
        setSelectedItemId(null);
        setShowAddForm(true);
    };

    const handleEdit = (item: ContentCalendarItem) => {
        setShowAddForm(false);
        setSelectedItemId(item.id);
    };

    const handleCloseForm = () => {
        setShowAddForm(false);
        setSelectedItemId(null);
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <h1 className="text-2xl font-bold mb-2">Content Calendar</h1>
            <p className="text-muted-foreground text-sm mb-6">
                Plan and manage content across platforms. Table, Kanban, or Calendar view.
            </p>

            <ViewSwitcher />

            {showForm && (
                <div className="mb-6 max-w-xl">
                    <ContentItemForm
                        item={editingItem ?? null}
                        onSave={handleCloseForm}
                        onCancel={handleCloseForm}
                    />
                </div>
            )}

            {viewMode === 'table' && (
                <TableView onAdd={handleAdd} onEdit={handleEdit} />
            )}
            {viewMode === 'kanban' && <KanbanView onEdit={handleEdit} />}
            {viewMode === 'calendar' && <CalendarView onEdit={handleEdit} />}
        </div>
    );
}
