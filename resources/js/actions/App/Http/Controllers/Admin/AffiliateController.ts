import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
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
* @see \App\Http\Controllers\Admin\AffiliateController::payoutRequests
 * @see app/Http/Controllers/Admin/AffiliateController.php:39
 * @route '/admin/affiliates/payouts'
 */
export const payoutRequests = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payoutRequests.url(options),
    method: 'get',
})

payoutRequests.definition = {
    methods: ["get","head"],
    url: '/admin/affiliates/payouts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AffiliateController::payoutRequests
 * @see app/Http/Controllers/Admin/AffiliateController.php:39
 * @route '/admin/affiliates/payouts'
 */
payoutRequests.url = (options?: RouteQueryOptions) => {
    return payoutRequests.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AffiliateController::payoutRequests
 * @see app/Http/Controllers/Admin/AffiliateController.php:39
 * @route '/admin/affiliates/payouts'
 */
payoutRequests.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payoutRequests.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AffiliateController::payoutRequests
 * @see app/Http/Controllers/Admin/AffiliateController.php:39
 * @route '/admin/affiliates/payouts'
 */
payoutRequests.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payoutRequests.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AffiliateController::payoutRequests
 * @see app/Http/Controllers/Admin/AffiliateController.php:39
 * @route '/admin/affiliates/payouts'
 */
    const payoutRequestsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payoutRequests.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AffiliateController::payoutRequests
 * @see app/Http/Controllers/Admin/AffiliateController.php:39
 * @route '/admin/affiliates/payouts'
 */
        payoutRequestsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payoutRequests.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AffiliateController::payoutRequests
 * @see app/Http/Controllers/Admin/AffiliateController.php:39
 * @route '/admin/affiliates/payouts'
 */
        payoutRequestsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payoutRequests.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    payoutRequests.form = payoutRequestsForm
/**
* @see \App\Http\Controllers\Admin\AffiliateController::approvePayout
 * @see app/Http/Controllers/Admin/AffiliateController.php:64
 * @route '/admin/affiliates/payouts/{id}/approve'
 */
export const approvePayout = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approvePayout.url(args, options),
    method: 'post',
})

approvePayout.definition = {
    methods: ["post"],
    url: '/admin/affiliates/payouts/{id}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AffiliateController::approvePayout
 * @see app/Http/Controllers/Admin/AffiliateController.php:64
 * @route '/admin/affiliates/payouts/{id}/approve'
 */
approvePayout.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return approvePayout.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AffiliateController::approvePayout
 * @see app/Http/Controllers/Admin/AffiliateController.php:64
 * @route '/admin/affiliates/payouts/{id}/approve'
 */
approvePayout.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approvePayout.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AffiliateController::approvePayout
 * @see app/Http/Controllers/Admin/AffiliateController.php:64
 * @route '/admin/affiliates/payouts/{id}/approve'
 */
    const approvePayoutForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approvePayout.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AffiliateController::approvePayout
 * @see app/Http/Controllers/Admin/AffiliateController.php:64
 * @route '/admin/affiliates/payouts/{id}/approve'
 */
        approvePayoutForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approvePayout.url(args, options),
            method: 'post',
        })
    
    approvePayout.form = approvePayoutForm
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
/**
* @see \App\Http\Controllers\Admin\AffiliateController::updateSettings
 * @see app/Http/Controllers/Admin/AffiliateController.php:105
 * @route '/admin/affiliates/settings'
 */
export const updateSettings = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateSettings.url(options),
    method: 'post',
})

updateSettings.definition = {
    methods: ["post"],
    url: '/admin/affiliates/settings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AffiliateController::updateSettings
 * @see app/Http/Controllers/Admin/AffiliateController.php:105
 * @route '/admin/affiliates/settings'
 */
updateSettings.url = (options?: RouteQueryOptions) => {
    return updateSettings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AffiliateController::updateSettings
 * @see app/Http/Controllers/Admin/AffiliateController.php:105
 * @route '/admin/affiliates/settings'
 */
updateSettings.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateSettings.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AffiliateController::updateSettings
 * @see app/Http/Controllers/Admin/AffiliateController.php:105
 * @route '/admin/affiliates/settings'
 */
    const updateSettingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateSettings.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AffiliateController::updateSettings
 * @see app/Http/Controllers/Admin/AffiliateController.php:105
 * @route '/admin/affiliates/settings'
 */
        updateSettingsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateSettings.url(options),
            method: 'post',
        })
    
    updateSettings.form = updateSettingsForm
const AffiliateController = { index, payoutRequests, approvePayout, logs, settings, updateSettings }

export default AffiliateController