import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\BlogTagsController::index
 * @see app/Http/Controllers/Admin/BlogTagsController.php:21
 * @route '/admin/blogstags'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/blogstags',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::index
 * @see app/Http/Controllers/Admin/BlogTagsController.php:21
 * @route '/admin/blogstags'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::index
 * @see app/Http/Controllers/Admin/BlogTagsController.php:21
 * @route '/admin/blogstags'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogTagsController::index
 * @see app/Http/Controllers/Admin/BlogTagsController.php:21
 * @route '/admin/blogstags'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogTagsController::index
 * @see app/Http/Controllers/Admin/BlogTagsController.php:21
 * @route '/admin/blogstags'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::index
 * @see app/Http/Controllers/Admin/BlogTagsController.php:21
 * @route '/admin/blogstags'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::index
 * @see app/Http/Controllers/Admin/BlogTagsController.php:21
 * @route '/admin/blogstags'
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
* @see \App\Http\Controllers\Admin\BlogTagsController::create
 * @see app/Http/Controllers/Admin/BlogTagsController.php:71
 * @route '/admin/blogstags/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/blogstags/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::create
 * @see app/Http/Controllers/Admin/BlogTagsController.php:71
 * @route '/admin/blogstags/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::create
 * @see app/Http/Controllers/Admin/BlogTagsController.php:71
 * @route '/admin/blogstags/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogTagsController::create
 * @see app/Http/Controllers/Admin/BlogTagsController.php:71
 * @route '/admin/blogstags/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogTagsController::create
 * @see app/Http/Controllers/Admin/BlogTagsController.php:71
 * @route '/admin/blogstags/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::create
 * @see app/Http/Controllers/Admin/BlogTagsController.php:71
 * @route '/admin/blogstags/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::create
 * @see app/Http/Controllers/Admin/BlogTagsController.php:71
 * @route '/admin/blogstags/create'
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
* @see \App\Http\Controllers\Admin\BlogTagsController::store
 * @see app/Http/Controllers/Admin/BlogTagsController.php:76
 * @route '/admin/blogstags'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/blogstags',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::store
 * @see app/Http/Controllers/Admin/BlogTagsController.php:76
 * @route '/admin/blogstags'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::store
 * @see app/Http/Controllers/Admin/BlogTagsController.php:76
 * @route '/admin/blogstags'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\BlogTagsController::store
 * @see app/Http/Controllers/Admin/BlogTagsController.php:76
 * @route '/admin/blogstags'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::store
 * @see app/Http/Controllers/Admin/BlogTagsController.php:76
 * @route '/admin/blogstags'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\BlogTagsController::show
 * @see app/Http/Controllers/Admin/BlogTagsController.php:108
 * @route '/admin/blogstags/{blogstag}'
 */
export const show = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/blogstags/{blogstag}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::show
 * @see app/Http/Controllers/Admin/BlogTagsController.php:108
 * @route '/admin/blogstags/{blogstag}'
 */
