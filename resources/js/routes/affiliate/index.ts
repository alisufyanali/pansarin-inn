import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import register from './register'
import payout from './payout'
/**
* @see \App\Http\Controllers\Vendor\AffiliateController::dashboard
 * @see app/Http/Controllers/Vendor/AffiliateController.php:15
 * @route '/affiliates/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/affiliates/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Vendor\AffiliateController::dashboard
 * @see app/Http/Controllers/Vendor/AffiliateController.php:15
 * @route '/affiliates/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Vendor\AffiliateController::dashboard
 * @see app/Http/Controllers/Vendor/AffiliateController.php:15
 * @route '/affiliates/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Vendor\AffiliateController::dashboard
 * @see app/Http/Controllers/Vendor/AffiliateController.php:15
 * @route '/affiliates/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Vendor\AffiliateController::dashboard
 * @see app/Http/Controllers/Vendor/AffiliateController.php:15
 * @route '/affiliates/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Vendor\AffiliateController::dashboard
 * @see app/Http/Controllers/Vendor/AffiliateController.php:15
 * @route '/affiliates/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Vendor\AffiliateController::dashboard
 * @see app/Http/Controllers/Vendor/AffiliateController.php:15
 * @route '/affiliates/dashboard'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
/**
* @see \App\Http\Controllers\Vendor\AffiliateController::store
 * @see app/Http/Controllers/Vendor/AffiliateController.php:34
 * @route '/affiliates/register'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/affiliates/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Vendor\AffiliateController::store
 * @see app/Http/Controllers/Vendor/AffiliateController.php:34
 * @route '/affiliates/register'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Vendor\AffiliateController::store
 * @see app/Http/Controllers/Vendor/AffiliateController.php:34
 * @route '/affiliates/register'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Vendor\AffiliateController::store
 * @see app/Http/Controllers/Vendor/AffiliateController.php:34
 * @route '/affiliates/register'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Vendor\AffiliateController::store
 * @see app/Http/Controllers/Vendor/AffiliateController.php:34
 * @route '/affiliates/register'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Vendor\AffiliateController::referrals
 * @see app/Http/Controllers/Vendor/AffiliateController.php:59
 * @route '/affiliates/referral'
 */
export const referrals = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: referrals.url(options),
    method: 'get',
})

referrals.definition = {
    methods: ["get","head"],
    url: '/affiliates/referral',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Vendor\AffiliateController::referrals
 * @see app/Http/Controllers/Vendor/AffiliateController.php:59
 * @route '/affiliates/referral'
 */
referrals.url = (options?: RouteQueryOptions) => {
    return referrals.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Vendor\AffiliateController::referrals
 * @see app/Http/Controllers/Vendor/AffiliateController.php:59
 * @route '/affiliates/referral'
 */
referrals.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: referrals.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Vendor\AffiliateController::referrals
 * @see app/Http/Controllers/Vendor/AffiliateController.php:59
 * @route '/affiliates/referral'
 */
referrals.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: referrals.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Vendor\AffiliateController::referrals
 * @see app/Http/Controllers/Vendor/AffiliateController.php:59
 * @route '/affiliates/referral'
 */
    const referralsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: referrals.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Vendor\AffiliateController::referrals
 * @see app/Http/Controllers/Vendor/AffiliateController.php:59
 * @route '/affiliates/referral'
 */
        referralsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: referrals.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Vendor\AffiliateController::referrals
 * @see app/Http/Controllers/Vendor/AffiliateController.php:59
 * @route '/affiliates/referral'
 */
        referralsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: referrals.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    referrals.form = referralsForm
/**
* @see \App\Http\Controllers\Vendor\PayoutController::payouts
 * @see app/Http/Controllers/Vendor/PayoutController.php:12
 * @route '/affiliates/payouts'
 */
export const payouts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payouts.url(options),
    method: 'get',
})

payouts.definition = {
    methods: ["get","head"],
    url: '/affiliates/payouts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Vendor\PayoutController::payouts
 * @see app/Http/Controllers/Vendor/PayoutController.php:12
 * @route '/affiliates/payouts'
 */
payouts.url = (options?: RouteQueryOptions) => {
    return payouts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Vendor\PayoutController::payouts
 * @see app/Http/Controllers/Vendor/PayoutController.php:12
 * @route '/affiliates/payouts'
 */
payouts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payouts.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Vendor\PayoutController::payouts
 * @see app/Http/Controllers/Vendor/PayoutController.php:12
 * @route '/affiliates/payouts'
 */
payouts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payouts.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Vendor\PayoutController::payouts
 * @see app/Http/Controllers/Vendor/PayoutController.php:12
 * @route '/affiliates/payouts'
 */
    const payoutsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payouts.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Vendor\PayoutController::payouts
 * @see app/Http/Controllers/Vendor/PayoutController.php:12
 * @route '/affiliates/payouts'
 */
        payoutsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payouts.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Vendor\PayoutController::payouts
 * @see app/Http/Controllers/Vendor/PayoutController.php:12
 * @route '/affiliates/payouts'
 */
        payoutsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payouts.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    payouts.form = payoutsForm
const affiliate = {
    dashboard: Object.assign(dashboard, dashboard),
register: Object.assign(register, register),
store: Object.assign(store, store),
referrals: Object.assign(referrals, referrals),
payouts: Object.assign(payouts, payouts),
payout: Object.assign(payout, payout),
}

export default affiliate