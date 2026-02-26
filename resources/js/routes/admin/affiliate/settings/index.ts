import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AffiliateController::update
 * @see app/Http/Controllers/Admin/AffiliateController.php:105
 * @route '/admin/affiliates/settings'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/admin/affiliates/settings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AffiliateController::update
 * @see app/Http/Controllers/Admin/AffiliateController.php:105
 * @route '/admin/affiliates/settings'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AffiliateController::update
 * @see app/Http/Controllers/Admin/AffiliateController.php:105
 * @route '/admin/affiliates/settings'
 */
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AffiliateController::update
 * @see app/Http/Controllers/Admin/AffiliateController.php:105
 * @route '/admin/affiliates/settings'
 */
    const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AffiliateController::update
 * @see app/Http/Controllers/Admin/AffiliateController.php:105
 * @route '/admin/affiliates/settings'
 */
        updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(options),
            method: 'post',
        })
    
    update.form = updateForm
const settings = {
    update: Object.assign(update, update),
}

export default settings