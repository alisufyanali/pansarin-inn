import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\InventoryController::index
 * @see app/Http/Controllers/Admin/InventoryController.php:24
 * @route '/admin/inventory'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/inventory',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::index
 * @see app/Http/Controllers/Admin/InventoryController.php:24
 * @route '/admin/inventory'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::index
 * @see app/Http/Controllers/Admin/InventoryController.php:24
 * @route '/admin/inventory'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\InventoryController::index
 * @see app/Http/Controllers/Admin/InventoryController.php:24
 * @route '/admin/inventory'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\InventoryController::index
 * @see app/Http/Controllers/Admin/InventoryController.php:24
 * @route '/admin/inventory'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\InventoryController::index
 * @see app/Http/Controllers/Admin/InventoryController.php:24
 * @route '/admin/inventory'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\InventoryController::index
 * @see app/Http/Controllers/Admin/InventoryController.php:24
 * @route '/admin/inventory'
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
* @see \App\Http\Controllers\Admin\InventoryController::create
 * @see app/Http/Controllers/Admin/InventoryController.php:107
 * @route '/admin/inventory/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/inventory/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::create
 * @see app/Http/Controllers/Admin/InventoryController.php:107
 * @route '/admin/inventory/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::create
 * @see app/Http/Controllers/Admin/InventoryController.php:107
 * @route '/admin/inventory/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\InventoryController::create
 * @see app/Http/Controllers/Admin/InventoryController.php:107
 * @route '/admin/inventory/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\InventoryController::create
 * @see app/Http/Controllers/Admin/InventoryController.php:107
 * @route '/admin/inventory/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\InventoryController::create
 * @see app/Http/Controllers/Admin/InventoryController.php:107
 * @route '/admin/inventory/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\InventoryController::create
 * @see app/Http/Controllers/Admin/InventoryController.php:107
 * @route '/admin/inventory/create'
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
* @see \App\Http\Controllers\Admin\InventoryController::store
 * @see app/Http/Controllers/Admin/InventoryController.php:140
 * @route '/admin/inventory'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/inventory',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::store
 * @see app/Http/Controllers/Admin/InventoryController.php:140
 * @route '/admin/inventory'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::store
 * @see app/Http/Controllers/Admin/InventoryController.php:140
 * @route '/admin/inventory'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\InventoryController::store
 * @see app/Http/Controllers/Admin/InventoryController.php:140
 * @route '/admin/inventory'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\InventoryController::store
 * @see app/Http/Controllers/Admin/InventoryController.php:140
 * @route '/admin/inventory'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\InventoryController::show
 * @see app/Http/Controllers/Admin/InventoryController.php:183
 * @route '/admin/inventory/{inventory}'
 */
export const show = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/inventory/{inventory}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::show
 * @see app/Http/Controllers/Admin/InventoryController.php:183
 * @route '/admin/inventory/{inventory}'
 */
