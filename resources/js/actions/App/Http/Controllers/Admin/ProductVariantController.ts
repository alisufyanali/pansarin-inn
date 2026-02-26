import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ProductVariantController::index
 * @see app/Http/Controllers/Admin/ProductVariantController.php:25
 * @route '/admin/product-variants'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/product-variants',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::index
 * @see app/Http/Controllers/Admin/ProductVariantController.php:25
 * @route '/admin/product-variants'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::index
 * @see app/Http/Controllers/Admin/ProductVariantController.php:25
 * @route '/admin/product-variants'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProductVariantController::index
 * @see app/Http/Controllers/Admin/ProductVariantController.php:25
 * @route '/admin/product-variants'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProductVariantController::index
 * @see app/Http/Controllers/Admin/ProductVariantController.php:25
 * @route '/admin/product-variants'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductVariantController::index
 * @see app/Http/Controllers/Admin/ProductVariantController.php:25
 * @route '/admin/product-variants'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProductVariantController::index
 * @see app/Http/Controllers/Admin/ProductVariantController.php:25
 * @route '/admin/product-variants'
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
* @see \App\Http\Controllers\Admin\ProductVariantController::create
 * @see app/Http/Controllers/Admin/ProductVariantController.php:107
 * @route '/admin/product-variants/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/product-variants/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::create
 * @see app/Http/Controllers/Admin/ProductVariantController.php:107
 * @route '/admin/product-variants/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::create
 * @see app/Http/Controllers/Admin/ProductVariantController.php:107
 * @route '/admin/product-variants/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProductVariantController::create
 * @see app/Http/Controllers/Admin/ProductVariantController.php:107
 * @route '/admin/product-variants/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProductVariantController::create
 * @see app/Http/Controllers/Admin/ProductVariantController.php:107
 * @route '/admin/product-variants/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductVariantController::create
 * @see app/Http/Controllers/Admin/ProductVariantController.php:107
 * @route '/admin/product-variants/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProductVariantController::create
 * @see app/Http/Controllers/Admin/ProductVariantController.php:107
 * @route '/admin/product-variants/create'
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
* @see \App\Http\Controllers\Admin\ProductVariantController::store
 * @see app/Http/Controllers/Admin/ProductVariantController.php:118
 * @route '/admin/product-variants'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/product-variants',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::store
 * @see app/Http/Controllers/Admin/ProductVariantController.php:118
 * @route '/admin/product-variants'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::store
 * @see app/Http/Controllers/Admin/ProductVariantController.php:118
 * @route '/admin/product-variants'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ProductVariantController::store
 * @see app/Http/Controllers/Admin/ProductVariantController.php:118
 * @route '/admin/product-variants'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductVariantController::store
 * @see app/Http/Controllers/Admin/ProductVariantController.php:118
 * @route '/admin/product-variants'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\ProductVariantController::show
 * @see app/Http/Controllers/Admin/ProductVariantController.php:183
 * @route '/admin/product-variants/{product_variant}'
 */
export const show = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/product-variants/{product_variant}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::show
 * @see app/Http/Controllers/Admin/ProductVariantController.php:183
 * @route '/admin/product-variants/{product_variant}'
 */
