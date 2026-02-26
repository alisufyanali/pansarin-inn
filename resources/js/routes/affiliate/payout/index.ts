import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
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
const payout = {
    store: Object.assign(store, store),
}

export default payout