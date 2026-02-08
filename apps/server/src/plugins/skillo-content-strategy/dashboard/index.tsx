import React from 'react';
import {
    defineDashboardExtension,
    Page,
    PageBlock,
    PageLayout,
    PageTitle,
} from '@vendure/dashboard';
import { FileText, ListTree, BarChart3, LayoutDashboard, Calendar, Workflow, Webhook, Send } from 'lucide-react';
import { PlannerProvider } from './context/planner-context';
import { CalendarProvider } from './content-calendar/context/calendar-context';
import { BrandSetup } from './brand';
import { PlannerBoard } from './planner';
import { RelationshipView } from './visualization';
import { PlatformView } from './platforms';
import { ContentCalendar } from './content-calendar';
import { AutomationWorkflow } from './automation-workflow';
import { WebhooksView } from './automation-webhooks';
import { PostsView } from './automation-posts';

const CONTENT_STRATEGY_SECTION = 'content-strategy';
const AUTOMATION_SECTION = 'automation';
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
        {
            id: AUTOMATION_SECTION,
            title: 'Automation',
            icon: Workflow,
            placement: 'top',
            order: 460,
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
        {
            path: '/automation/workflows',
            navMenuItem: {
                sectionId: AUTOMATION_SECTION,
                id: 'automation-workflows',
                title: 'Workflows',
                icon: Workflow,
                order: 1,
            },
            component: () => (
                <Page pageId="automation-workflows">
                    <PageTitle>Automation workflows</PageTitle>
                    <PageLayout>
                        <PageBlock column="main" blockId="automation-workflows-block">
                            <div className={WRAPPER_CLASS}>
                                <AutomationWorkflow />
                            </div>
                        </PageBlock>
                    </PageLayout>
                </Page>
            ),
        },
        {
            path: '/automation/webhooks',
            navMenuItem: {
                sectionId: AUTOMATION_SECTION,
                id: 'automation-webhooks',
                title: 'Webhooks',
                icon: Webhook,
                order: 2,
            },
            component: () => (
                <Page pageId="automation-webhooks">
                    <PageTitle>Webhooks</PageTitle>
                    <PageLayout>
                        <PageBlock column="main" blockId="automation-webhooks-block">
                            <div className={WRAPPER_CLASS}>
                                <WebhooksView />
                            </div>
                        </PageBlock>
                    </PageLayout>
                </Page>
            ),
        },
        {
            path: '/automation/posts',
            navMenuItem: {
                sectionId: AUTOMATION_SECTION,
                id: 'automation-posts',
                title: 'Posts',
                icon: Send,
                order: 3,
            },
            component: () => (
                <Page pageId="automation-posts">
                    <PageTitle>Posts</PageTitle>
                    <PageLayout>
                        <PageBlock column="main" blockId="automation-posts-block">
                            <div className={WRAPPER_CLASS}>
                                <PostsView />
                            </div>
                        </PageBlock>
                    </PageLayout>
                </Page>
            ),
        },
    ],
});