show.url = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { product_variant: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    product_variant: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        product_variant: args.product_variant,
                }

    return show.definition.url
            .replace('{product_variant}', parsedArgs.product_variant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::show
 * @see app/Http/Controllers/Admin/ProductVariantController.php:183
 * @route '/admin/product-variants/{product_variant}'
 */
show.get = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProductVariantController::show
 * @see app/Http/Controllers/Admin/ProductVariantController.php:183
 * @route '/admin/product-variants/{product_variant}'
 */
show.head = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProductVariantController::show
 * @see app/Http/Controllers/Admin/ProductVariantController.php:183
 * @route '/admin/product-variants/{product_variant}'
 */
    const showForm = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductVariantController::show
 * @see app/Http/Controllers/Admin/ProductVariantController.php:183
 * @route '/admin/product-variants/{product_variant}'
 */
        showForm.get = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProductVariantController::show
 * @see app/Http/Controllers/Admin/ProductVariantController.php:183
 * @route '/admin/product-variants/{product_variant}'
 */
        showForm.head = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\ProductVariantController::edit
 * @see app/Http/Controllers/Admin/ProductVariantController.php:164
 * @route '/admin/product-variants/{product_variant}/edit'
 */
export const edit = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/product-variants/{product_variant}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::edit
 * @see app/Http/Controllers/Admin/ProductVariantController.php:164
 * @route '/admin/product-variants/{product_variant}/edit'
 */
edit.url = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { product_variant: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    product_variant: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        product_variant: args.product_variant,
                }

    return edit.definition.url
            .replace('{product_variant}', parsedArgs.product_variant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::edit
 * @see app/Http/Controllers/Admin/ProductVariantController.php:164
 * @route '/admin/product-variants/{product_variant}/edit'
 */
edit.get = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProductVariantController::edit
 * @see app/Http/Controllers/Admin/ProductVariantController.php:164
 * @route '/admin/product-variants/{product_variant}/edit'
 */
edit.head = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProductVariantController::edit
 * @see app/Http/Controllers/Admin/ProductVariantController.php:164
 * @route '/admin/product-variants/{product_variant}/edit'
 */
    const editForm = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductVariantController::edit
 * @see app/Http/Controllers/Admin/ProductVariantController.php:164
 * @route '/admin/product-variants/{product_variant}/edit'
 */
        editForm.get = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProductVariantController::edit
 * @see app/Http/Controllers/Admin/ProductVariantController.php:164
 * @route '/admin/product-variants/{product_variant}/edit'
 */
        editForm.head = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\ProductVariantController::update
 * @see app/Http/Controllers/Admin/ProductVariantController.php:140
 * @route '/admin/product-variants/{product_variant}'
 */
export const update = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admin/product-variants/{product_variant}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::update
 * @see app/Http/Controllers/Admin/ProductVariantController.php:140
 * @route '/admin/product-variants/{product_variant}'
 */
update.url = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { product_variant: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    product_variant: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        product_variant: args.product_variant,
                }

    return update.definition.url
            .replace('{product_variant}', parsedArgs.product_variant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::update
 * @see app/Http/Controllers/Admin/ProductVariantController.php:140
 * @route '/admin/product-variants/{product_variant}'
 */
update.put = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Admin\ProductVariantController::update
 * @see app/Http/Controllers/Admin/ProductVariantController.php:140
 * @route '/admin/product-variants/{product_variant}'
 */
update.patch = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Admin\ProductVariantController::update
 * @see app/Http/Controllers/Admin/ProductVariantController.php:140
 * @route '/admin/product-variants/{product_variant}'
 */
    const updateForm = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductVariantController::update
 * @see app/Http/Controllers/Admin/ProductVariantController.php:140
 * @route '/admin/product-variants/{product_variant}'
 */
        updateForm.put = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Admin\ProductVariantController::update
 * @see app/Http/Controllers/Admin/ProductVariantController.php:140
 * @route '/admin/product-variants/{product_variant}'
 */
        updateForm.patch = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\ProductVariantController::destroy
 * @see app/Http/Controllers/Admin/ProductVariantController.php:200
 * @route '/admin/product-variants/{product_variant}'
 */
export const destroy = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/product-variants/{product_variant}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::destroy
 * @see app/Http/Controllers/Admin/ProductVariantController.php:200
 * @route '/admin/product-variants/{product_variant}'
 */
destroy.url = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { product_variant: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    product_variant: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        product_variant: args.product_variant,
                }

    return destroy.definition.url
            .replace('{product_variant}', parsedArgs.product_variant.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::destroy
 * @see app/Http/Controllers/Admin/ProductVariantController.php:200
 * @route '/admin/product-variants/{product_variant}'
 */
destroy.delete = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\ProductVariantController::destroy
 * @see app/Http/Controllers/Admin/ProductVariantController.php:200
 * @route '/admin/product-variants/{product_variant}'
 */
    const destroyForm = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductVariantController::destroy
 * @see app/Http/Controllers/Admin/ProductVariantController.php:200
 * @route '/admin/product-variants/{product_variant}'
 */
        destroyForm.delete = (args: { product_variant: string | number } | [product_variant: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\ProductVariantController::getData
 * @see app/Http/Controllers/Admin/ProductVariantController.php:35
 * @route '/admin/product-variants-data'
 */
export const getData = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getData.url(options),
    method: 'get',
})

getData.definition = {
    methods: ["get","head"],
    url: '/admin/product-variants-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::getData
 * @see app/Http/Controllers/Admin/ProductVariantController.php:35
 * @route '/admin/product-variants-data'
 */
getData.url = (options?: RouteQueryOptions) => {
    return getData.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProductVariantController::getData
 * @see app/Http/Controllers/Admin/ProductVariantController.php:35
 * @route '/admin/product-variants-data'
 */
getData.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getData.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProductVariantController::getData
 * @see app/Http/Controllers/Admin/ProductVariantController.php:35
 * @route '/admin/product-variants-data'
 */
getData.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getData.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProductVariantController::getData
 * @see app/Http/Controllers/Admin/ProductVariantController.php:35
 * @route '/admin/product-variants-data'
 */
    const getDataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getData.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProductVariantController::getData
 * @see app/Http/Controllers/Admin/ProductVariantController.php:35
 * @route '/admin/product-variants-data'
 */
        getDataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getData.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProductVariantController::getData
 * @see app/Http/Controllers/Admin/ProductVariantController.php:35
 * @route '/admin/product-variants-data'
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
const ProductVariantController = { index, create, store, show, edit, update, destroy, getData }

export default ProductVariantController