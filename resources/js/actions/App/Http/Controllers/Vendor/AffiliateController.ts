import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Vendor\AffiliateController::index
 * @see app/Http/Controllers/Vendor/AffiliateController.php:15
 * @route '/affiliates/dashboard'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/affiliates/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Vendor\AffiliateController::index
 * @see app/Http/Controllers/Vendor/AffiliateController.php:15
 * @route '/affiliates/dashboard'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Vendor\AffiliateController::index
 * @see app/Http/Controllers/Vendor/AffiliateController.php:15
 * @route '/affiliates/dashboard'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Vendor\AffiliateController::index
 * @see app/Http/Controllers/Vendor/AffiliateController.php:15
 * @route '/affiliates/dashboard'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Vendor\AffiliateController::index
 * @see app/Http/Controllers/Vendor/AffiliateController.php:15
 * @route '/affiliates/dashboard'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Vendor\AffiliateController::index
 * @see app/Http/Controllers/Vendor/AffiliateController.php:15
 * @route '/affiliates/dashboard'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Vendor\AffiliateController::index
 * @see app/Http/Controllers/Vendor/AffiliateController.php:15
 * @route '/affiliates/dashboard'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
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
const AffiliateController = { index, store, referrals }

export default AffiliateController