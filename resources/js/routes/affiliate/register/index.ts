import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
 * @see routes/affiliate.php:17
 * @route '/affiliates/registration'
 */
export const view = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(options),
    method: 'get',
})

view.definition = {
    methods: ["get","head"],
    url: '/affiliates/registration',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/affiliate.php:17
 * @route '/affiliates/registration'
 */
view.url = (options?: RouteQueryOptions) => {
    return view.definition.url + queryParams(options)
}

/**
 * @see routes/affiliate.php:17
 * @route '/affiliates/registration'
 */
view.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(options),
    method: 'get',
})
/**
 * @see routes/affiliate.php:17
 * @route '/affiliates/registration'
 */
view.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: view.url(options),
    method: 'head',
})

    /**
 * @see routes/affiliate.php:17
 * @route '/affiliates/registration'
 */
    const viewForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: view.url(options),
        method: 'get',
    })

            /**
 * @see routes/affiliate.php:17
 * @route '/affiliates/registration'
 */
        viewForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: view.url(options),
            method: 'get',
        })
            /**
 * @see routes/affiliate.php:17
 * @route '/affiliates/registration'
 */
        viewForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: view.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    view.form = viewForm
const register = {
    view: Object.assign(view, view),
}

export default register