import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::getData
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:40
 * @route '/admin/blogcategories-data'
 */
export const getData = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getData.url(options),
    method: 'get',
})

getData.definition = {
    methods: ["get","head"],
    url: '/admin/blogcategories-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::getData
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:40
 * @route '/admin/blogcategories-data'
 */
getData.url = (options?: RouteQueryOptions) => {
    return getData.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::getData
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:40
 * @route '/admin/blogcategories-data'
 */
getData.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getData.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::getData
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:40
 * @route '/admin/blogcategories-data'
 */
getData.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getData.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::getData
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:40
 * @route '/admin/blogcategories-data'
 */
    const getDataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getData.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::getData
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:40
 * @route '/admin/blogcategories-data'
 */
        getDataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getData.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::getData
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:40
 * @route '/admin/blogcategories-data'
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
/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::index
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:23
 * @route '/admin/blogcategories'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/blogcategories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::index
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:23
 * @route '/admin/blogcategories'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::index
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:23
 * @route '/admin/blogcategories'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::index
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:23
 * @route '/admin/blogcategories'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::index
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:23
 * @route '/admin/blogcategories'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::index
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:23
 * @route '/admin/blogcategories'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::index
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:23
 * @route '/admin/blogcategories'
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
* @see \App\Http\Controllers\Admin\BlogCategoryController::create
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:91
 * @route '/admin/blogcategories/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/blogcategories/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::create
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:91
 * @route '/admin/blogcategories/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::create
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:91
 * @route '/admin/blogcategories/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::create
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:91
 * @route '/admin/blogcategories/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::create
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:91
 * @route '/admin/blogcategories/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::create
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:91
 * @route '/admin/blogcategories/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::create
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:91
 * @route '/admin/blogcategories/create'
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
* @see \App\Http\Controllers\Admin\BlogCategoryController::store
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:103
 * @route '/admin/blogcategories'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/blogcategories',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::store
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:103
 * @route '/admin/blogcategories'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::store
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:103
 * @route '/admin/blogcategories'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::store
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:103
 * @route '/admin/blogcategories'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::store
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:103
 * @route '/admin/blogcategories'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::show
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:140
 * @route '/admin/blogcategories/{blogcategory}'
 */
export const show = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/blogcategories/{blogcategory}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::show
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:140
 * @route '/admin/blogcategories/{blogcategory}'
 */
show.url = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { blogcategory: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { blogcategory: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    blogcategory: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        blogcategory: typeof args.blogcategory === 'object'
                ? args.blogcategory.id
                : args.blogcategory,
                }

    return show.definition.url
            .replace('{blogcategory}', parsedArgs.blogcategory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::show
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:140
 * @route '/admin/blogcategories/{blogcategory}'
 */
show.get = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::show
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:140
 * @route '/admin/blogcategories/{blogcategory}'
 */
show.head = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::show
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:140
 * @route '/admin/blogcategories/{blogcategory}'
 */
    const showForm = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::show
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:140
 * @route '/admin/blogcategories/{blogcategory}'
 */
        showForm.get = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::show
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:140
 * @route '/admin/blogcategories/{blogcategory}'
 */
        showForm.head = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\BlogCategoryController::edit
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:150
 * @route '/admin/blogcategories/{blogcategory}/edit'
 */
export const edit = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/blogcategories/{blogcategory}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::edit
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:150
 * @route '/admin/blogcategories/{blogcategory}/edit'
 */
edit.url = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { blogcategory: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { blogcategory: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    blogcategory: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        blogcategory: typeof args.blogcategory === 'object'
                ? args.blogcategory.id
                : args.blogcategory,
                }

    return edit.definition.url
            .replace('{blogcategory}', parsedArgs.blogcategory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::edit
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:150
 * @route '/admin/blogcategories/{blogcategory}/edit'
 */
edit.get = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::edit
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:150
 * @route '/admin/blogcategories/{blogcategory}/edit'
 */
edit.head = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::edit
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:150
 * @route '/admin/blogcategories/{blogcategory}/edit'
 */
    const editForm = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::edit
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:150
 * @route '/admin/blogcategories/{blogcategory}/edit'
 */
        editForm.get = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::edit
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:150
 * @route '/admin/blogcategories/{blogcategory}/edit'
 */
        editForm.head = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\BlogCategoryController::update
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:165
 * @route '/admin/blogcategories/{blogcategory}'
 */
export const update = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admin/blogcategories/{blogcategory}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::update
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:165
 * @route '/admin/blogcategories/{blogcategory}'
 */
update.url = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { blogcategory: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { blogcategory: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    blogcategory: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        blogcategory: typeof args.blogcategory === 'object'
                ? args.blogcategory.id
                : args.blogcategory,
                }

    return update.definition.url
            .replace('{blogcategory}', parsedArgs.blogcategory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::update
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:165
 * @route '/admin/blogcategories/{blogcategory}'
 */
update.put = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::update
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:165
 * @route '/admin/blogcategories/{blogcategory}'
 */
update.patch = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::update
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:165
 * @route '/admin/blogcategories/{blogcategory}'
 */
    const updateForm = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::update
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:165
 * @route '/admin/blogcategories/{blogcategory}'
 */
        updateForm.put = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::update
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:165
 * @route '/admin/blogcategories/{blogcategory}'
 */
        updateForm.patch = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\BlogCategoryController::destroy
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:202
 * @route '/admin/blogcategories/{blogcategory}'
 */
export const destroy = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/blogcategories/{blogcategory}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::destroy
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:202
 * @route '/admin/blogcategories/{blogcategory}'
 */
destroy.url = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { blogcategory: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { blogcategory: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    blogcategory: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        blogcategory: typeof args.blogcategory === 'object'
                ? args.blogcategory.id
                : args.blogcategory,
                }

    return destroy.definition.url
            .replace('{blogcategory}', parsedArgs.blogcategory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogCategoryController::destroy
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:202
 * @route '/admin/blogcategories/{blogcategory}'
 */
destroy.delete = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::destroy
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:202
 * @route '/admin/blogcategories/{blogcategory}'
 */
    const destroyForm = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogCategoryController::destroy
 * @see app/Http/Controllers/Admin/BlogCategoryController.php:202
 * @route '/admin/blogcategories/{blogcategory}'
 */
        destroyForm.delete = (args: { blogcategory: number | { id: number } } | [blogcategory: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const BlogCategoryController = { getData, index, create, store, show, edit, update, destroy }

export default BlogCategoryController