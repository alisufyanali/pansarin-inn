import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\FrontendContentController::index
 * @see app/Http/Controllers/Admin/FrontendContentController.php:22
 * @route '/admin/frontend'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/frontend',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::index
 * @see app/Http/Controllers/Admin/FrontendContentController.php:22
 * @route '/admin/frontend'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::index
 * @see app/Http/Controllers/Admin/FrontendContentController.php:22
 * @route '/admin/frontend'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\FrontendContentController::index
 * @see app/Http/Controllers/Admin/FrontendContentController.php:22
 * @route '/admin/frontend'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\FrontendContentController::index
 * @see app/Http/Controllers/Admin/FrontendContentController.php:22
 * @route '/admin/frontend'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\FrontendContentController::index
 * @see app/Http/Controllers/Admin/FrontendContentController.php:22
 * @route '/admin/frontend'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\FrontendContentController::index
 * @see app/Http/Controllers/Admin/FrontendContentController.php:22
 * @route '/admin/frontend'
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
* @see \App\Http\Controllers\Admin\FrontendContentController::create
 * @see app/Http/Controllers/Admin/FrontendContentController.php:73
 * @route '/admin/frontend/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/frontend/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::create
 * @see app/Http/Controllers/Admin/FrontendContentController.php:73
 * @route '/admin/frontend/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::create
 * @see app/Http/Controllers/Admin/FrontendContentController.php:73
 * @route '/admin/frontend/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\FrontendContentController::create
 * @see app/Http/Controllers/Admin/FrontendContentController.php:73
 * @route '/admin/frontend/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\FrontendContentController::create
 * @see app/Http/Controllers/Admin/FrontendContentController.php:73
 * @route '/admin/frontend/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\FrontendContentController::create
 * @see app/Http/Controllers/Admin/FrontendContentController.php:73
 * @route '/admin/frontend/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\FrontendContentController::create
 * @see app/Http/Controllers/Admin/FrontendContentController.php:73
 * @route '/admin/frontend/create'
 */
        createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
/**
* @see \App\Http\Controllers\Admin\FrontendContentController::store
 * @see app/Http/Controllers/Admin/FrontendContentController.php:78
 * @route '/admin/frontend'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/frontend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::store
 * @see app/Http/Controllers/Admin/FrontendContentController.php:78
 * @route '/admin/frontend'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::store
 * @see app/Http/Controllers/Admin/FrontendContentController.php:78
 * @route '/admin/frontend'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\FrontendContentController::store
 * @see app/Http/Controllers/Admin/FrontendContentController.php:78
 * @route '/admin/frontend'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\FrontendContentController::store
 * @see app/Http/Controllers/Admin/FrontendContentController.php:78
 * @route '/admin/frontend'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\FrontendContentController::show
 * @see app/Http/Controllers/Admin/FrontendContentController.php:118
 * @route '/admin/frontend/{frontend}'
 */
export const show = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/frontend/{frontend}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::show
 * @see app/Http/Controllers/Admin/FrontendContentController.php:118
 * @route '/admin/frontend/{frontend}'
 */
