<?php

namespace App\Http\Controllers\Admin\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{

    public function index()
    {
        return response()->json(Page::latest()->get());
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required',
        ]);

        $page = Page::create([
            'title' => $validated['title'],
            'slug' => Str::slug($request->title),
            'content' => $validated['content'],
            'meta_title' => $request->meta_title,
            'meta_description' => $request->meta_description,
        ]);

        return response()->json(['success' => true, 'data' => $page]);
    }

    public function show($id)
    {
        return response()->json(Page::findOrFail($id));
    }

    public function edit(string $id)
    {
        //
    }

    public function update(Request $request, $id)
    {
        $page = Page::findOrFail($id);
        
        $page->update([
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'content' => $request->content,
            'meta_title' => $request->meta_title,
            'meta_description' => $request->meta_description,
        ]);

        return response()->json(['success' => true, 'message' => 'Page updated!']);
    }

    public function destroy($id)
    {
        Page::destroy($id);
        return response()->json(['success' => true, 'message' => 'Page deleted!']);
    }

}
