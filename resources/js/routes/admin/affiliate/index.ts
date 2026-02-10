import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import payout from './payout'
import settings69f00b from './settings'
/**
* @see \App\Http\Controllers\Admin\AffiliateController::index
 * @see app/Http/Controllers/Admin/AffiliateController.php:29
 * @route '/admin/affiliates'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/affiliates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AffiliateController::index
 * @see app/Http/Controllers/Admin/AffiliateController.php:29
 * @route '/admin/affiliates'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AffiliateController::index
 * @see app/Http/Controllers/Admin/AffiliateController.php:29
 * @route '/admin/affiliates'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AffiliateController::index
 * @see app/Http/Controllers/Admin/AffiliateController.php:29
 * @route '/admin/affiliates'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AffiliateController::index
 * @see app/Http/Controllers/Admin/AffiliateController.php:29
 * @route '/admin/affiliates'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AffiliateController::index
 * @see app/Http/Controllers/Admin/AffiliateController.php:29
 * @route '/admin/affiliates'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AffiliateController::index
 * @see app/Http/Controllers/Admin/AffiliateController.php:29
 * @route '/admin/affiliates'
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
* @see \App\Http\Controllers\Admin\AffiliateController::payouts
 * @see app/Http/Controllers/Admin/AffiliateController.php:39
 * @route '/admin/affiliates/payouts'
 */
export const payouts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payouts.url(options),
    method: 'get',
})

payouts.definition = {
    methods: ["get","head"],
    url: '/admin/affiliates/payouts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AffiliateController::payouts
 * @see app/Http/Controllers/Admin/AffiliateController.php:39
 * @route '/admin/affiliates/payouts'
 */
payouts.url = (options?: RouteQueryOptions) => {
    return payouts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AffiliateController::payouts
 * @see app/Http/Controllers/Admin/AffiliateController.php:39
 * @route '/admin/affiliates/payouts'
 */
payouts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payouts.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AffiliateController::payouts
 * @see app/Http/Controllers/Admin/AffiliateController.php:39
 * @route '/admin/affiliates/payouts'
 */
payouts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payouts.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AffiliateController::payouts
 * @see app/Http/Controllers/Admin/AffiliateController.php:39
 * @route '/admin/affiliates/payouts'
 */
    const payoutsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payouts.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AffiliateController::payouts
 * @see app/Http/Controllers/Admin/AffiliateController.php:39
 * @route '/admin/affiliates/payouts'
 */
        payoutsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payouts.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AffiliateController::payouts
 * @see app/Http/Controllers/Admin/AffiliateController.php:39
 * @route '/admin/affiliates/payouts'
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
/**
* @see \App\Http\Controllers\Admin\AffiliateController::logs
 * @see app/Http/Controllers/Admin/AffiliateController.php:52
 * @route '/admin/affiliates/logs'
 */
export const logs = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logs.url(options),
    method: 'get',
})

logs.definition = {
    methods: ["get","head"],
    url: '/admin/affiliates/logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AffiliateController::logs
 * @see app/Http/Controllers/Admin/AffiliateController.php:52
 * @route '/admin/affiliates/logs'
 */
logs.url = (options?: RouteQueryOptions) => {
    return logs.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AffiliateController::logs
 * @see app/Http/Controllers/Admin/AffiliateController.php:52
 * @route '/admin/affiliates/logs'
 */
logs.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logs.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AffiliateController::logs
 * @see app/Http/Controllers/Admin/AffiliateController.php:52
 * @route '/admin/affiliates/logs'
 */
logs.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: logs.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AffiliateController::logs
 * @see app/Http/Controllers/Admin/AffiliateController.php:52
 * @route '/admin/affiliates/logs'
 */
    const logsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: logs.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AffiliateController::logs
 * @see app/Http/Controllers/Admin/AffiliateController.php:52
 * @route '/admin/affiliates/logs'
 */
        logsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: logs.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AffiliateController::logs
 * @see app/Http/Controllers/Admin/AffiliateController.php:52
 * @route '/admin/affiliates/logs'
 */
        logsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: logs.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    logs.form = logsForm
/**
* @see \App\Http\Controllers\Admin\AffiliateController::settings
 * @see app/Http/Controllers/Admin/AffiliateController.php:95
 * @route '/admin/affiliates/settings'
 */
export const settings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})

settings.definition = {
    methods: ["get","head"],
    url: '/admin/affiliates/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AffiliateController::settings
 * @see app/Http/Controllers/Admin/AffiliateController.php:95
 * @route '/admin/affiliates/settings'
 */
settings.url = (options?: RouteQueryOptions) => {
    return settings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AffiliateController::settings
 * @see app/Http/Controllers/Admin/AffiliateController.php:95
 * @route '/admin/affiliates/settings'
 */
settings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AffiliateController::settings
 * @see app/Http/Controllers/Admin/AffiliateController.php:95
 * @route '/admin/affiliates/settings'
 */
settings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: settings.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AffiliateController::settings
 * @see app/Http/Controllers/Admin/AffiliateController.php:95
 * @route '/admin/affiliates/settings'
 */
    const settingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: settings.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AffiliateController::settings
 * @see app/Http/Controllers/Admin/AffiliateController.php:95
 * @route '/admin/affiliates/settings'
 */
        settingsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: settings.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AffiliateController::settings
 * @see app/Http/Controllers/Admin/AffiliateController.php:95
 * @route '/admin/affiliates/settings'
 */
        settingsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: settings.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    settings.form = settingsForm
const affiliate = {
    index: Object.assign(index, index),
payouts: Object.assign(payouts, payouts),
payout: Object.assign(payout, payout),
logs: Object.assign(logs, logs),
settings: Object.assign(settings, settings69f00b),
}

export default affiliate