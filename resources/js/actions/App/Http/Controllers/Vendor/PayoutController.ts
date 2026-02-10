import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Vendor\PayoutController::index
 * @see app/Http/Controllers/Vendor/PayoutController.php:12
 * @route '/affiliates/payouts'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/affiliates/payouts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Vendor\PayoutController::index
 * @see app/Http/Controllers/Vendor/PayoutController.php:12
 * @route '/affiliates/payouts'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Vendor\PayoutController::index
 * @see app/Http/Controllers/Vendor/PayoutController.php:12
 * @route '/affiliates/payouts'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Vendor\PayoutController::index
 * @see app/Http/Controllers/Vendor/PayoutController.php:12
 * @route '/affiliates/payouts'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Vendor\PayoutController::index
 * @see app/Http/Controllers/Vendor/PayoutController.php:12
 * @route '/affiliates/payouts'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Vendor\PayoutController::index
 * @see app/Http/Controllers/Vendor/PayoutController.php:12
 * @route '/affiliates/payouts'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Vendor\PayoutController::index
 * @see app/Http/Controllers/Vendor/PayoutController.php:12
 * @route '/affiliates/payouts'
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
* @see \App\Http\Controllers\Vendor\PayoutController::store
 * @see app/Http/Controllers/Vendor/PayoutController.php:33
 * @route '/affiliates/payout-request'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/affiliates/payout-request',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Vendor\PayoutController::store
 * @see app/Http/Controllers/Vendor/PayoutController.php:33
 * @route '/affiliates/payout-request'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Vendor\PayoutController::store
 * @see app/Http/Controllers/Vendor/PayoutController.php:33
 * @route '/affiliates/payout-request'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Vendor\PayoutController::store
 * @see app/Http/Controllers/Vendor/PayoutController.php:33
 * @route '/affiliates/payout-request'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Vendor\PayoutController::store
 * @see app/Http/Controllers/Vendor/PayoutController.php:33
 * @route '/affiliates/payout-request'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
const PayoutController = { index, store }

export default PayoutController