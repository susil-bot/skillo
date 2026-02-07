import React from 'react';
import {
    defineDashboardExtension,
    Page,
    PageBlock,
    PageLayout,
    PageTitle,
} from '@vendure/dashboard';
import { FileText, ListTree, BarChart3, LayoutDashboard, Calendar } from 'lucide-react';
import { PlannerProvider } from './context/planner-context';
import { CalendarProvider } from './content-calendar/context/calendar-context';
import { BrandSetup } from './brand';
import { PlannerBoard } from './planner';
import { RelationshipView } from './visualization';
import { PlatformView } from './platforms';
import { ContentCalendar } from './content-calendar';

const CONTENT_STRATEGY_SECTION = 'content-strategy';
const WRAPPER_CLASS = 'h-[calc(100vh-8rem)] min-h-[400px]';

function makeCspPage(pageId: string, title: string, View: React.ComponentType) {
    return () => (
        <Page pageId={pageId}>
            <PageTitle>{title}</PageTitle>
            <PageLayout>
                <PageBlock column="main" blockId={`${pageId}-block`}>
                    <div className={WRAPPER_CLASS}>
                        <PlannerProvider>
                            <View />
                        </PlannerProvider>
                    </div>
                </PageBlock>
            </PageLayout>
        </Page>
    );
}

defineDashboardExtension({
    navSections: [
        {
            id: CONTENT_STRATEGY_SECTION,
            title: 'Content Strategy',
            icon: FileText,
            placement: 'top',
            order: 450,
        },
    ],
    routes: [
        {
            path: '/content-strategy/brand',
            navMenuItem: {
                sectionId: CONTENT_STRATEGY_SECTION,
                id: 'content-strategy-brand',
                title: 'Brand',
                icon: FileText,
                order: 1,
            },
            component: makeCspPage('content-strategy-brand', 'Brand', BrandSetup),
        },
        {
            path: '/content-strategy/planner',
            navMenuItem: {
                sectionId: CONTENT_STRATEGY_SECTION,
                id: 'content-strategy-planner',
                title: 'Planner',
                icon: ListTree,
                order: 2,
            },
            component: makeCspPage('content-strategy-planner', 'Planner', PlannerBoard),
        },
        {
            path: '/content-strategy/visualization',
            navMenuItem: {
                sectionId: CONTENT_STRATEGY_SECTION,
                id: 'content-strategy-visualization',
                title: 'Visualization',
                icon: BarChart3,
                order: 3,
            },
            component: makeCspPage('content-strategy-visualization', 'Visualization', RelationshipView),
        },
        {
            path: '/content-strategy/platforms',
            navMenuItem: {
                sectionId: CONTENT_STRATEGY_SECTION,
                id: 'content-strategy-platforms',
                title: 'Platforms',
                icon: LayoutDashboard,
                order: 4,
            },
            component: makeCspPage('content-strategy-platforms', 'Platforms', PlatformView),
        },
        {
            path: '/content-strategy/calendar',
            navMenuItem: {
                sectionId: CONTENT_STRATEGY_SECTION,
                id: 'content-strategy-calendar',
                title: 'Content Calendar',
                icon: Calendar,
                order: 5,
            },
            component: () => (
                <Page pageId="content-strategy-calendar">
                    <PageTitle>Content Calendar</PageTitle>
                    <PageLayout>
                        <PageBlock column="main" blockId="content-strategy-calendar-block">
                            <div className={WRAPPER_CLASS}>
                                <CalendarProvider>
                                    <ContentCalendar />
                                </CalendarProvider>
                            </div>
                        </PageBlock>
                    </PageLayout>
                </Page>
            ),
        },
    ],
});
