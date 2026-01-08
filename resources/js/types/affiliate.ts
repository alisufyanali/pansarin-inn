// types/affiliate.ts

export type Decimal = string | number;

export interface Affiliate {
    id: number;
    user_id: number;
    affiliate_code: string;
    balance: Decimal;
    commission_rate: number;
    status: 0 | 1;

    payment_method?: string;
    payment_account_title?: string;
    payment_iban_details?: string;
    payment_account_no_details?: string;

    parent_id?: number;

    user?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
}

export interface Referral {
    id: number;
    affiliate_id: number;
    order_id: number;
    user_id?: number;

    order_amount: Decimal;
    commission_amount: Decimal;

    referral_type: 'direct' | 'level_2';
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;

    affiliate?: Affiliate;

    order?: {
        id: number;
        order_number: string;
        status: string;
        grand_total: Decimal;
    };

    customer_user?: {
        first_name: string;
        last_name: string;
    };
}

export interface PayoutRequest {
    id: number;
    affiliate_id: number;
    amount: Decimal;

    status: 'pending' | 'processing' | 'completed' | 'rejected';

    transaction_id?: string;
    admin_note?: string;
    created_at: string;
    processed_at?: string;

    affiliate?: Affiliate;
}