show.url = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { frontend: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { frontend: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    frontend: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        frontend: typeof args.frontend === 'object'
                ? args.frontend.id
                : args.frontend,
                }

    return show.definition.url
            .replace('{frontend}', parsedArgs.frontend.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::show
 * @see app/Http/Controllers/Admin/FrontendContentController.php:118
 * @route '/admin/frontend/{frontend}'
 */
show.get = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\FrontendContentController::show
 * @see app/Http/Controllers/Admin/FrontendContentController.php:118
 * @route '/admin/frontend/{frontend}'
 */
show.head = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\FrontendContentController::show
 * @see app/Http/Controllers/Admin/FrontendContentController.php:118
 * @route '/admin/frontend/{frontend}'
 */
    const showForm = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\FrontendContentController::show
 * @see app/Http/Controllers/Admin/FrontendContentController.php:118
 * @route '/admin/frontend/{frontend}'
 */
        showForm.get = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\FrontendContentController::show
 * @see app/Http/Controllers/Admin/FrontendContentController.php:118
 * @route '/admin/frontend/{frontend}'
 */
        showForm.head = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\Admin\FrontendContentController::edit
 * @see app/Http/Controllers/Admin/FrontendContentController.php:125
 * @route '/admin/frontend/{frontend}/edit'
 */
export const edit = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/frontend/{frontend}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::edit
 * @see app/Http/Controllers/Admin/FrontendContentController.php:125
 * @route '/admin/frontend/{frontend}/edit'
 */
edit.url = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { frontend: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { frontend: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    frontend: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        frontend: typeof args.frontend === 'object'
                ? args.frontend.id
                : args.frontend,
                }

    return edit.definition.url
            .replace('{frontend}', parsedArgs.frontend.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::edit
 * @see app/Http/Controllers/Admin/FrontendContentController.php:125
 * @route '/admin/frontend/{frontend}/edit'
 */
edit.get = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\FrontendContentController::edit
 * @see app/Http/Controllers/Admin/FrontendContentController.php:125
 * @route '/admin/frontend/{frontend}/edit'
 */
edit.head = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\FrontendContentController::edit
 * @see app/Http/Controllers/Admin/FrontendContentController.php:125
 * @route '/admin/frontend/{frontend}/edit'
 */
    const editForm = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\FrontendContentController::edit
 * @see app/Http/Controllers/Admin/FrontendContentController.php:125
 * @route '/admin/frontend/{frontend}/edit'
 */
        editForm.get = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\FrontendContentController::edit
 * @see app/Http/Controllers/Admin/FrontendContentController.php:125
 * @route '/admin/frontend/{frontend}/edit'
 */
        editForm.head = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
/**
* @see \App\Http\Controllers\Admin\FrontendContentController::update
 * @see app/Http/Controllers/Admin/FrontendContentController.php:132
 * @route '/admin/frontend/{frontend}'
 */
export const update = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admin/frontend/{frontend}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::update
 * @see app/Http/Controllers/Admin/FrontendContentController.php:132
 * @route '/admin/frontend/{frontend}'
 */
update.url = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { frontend: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { frontend: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    frontend: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        frontend: typeof args.frontend === 'object'
                ? args.frontend.id
                : args.frontend,
                }

    return update.definition.url
            .replace('{frontend}', parsedArgs.frontend.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::update
 * @see app/Http/Controllers/Admin/FrontendContentController.php:132
 * @route '/admin/frontend/{frontend}'
 */
update.put = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Admin\FrontendContentController::update
 * @see app/Http/Controllers/Admin/FrontendContentController.php:132
 * @route '/admin/frontend/{frontend}'
 */
update.patch = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Admin\FrontendContentController::update
 * @see app/Http/Controllers/Admin/FrontendContentController.php:132
 * @route '/admin/frontend/{frontend}'
 */
    const updateForm = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\FrontendContentController::update
 * @see app/Http/Controllers/Admin/FrontendContentController.php:132
 * @route '/admin/frontend/{frontend}'
 */
        updateForm.put = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Admin\FrontendContentController::update
 * @see app/Http/Controllers/Admin/FrontendContentController.php:132
 * @route '/admin/frontend/{frontend}'
 */
        updateForm.patch = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\Admin\FrontendContentController::destroy
 * @see app/Http/Controllers/Admin/FrontendContentController.php:172
 * @route '/admin/frontend/{frontend}'
 */
export const destroy = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/frontend/{frontend}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::destroy
 * @see app/Http/Controllers/Admin/FrontendContentController.php:172
 * @route '/admin/frontend/{frontend}'
 */
destroy.url = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { frontend: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { frontend: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    frontend: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        frontend: typeof args.frontend === 'object'
                ? args.frontend.id
                : args.frontend,
                }

    return destroy.definition.url
            .replace('{frontend}', parsedArgs.frontend.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::destroy
 * @see app/Http/Controllers/Admin/FrontendContentController.php:172
 * @route '/admin/frontend/{frontend}'
 */
destroy.delete = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\FrontendContentController::destroy
 * @see app/Http/Controllers/Admin/FrontendContentController.php:172
 * @route '/admin/frontend/{frontend}'
 */
    const destroyForm = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\FrontendContentController::destroy
 * @see app/Http/Controllers/Admin/FrontendContentController.php:172
 * @route '/admin/frontend/{frontend}'
 */
        destroyForm.delete = (args: { frontend: number | { id: number } } | [frontend: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\Admin\FrontendContentController::getData
 * @see app/Http/Controllers/Admin/FrontendContentController.php:38
 * @route '/admin/frontend-data'
 */
export const getData = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getData.url(options),
    method: 'get',
})

getData.definition = {
    methods: ["get","head"],
    url: '/admin/frontend-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::getData
 * @see app/Http/Controllers/Admin/FrontendContentController.php:38
 * @route '/admin/frontend-data'
 */
getData.url = (options?: RouteQueryOptions) => {
    return getData.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FrontendContentController::getData
 * @see app/Http/Controllers/Admin/FrontendContentController.php:38
 * @route '/admin/frontend-data'
 */
getData.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getData.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\FrontendContentController::getData
 * @see app/Http/Controllers/Admin/FrontendContentController.php:38
 * @route '/admin/frontend-data'
 */
getData.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getData.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\FrontendContentController::getData
 * @see app/Http/Controllers/Admin/FrontendContentController.php:38
 * @route '/admin/frontend-data'
 */
    const getDataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getData.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\FrontendContentController::getData
 * @see app/Http/Controllers/Admin/FrontendContentController.php:38
 * @route '/admin/frontend-data'
 */
        getDataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getData.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\FrontendContentController::getData
 * @see app/Http/Controllers/Admin/FrontendContentController.php:38
 * @route '/admin/frontend-data'
 */
        getDataForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getData.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getData.form = getDataForm
const FrontendContentController = { index, create, store, show, edit, update, destroy, getData }

export default FrontendContentController