import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::index
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:27
 * @route '/admin/attributes'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/attributes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::index
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:27
 * @route '/admin/attributes'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::index
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:27
 * @route '/admin/attributes'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::index
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:27
 * @route '/admin/attributes'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::index
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:27
 * @route '/admin/attributes'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::index
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:27
 * @route '/admin/attributes'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::index
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:27
 * @route '/admin/attributes'
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
* @see \App\Http\Controllers\Admin\ProductAttributeController::create
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:82
 * @route '/admin/attributes/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/attributes/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::create
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:82
 * @route '/admin/attributes/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::create
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:82
 * @route '/admin/attributes/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::create
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:82
 * @route '/admin/attributes/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::create
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:82
 * @route '/admin/attributes/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::create
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:82
 * @route '/admin/attributes/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::create
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:82
 * @route '/admin/attributes/create'
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
* @see \App\Http\Controllers\Admin\ProductAttributeController::store
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:90
 * @route '/admin/attributes'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/attributes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::store
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:90
 * @route '/admin/attributes'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::store
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:90
 * @route '/admin/attributes'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::store
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:90
 * @route '/admin/attributes'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::store
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:90
 * @route '/admin/attributes'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::show
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:126
 * @route '/admin/attributes/{attribute}'
 */
export const show = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/attributes/{attribute}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::show
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:126
 * @route '/admin/attributes/{attribute}'
 */
show.url = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { attribute: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { attribute: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    attribute: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        attribute: typeof args.attribute === 'object'
                ? args.attribute.id
                : args.attribute,
                }

    return show.definition.url
            .replace('{attribute}', parsedArgs.attribute.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::show
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:126
 * @route '/admin/attributes/{attribute}'
 */
show.get = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::show
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:126
 * @route '/admin/attributes/{attribute}'
 */
show.head = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::show
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:126
 * @route '/admin/attributes/{attribute}'
 */
    const showForm = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::show
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:126
 * @route '/admin/attributes/{attribute}'
 */
        showForm.get = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::show
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:126
 * @route '/admin/attributes/{attribute}'
 */
        showForm.head = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\ProductAttributeController::edit
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:138
 * @route '/admin/attributes/{attribute}/edit'
 */
export const edit = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/attributes/{attribute}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::edit
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:138
 * @route '/admin/attributes/{attribute}/edit'
 */
edit.url = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { attribute: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { attribute: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    attribute: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        attribute: typeof args.attribute === 'object'
                ? args.attribute.id
                : args.attribute,
                }

    return edit.definition.url
            .replace('{attribute}', parsedArgs.attribute.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::edit
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:138
 * @route '/admin/attributes/{attribute}/edit'
 */
edit.get = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::edit
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:138
 * @route '/admin/attributes/{attribute}/edit'
 */
edit.head = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::edit
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:138
 * @route '/admin/attributes/{attribute}/edit'
 */
    const editForm = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::edit
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:138
 * @route '/admin/attributes/{attribute}/edit'
 */
        editForm.get = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::edit
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:138
 * @route '/admin/attributes/{attribute}/edit'
 */
        editForm.head = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\ProductAttributeController::update
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:148
 * @route '/admin/attributes/{attribute}'
 */
export const update = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admin/attributes/{attribute}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::update
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:148
 * @route '/admin/attributes/{attribute}'
 */
update.url = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { attribute: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { attribute: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    attribute: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        attribute: typeof args.attribute === 'object'
                ? args.attribute.id
                : args.attribute,
                }

    return update.definition.url
            .replace('{attribute}', parsedArgs.attribute.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::update
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:148
 * @route '/admin/attributes/{attribute}'
 */
update.put = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::update
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:148
 * @route '/admin/attributes/{attribute}'
 */
update.patch = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::update
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:148
 * @route '/admin/attributes/{attribute}'
 */
    const updateForm = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::update
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:148
 * @route '/admin/attributes/{attribute}'
 */
        updateForm.put = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::update
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:148
 * @route '/admin/attributes/{attribute}'
 */
        updateForm.patch = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\ProductAttributeController::destroy
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:186
 * @route '/admin/attributes/{attribute}'
 */
export const destroy = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/attributes/{attribute}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::destroy
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:186
 * @route '/admin/attributes/{attribute}'
 */
destroy.url = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { attribute: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { attribute: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    attribute: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        attribute: typeof args.attribute === 'object'
                ? args.attribute.id
                : args.attribute,
                }

    return destroy.definition.url
            .replace('{attribute}', parsedArgs.attribute.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::destroy
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:186
 * @route '/admin/attributes/{attribute}'
 */
destroy.delete = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::destroy
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:186
 * @route '/admin/attributes/{attribute}'
 */
    const destroyForm = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::destroy
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:186
 * @route '/admin/attributes/{attribute}'
 */
        destroyForm.delete = (args: { attribute: number | { id: number } } | [attribute: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\ProductAttributeController::getData
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:39
 * @route '/admin/attributes-data'
 */
export const getData = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getData.url(options),
    method: 'get',
})

getData.definition = {
    methods: ["get","head"],
    url: '/admin/attributes-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::getData
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:39
 * @route '/admin/attributes-data'
 */
getData.url = (options?: RouteQueryOptions) => {
    return getData.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::getData
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:39
 * @route '/admin/attributes-data'
 */
getData.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getData.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProductAttributeController::getData
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:39
 * @route '/admin/attributes-data'
 */
getData.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getData.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::getData
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:39
 * @route '/admin/attributes-data'
 */
    const getDataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getData.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::getData
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:39
 * @route '/admin/attributes-data'
 */
        getDataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getData.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProductAttributeController::getData
 * @see app/Http/Controllers/Admin/ProductAttributeController.php:39
 * @route '/admin/attributes-data'
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
const ProductAttributeController = { index, create, store, show, edit, update, destroy, getData }

export default ProductAttributeController