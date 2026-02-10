import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::index
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:22
 * @route '/admin/blogscomments'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/blogscomments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::index
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:22
 * @route '/admin/blogscomments'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::index
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:22
 * @route '/admin/blogscomments'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::index
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:22
 * @route '/admin/blogscomments'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::index
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:22
 * @route '/admin/blogscomments'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::index
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:22
 * @route '/admin/blogscomments'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::index
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:22
 * @route '/admin/blogscomments'
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
* @see \App\Http\Controllers\Admin\BlogsCommentsController::create
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:129
 * @route '/admin/blogscomments/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/blogscomments/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::create
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:129
 * @route '/admin/blogscomments/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::create
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:129
 * @route '/admin/blogscomments/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::create
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:129
 * @route '/admin/blogscomments/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::create
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:129
 * @route '/admin/blogscomments/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::create
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:129
 * @route '/admin/blogscomments/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::create
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:129
 * @route '/admin/blogscomments/create'
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
* @see \App\Http\Controllers\Admin\BlogsCommentsController::store
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:146
 * @route '/admin/blogscomments'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/blogscomments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::store
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:146
 * @route '/admin/blogscomments'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::store
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:146
 * @route '/admin/blogscomments'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::store
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:146
 * @route '/admin/blogscomments'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::store
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:146
 * @route '/admin/blogscomments'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::show
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:177
 * @route '/admin/blogscomments/{blogscomment}'
 */
export const show = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/blogscomments/{blogscomment}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::show
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:177
 * @route '/admin/blogscomments/{blogscomment}'
 */
show.url = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { blogscomment: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    blogscomment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        blogscomment: args.blogscomment,
                }

    return show.definition.url
            .replace('{blogscomment}', parsedArgs.blogscomment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::show
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:177
 * @route '/admin/blogscomments/{blogscomment}'
 */
show.get = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::show
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:177
 * @route '/admin/blogscomments/{blogscomment}'
 */
show.head = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::show
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:177
 * @route '/admin/blogscomments/{blogscomment}'
 */
    const showForm = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::show
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:177
 * @route '/admin/blogscomments/{blogscomment}'
 */
        showForm.get = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::show
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:177
 * @route '/admin/blogscomments/{blogscomment}'
 */
        showForm.head = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\BlogsCommentsController::edit
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:189
 * @route '/admin/blogscomments/{blogscomment}/edit'
 */
export const edit = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/blogscomments/{blogscomment}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::edit
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:189
 * @route '/admin/blogscomments/{blogscomment}/edit'
 */
edit.url = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { blogscomment: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    blogscomment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        blogscomment: args.blogscomment,
                }

    return edit.definition.url
            .replace('{blogscomment}', parsedArgs.blogscomment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::edit
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:189
 * @route '/admin/blogscomments/{blogscomment}/edit'
 */
edit.get = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::edit
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:189
 * @route '/admin/blogscomments/{blogscomment}/edit'
 */
edit.head = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::edit
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:189
 * @route '/admin/blogscomments/{blogscomment}/edit'
 */
    const editForm = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::edit
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:189
 * @route '/admin/blogscomments/{blogscomment}/edit'
 */
        editForm.get = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::edit
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:189
 * @route '/admin/blogscomments/{blogscomment}/edit'
 */
        editForm.head = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\BlogsCommentsController::update
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:207
 * @route '/admin/blogscomments/{blogscomment}'
 */
export const update = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admin/blogscomments/{blogscomment}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::update
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:207
 * @route '/admin/blogscomments/{blogscomment}'
 */
update.url = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { blogscomment: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    blogscomment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        blogscomment: args.blogscomment,
                }

    return update.definition.url
            .replace('{blogscomment}', parsedArgs.blogscomment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::update
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:207
 * @route '/admin/blogscomments/{blogscomment}'
 */
update.put = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::update
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:207
 * @route '/admin/blogscomments/{blogscomment}'
 */
update.patch = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::update
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:207
 * @route '/admin/blogscomments/{blogscomment}'
 */
    const updateForm = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::update
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:207
 * @route '/admin/blogscomments/{blogscomment}'
 */
        updateForm.put = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::update
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:207
 * @route '/admin/blogscomments/{blogscomment}'
 */
        updateForm.patch = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\BlogsCommentsController::destroy
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:231
 * @route '/admin/blogscomments/{blogscomment}'
 */
export const destroy = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/blogscomments/{blogscomment}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::destroy
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:231
 * @route '/admin/blogscomments/{blogscomment}'
 */
destroy.url = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { blogscomment: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    blogscomment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        blogscomment: args.blogscomment,
                }

    return destroy.definition.url
            .replace('{blogscomment}', parsedArgs.blogscomment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::destroy
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:231
 * @route '/admin/blogscomments/{blogscomment}'
 */
destroy.delete = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::destroy
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:231
 * @route '/admin/blogscomments/{blogscomment}'
 */
    const destroyForm = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::destroy
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:231
 * @route '/admin/blogscomments/{blogscomment}'
 */
        destroyForm.delete = (args: { blogscomment: string | number } | [blogscomment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\BlogsCommentsController::getData
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:39
 * @route '/admin/blogscomments-data'
 */
export const getData = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getData.url(options),
    method: 'get',
})

getData.definition = {
    methods: ["get","head"],
    url: '/admin/blogscomments-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::getData
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:39
 * @route '/admin/blogscomments-data'
 */
getData.url = (options?: RouteQueryOptions) => {
    return getData.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::getData
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:39
 * @route '/admin/blogscomments-data'
 */
getData.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getData.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::getData
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:39
 * @route '/admin/blogscomments-data'
 */
getData.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getData.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::getData
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:39
 * @route '/admin/blogscomments-data'
 */
    const getDataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getData.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::getData
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:39
 * @route '/admin/blogscomments-data'
 */
        getDataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getData.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\BlogsCommentsController::getData
 * @see app/Http/Controllers/Admin/BlogsCommentsController.php:39
 * @route '/admin/blogscomments-data'
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
const BlogsCommentsController = { index, create, store, show, edit, update, destroy, getData }

export default BlogsCommentsController