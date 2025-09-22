import { MenuItem } from "./menu.model";

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'Dashboard',
        isTitle: true
    },
    {
        id: 2,
        label: 'Main Dashboard',
        icon: 'ti ti-dashboard',
        link: '/',
        parentId: 1
    },
    {
        id: 20,
        label: 'E-commerce Dashboard',
        icon: 'ti ti-shopping-cart',
        link: '/dashboard/ecommerce',
        parentId: 1
    },
    {
        id: 3,
        label: 'Estate Management',
        isTitle: true
    },
    {
        id: 4,
        label: 'Estates',
        icon: 'ti ti-building',
        subItems: [
            {
                id: 5,
                label: 'All Estates',
                link: '/khanyi/estates',
                parentId: 4,
                roles: ['system_admin', 'estate_admin', 'tenant']
            },
            {
                id: 6,
                label: 'Add Estate',
                link: '/khanyi/estates/create',
                parentId: 4,
                roles: ['system_admin']
            },
            {
                id: 7,
                label: 'Estate Analytics',
                link: '/charts/apex-area',
                parentId: 4,
                roles: ['system_admin', 'estate_admin']
            }
        ]
    },
    {
        id: 8,
        label: 'Units & Meters',
        icon: 'ti ti-device-analytics',
        subItems: [
            {
                id: 9,
                label: 'All Units',
                link: '/tables/gridjs',
                parentId: 8
            },
            {
                id: 10,
                label: 'Meter Management',
                link: '/apps/widgets',
                parentId: 8
            },
            {
                id: 11,
                label: 'Tariff Management',
                link: '/forms/advanced',
                parentId: 8
            }
        ]
    },
    {
        id: 12,
        label: 'Transactions',
        isTitle: true
    },
    {
        id: 13,
        label: 'Purchases',
        icon: 'ti ti-receipt',
        subItems: [
            {
                id: 14,
                label: 'All Purchases',
                link: '/khanyi/purchases',
                parentId: 13
            },
            {
                id: 15,
                label: 'Failed Transactions',
                link: '/tables/basic',
                parentId: 13
            },
            {
                id: 16,
                label: 'Refunds',
                link: '/invoices',
                parentId: 13
            },
            {
                id: 17,
                label: 'Revenue Analytics',
                link: '/charts/apex-column',
                parentId: 13
            }
        ]
    },
    {
        id: 18,
        label: 'Token Management',
        icon: 'ti ti-coin',
        subItems: [
            {
                id: 19,
                label: 'Generated Tokens',
                link: '/apps/to-do',
                parentId: 18
            },
            {
                id: 21,
                label: 'Token Analytics',
                link: '/charts/apex-pie',
                parentId: 18
            }
        ]
    },
    {
        id: 22,
        label: 'User Management',
        isTitle: true
    },
    {
        id: 23,
        label: 'Users',
        icon: 'ti ti-users',
        subItems: [
            {
                id: 24,
                label: 'All Users',
                link: '/khanyi/users',
                parentId: 23,
                roles: ['system_admin']
            },
            {
                id: 25,
                label: 'Tenants',
                link: '/tables/gridjs',
                parentId: 23,
                roles: ['system_admin', 'estate_admin']
            },
            {
                id: 26,
                label: 'Estate Admins',
                link: '/apps/contacts',
                parentId: 23,
                roles: ['system_admin']
            },
            {
                id: 27,
                label: 'User Analytics',
                link: '/charts/apex-bar',
                parentId: 23,
                roles: ['system_admin', 'estate_admin']
            }
        ]
    },
    {
        id: 28,
        label: 'Communication',
        isTitle: true
    },
    {
        id: 29,
        label: 'Notifications',
        icon: 'ti ti-bell',
        subItems: [
            {
                id: 30,
                label: 'All Notifications',
                link: '/apps/email',
                parentId: 29
            },
            {
                id: 31,
                label: 'Send Notification',
                link: '/forms/elements',
                parentId: 29
            },
            {
                id: 32,
                label: 'Templates',
                link: '/forms/editors',
                parentId: 29
            },
            {
                id: 33,
                label: 'Analytics',
                link: '/charts/apex-radar',
                parentId: 29
            }
        ]
    },
    {
        id: 34,
        label: 'Reports & Analytics',
        isTitle: true
    },
    {
        id: 35,
        label: 'Reports',
        icon: 'ti ti-chart-bar',
        subItems: [
            {
                id: 36,
                label: 'Financial Reports',
                link: '/charts/apex-mixed',
                parentId: 35
            },
            {
                id: 37,
                label: 'Usage Reports',
                link: '/charts/apex-heatmap',
                parentId: 35
            },
            {
                id: 38,
                label: 'Estate Performance',
                link: '/charts/apex-radialbar',
                parentId: 35
            },
            {
                id: 39,
                label: 'Custom Reports',
                link: '/charts/apex-bubble',
                parentId: 35
            }
        ]
    },
    {
        id: 40,
        label: 'System Management',
        isTitle: true
    },
    {
        id: 41,
        label: 'System Settings',
        icon: 'ti ti-settings',
        subItems: [
            {
                id: 42,
                label: 'General Settings',
                link: '/forms/validation',
                parentId: 41
            },
            {
                id: 43,
                label: 'Payment Settings',
                link: '/forms/wizard',
                parentId: 41
            },
            {
                id: 44,
                label: 'Notification Settings',
                link: '/forms/pickers',
                parentId: 41
            }
        ]
    },
    {
        id: 45,
        label: 'System Monitoring',
        icon: 'ti ti-activity',
        subItems: [
            {
                id: 46,
                label: 'System Health',
                link: '/apps/widgets',
                parentId: 45
            },
            {
                id: 47,
                label: 'Audit Logs',
                link: '/tables/basic',
                parentId: 45
            },
            {
                id: 48,
                label: 'API Monitoring',
                link: '/charts/apex-line',
                parentId: 45
            }
        ]
    }
]