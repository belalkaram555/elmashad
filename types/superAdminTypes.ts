// Super Admin Types for Centralized Dashboard

export type TenantStatus = 'active' | 'trial' | 'suspended' | 'expired';
export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise';

export interface Tenant {
    id: string;
    restaurantName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    city: string;
    logo?: string;
    status: TenantStatus;
    subscriptionPlan: SubscriptionPlan;
    subscriptionStart: string;
    subscriptionEnd: string;
    storageUsedMB: number;
    storageQuotaMB: number;
    totalOrders: number;
    totalRevenue: number;
    employeeCount: number;
    createdAt: string;
    lastActive: string;
    features: {
        onlineOrdering: boolean;
        kitchenDisplay: boolean;
        multiWarehouse: boolean;
        analytics: boolean;
        customBranding: boolean;
    };
}

export interface PlatformStats {
    totalTenants: number;
    activeTenants: number;
    trialTenants: number;
    suspendedTenants: number;
    totalPlatformRevenue: number;
    totalOrders: number;
    monthlyRecurringRevenue: number;
    averageRevenuePerTenant: number;
    newTenantsThisMonth: number;
    churnedTenantsThisMonth: number;
}

export interface PlanConfig {
    id: string;
    name: string;
    nameAr: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    storageQuotaMB: number;
    employeeLimit: number;
    features: string[];
    isPopular?: boolean;
}

export interface AuditLog {
    id: string;
    action: string;
    performedBy: string;
    targetType: 'tenant' | 'subscription' | 'setting' | 'admin';
    targetId: string;
    details: string;
    timestamp: string;
    ipAddress?: string;
}

export interface GlobalSettings {
    platformName: string;
    platformNameAr: string;
    supportEmail: string;
    supportPhone: string;
    maintenanceMode: boolean;
    maintenanceMessage?: string;
    defaultTrialDays: number;
    defaultCurrency: string;
    allowSelfSignup: boolean;
}