show.url = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { inventory: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    inventory: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        inventory: args.inventory,
                }

    return show.definition.url
            .replace('{inventory}', parsedArgs.inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::show
 * @see app/Http/Controllers/Admin/InventoryController.php:183
 * @route '/admin/inventory/{inventory}'
 */
show.get = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\InventoryController::show
 * @see app/Http/Controllers/Admin/InventoryController.php:183
 * @route '/admin/inventory/{inventory}'
 */
show.head = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\InventoryController::show
 * @see app/Http/Controllers/Admin/InventoryController.php:183
 * @route '/admin/inventory/{inventory}'
 */
    const showForm = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\InventoryController::show
 * @see app/Http/Controllers/Admin/InventoryController.php:183
 * @route '/admin/inventory/{inventory}'
 */
        showForm.get = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\InventoryController::show
 * @see app/Http/Controllers/Admin/InventoryController.php:183
 * @route '/admin/inventory/{inventory}'
 */
        showForm.head = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\InventoryController::edit
 * @see app/Http/Controllers/Admin/InventoryController.php:195
 * @route '/admin/inventory/{inventory}/edit'
 */
export const edit = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/inventory/{inventory}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::edit
 * @see app/Http/Controllers/Admin/InventoryController.php:195
 * @route '/admin/inventory/{inventory}/edit'
 */
edit.url = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { inventory: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    inventory: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        inventory: args.inventory,
                }

    return edit.definition.url
            .replace('{inventory}', parsedArgs.inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::edit
 * @see app/Http/Controllers/Admin/InventoryController.php:195
 * @route '/admin/inventory/{inventory}/edit'
 */
edit.get = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\InventoryController::edit
 * @see app/Http/Controllers/Admin/InventoryController.php:195
 * @route '/admin/inventory/{inventory}/edit'
 */
edit.head = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\InventoryController::edit
 * @see app/Http/Controllers/Admin/InventoryController.php:195
 * @route '/admin/inventory/{inventory}/edit'
 */
    const editForm = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\InventoryController::edit
 * @see app/Http/Controllers/Admin/InventoryController.php:195
 * @route '/admin/inventory/{inventory}/edit'
 */
        editForm.get = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\InventoryController::edit
 * @see app/Http/Controllers/Admin/InventoryController.php:195
 * @route '/admin/inventory/{inventory}/edit'
 */
        editForm.head = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\InventoryController::update
 * @see app/Http/Controllers/Admin/InventoryController.php:238
 * @route '/admin/inventory/{inventory}'
 */
export const update = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admin/inventory/{inventory}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::update
 * @see app/Http/Controllers/Admin/InventoryController.php:238
 * @route '/admin/inventory/{inventory}'
 */
update.url = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { inventory: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    inventory: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        inventory: args.inventory,
                }

    return update.definition.url
            .replace('{inventory}', parsedArgs.inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::update
 * @see app/Http/Controllers/Admin/InventoryController.php:238
 * @route '/admin/inventory/{inventory}'
 */
update.put = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Admin\InventoryController::update
 * @see app/Http/Controllers/Admin/InventoryController.php:238
 * @route '/admin/inventory/{inventory}'
 */
update.patch = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Admin\InventoryController::update
 * @see app/Http/Controllers/Admin/InventoryController.php:238
 * @route '/admin/inventory/{inventory}'
 */
    const updateForm = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\InventoryController::update
 * @see app/Http/Controllers/Admin/InventoryController.php:238
 * @route '/admin/inventory/{inventory}'
 */
        updateForm.put = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Admin\InventoryController::update
 * @see app/Http/Controllers/Admin/InventoryController.php:238
 * @route '/admin/inventory/{inventory}'
 */
        updateForm.patch = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\InventoryController::destroy
 * @see app/Http/Controllers/Admin/InventoryController.php:282
 * @route '/admin/inventory/{inventory}'
 */
export const destroy = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/inventory/{inventory}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::destroy
 * @see app/Http/Controllers/Admin/InventoryController.php:282
 * @route '/admin/inventory/{inventory}'
 */
destroy.url = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { inventory: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    inventory: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        inventory: args.inventory,
                }

    return destroy.definition.url
            .replace('{inventory}', parsedArgs.inventory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::destroy
 * @see app/Http/Controllers/Admin/InventoryController.php:282
 * @route '/admin/inventory/{inventory}'
 */
destroy.delete = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\InventoryController::destroy
 * @see app/Http/Controllers/Admin/InventoryController.php:282
 * @route '/admin/inventory/{inventory}'
 */
    const destroyForm = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\InventoryController::destroy
 * @see app/Http/Controllers/Admin/InventoryController.php:282
 * @route '/admin/inventory/{inventory}'
 */
        destroyForm.delete = (args: { inventory: string | number } | [inventory: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\InventoryController::data
 * @see app/Http/Controllers/Admin/InventoryController.php:43
 * @route '/admin/inventory-data'
 */
export const data = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})

data.definition = {
    methods: ["get","head"],
    url: '/admin/inventory-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::data
 * @see app/Http/Controllers/Admin/InventoryController.php:43
 * @route '/admin/inventory-data'
 */
data.url = (options?: RouteQueryOptions) => {
    return data.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::data
 * @see app/Http/Controllers/Admin/InventoryController.php:43
 * @route '/admin/inventory-data'
 */
data.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\InventoryController::data
 * @see app/Http/Controllers/Admin/InventoryController.php:43
 * @route '/admin/inventory-data'
 */
data.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: data.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\InventoryController::data
 * @see app/Http/Controllers/Admin/InventoryController.php:43
 * @route '/admin/inventory-data'
 */
    const dataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: data.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\InventoryController::data
 * @see app/Http/Controllers/Admin/InventoryController.php:43
 * @route '/admin/inventory-data'
 */
        dataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: data.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\InventoryController::data
 * @see app/Http/Controllers/Admin/InventoryController.php:43
 * @route '/admin/inventory-data'
 */
        dataForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: data.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    data.form = dataForm
/**
* @see \App\Http\Controllers\Admin\InventoryController::lowStock
 * @see app/Http/Controllers/Admin/InventoryController.php:0
 * @route '/admin/low-stock-products'
 */
export const lowStock = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lowStock.url(options),
    method: 'get',
})

lowStock.definition = {
    methods: ["get","head"],
    url: '/admin/low-stock-products',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InventoryController::lowStock
 * @see app/Http/Controllers/Admin/InventoryController.php:0
 * @route '/admin/low-stock-products'
 */
lowStock.url = (options?: RouteQueryOptions) => {
    return lowStock.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InventoryController::lowStock
 * @see app/Http/Controllers/Admin/InventoryController.php:0
 * @route '/admin/low-stock-products'
 */
lowStock.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lowStock.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\InventoryController::lowStock
 * @see app/Http/Controllers/Admin/InventoryController.php:0
 * @route '/admin/low-stock-products'
 */
lowStock.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: lowStock.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\InventoryController::lowStock
 * @see app/Http/Controllers/Admin/InventoryController.php:0
 * @route '/admin/low-stock-products'
 */
    const lowStockForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: lowStock.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\InventoryController::lowStock
 * @see app/Http/Controllers/Admin/InventoryController.php:0
 * @route '/admin/low-stock-products'
 */
        lowStockForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: lowStock.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\InventoryController::lowStock
 * @see app/Http/Controllers/Admin/InventoryController.php:0
 * @route '/admin/low-stock-products'
 */
        lowStockForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: lowStock.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    lowStock.form = lowStockForm
const inventory = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
show: Object.assign(show, show),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
data: Object.assign(data, data),
lowStock: Object.assign(lowStock, lowStock),
}

export default inventory