show.url = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { blogstag: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    blogstag: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        blogstag: args.blogstag,
                }

    return show.definition.url
            .replace('{blogstag}', parsedArgs.blogstag.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::show
 * @see app/Http/Controllers/Admin/BlogTagsController.php:108
 * @route '/admin/blogstags/{blogstag}'
 */
show.get = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogTagsController::show
 * @see app/Http/Controllers/Admin/BlogTagsController.php:108
 * @route '/admin/blogstags/{blogstag}'
 */
show.head = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogTagsController::show
 * @see app/Http/Controllers/Admin/BlogTagsController.php:108
 * @route '/admin/blogstags/{blogstag}'
 */
    const showForm = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::show
 * @see app/Http/Controllers/Admin/BlogTagsController.php:108
 * @route '/admin/blogstags/{blogstag}'
 */
        showForm.get = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::show
 * @see app/Http/Controllers/Admin/BlogTagsController.php:108
 * @route '/admin/blogstags/{blogstag}'
 */
        showForm.head = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\BlogTagsController::edit
 * @see app/Http/Controllers/Admin/BlogTagsController.php:121
 * @route '/admin/blogstags/{blogstag}/edit'
 */
export const edit = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/blogstags/{blogstag}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::edit
 * @see app/Http/Controllers/Admin/BlogTagsController.php:121
 * @route '/admin/blogstags/{blogstag}/edit'
 */
edit.url = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { blogstag: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    blogstag: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        blogstag: args.blogstag,
                }

    return edit.definition.url
            .replace('{blogstag}', parsedArgs.blogstag.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::edit
 * @see app/Http/Controllers/Admin/BlogTagsController.php:121
 * @route '/admin/blogstags/{blogstag}/edit'
 */
edit.get = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogTagsController::edit
 * @see app/Http/Controllers/Admin/BlogTagsController.php:121
 * @route '/admin/blogstags/{blogstag}/edit'
 */
edit.head = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogTagsController::edit
 * @see app/Http/Controllers/Admin/BlogTagsController.php:121
 * @route '/admin/blogstags/{blogstag}/edit'
 */
    const editForm = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::edit
 * @see app/Http/Controllers/Admin/BlogTagsController.php:121
 * @route '/admin/blogstags/{blogstag}/edit'
 */
        editForm.get = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::edit
 * @see app/Http/Controllers/Admin/BlogTagsController.php:121
 * @route '/admin/blogstags/{blogstag}/edit'
 */
        editForm.head = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\BlogTagsController::update
 * @see app/Http/Controllers/Admin/BlogTagsController.php:128
 * @route '/admin/blogstags/{blogstag}'
 */
export const update = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admin/blogstags/{blogstag}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::update
 * @see app/Http/Controllers/Admin/BlogTagsController.php:128
 * @route '/admin/blogstags/{blogstag}'
 */
update.url = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { blogstag: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    blogstag: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        blogstag: args.blogstag,
                }

    return update.definition.url
            .replace('{blogstag}', parsedArgs.blogstag.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::update
 * @see app/Http/Controllers/Admin/BlogTagsController.php:128
 * @route '/admin/blogstags/{blogstag}'
 */
update.put = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Admin\BlogTagsController::update
 * @see app/Http/Controllers/Admin/BlogTagsController.php:128
 * @route '/admin/blogstags/{blogstag}'
 */
update.patch = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Admin\BlogTagsController::update
 * @see app/Http/Controllers/Admin/BlogTagsController.php:128
 * @route '/admin/blogstags/{blogstag}'
 */
    const updateForm = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::update
 * @see app/Http/Controllers/Admin/BlogTagsController.php:128
 * @route '/admin/blogstags/{blogstag}'
 */
        updateForm.put = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::update
 * @see app/Http/Controllers/Admin/BlogTagsController.php:128
 * @route '/admin/blogstags/{blogstag}'
 */
        updateForm.patch = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\BlogTagsController::destroy
 * @see app/Http/Controllers/Admin/BlogTagsController.php:153
 * @route '/admin/blogstags/{blogstag}'
 */
export const destroy = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/blogstags/{blogstag}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::destroy
 * @see app/Http/Controllers/Admin/BlogTagsController.php:153
 * @route '/admin/blogstags/{blogstag}'
 */
destroy.url = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { blogstag: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    blogstag: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        blogstag: args.blogstag,
                }

    return destroy.definition.url
            .replace('{blogstag}', parsedArgs.blogstag.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::destroy
 * @see app/Http/Controllers/Admin/BlogTagsController.php:153
 * @route '/admin/blogstags/{blogstag}'
 */
destroy.delete = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\BlogTagsController::destroy
 * @see app/Http/Controllers/Admin/BlogTagsController.php:153
 * @route '/admin/blogstags/{blogstag}'
 */
    const destroyForm = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::destroy
 * @see app/Http/Controllers/Admin/BlogTagsController.php:153
 * @route '/admin/blogstags/{blogstag}'
 */
        destroyForm.delete = (args: { blogstag: string | number } | [blogstag: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\BlogTagsController::data
 * @see app/Http/Controllers/Admin/BlogTagsController.php:35
 * @route '/admin/blogstags-data'
 */
export const data = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})

data.definition = {
    methods: ["get","head"],
    url: '/admin/blogstags-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::data
 * @see app/Http/Controllers/Admin/BlogTagsController.php:35
 * @route '/admin/blogstags-data'
 */
data.url = (options?: RouteQueryOptions) => {
    return data.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::data
 * @see app/Http/Controllers/Admin/BlogTagsController.php:35
 * @route '/admin/blogstags-data'
 */
data.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogTagsController::data
 * @see app/Http/Controllers/Admin/BlogTagsController.php:35
 * @route '/admin/blogstags-data'
 */
data.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: data.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogTagsController::data
 * @see app/Http/Controllers/Admin/BlogTagsController.php:35
 * @route '/admin/blogstags-data'
 */
    const dataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: data.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::data
 * @see app/Http/Controllers/Admin/BlogTagsController.php:35
 * @route '/admin/blogstags-data'
 */
        dataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: data.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::data
 * @see app/Http/Controllers/Admin/BlogTagsController.php:35
 * @route '/admin/blogstags-data'
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
* @see \App\Http\Controllers\Admin\BlogTagsController::active
 * @see app/Http/Controllers/Admin/BlogTagsController.php:168
 * @route '/admin/blogstags-active'
 */
export const active = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: active.url(options),
    method: 'get',
})

active.definition = {
    methods: ["get","head"],
    url: '/admin/blogstags-active',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::active
 * @see app/Http/Controllers/Admin/BlogTagsController.php:168
 * @route '/admin/blogstags-active'
 */
active.url = (options?: RouteQueryOptions) => {
    return active.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogTagsController::active
 * @see app/Http/Controllers/Admin/BlogTagsController.php:168
 * @route '/admin/blogstags-active'
 */
active.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: active.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogTagsController::active
 * @see app/Http/Controllers/Admin/BlogTagsController.php:168
 * @route '/admin/blogstags-active'
 */
active.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: active.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogTagsController::active
 * @see app/Http/Controllers/Admin/BlogTagsController.php:168
 * @route '/admin/blogstags-active'
 */
    const activeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: active.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::active
 * @see app/Http/Controllers/Admin/BlogTagsController.php:168
 * @route '/admin/blogstags-active'
 */
        activeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: active.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogTagsController::active
 * @see app/Http/Controllers/Admin/BlogTagsController.php:168
 * @route '/admin/blogstags-active'
 */
        activeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: active.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    active.form = activeForm
const blogstags = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
show: Object.assign(show, show),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
data: Object.assign(data, data),
active: Object.assign(active, active),
}

export default blogstags