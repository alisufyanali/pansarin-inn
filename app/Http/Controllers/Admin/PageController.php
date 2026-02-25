<?php

namespace App\Http\Controllers\Admin\Settings;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PageController extends Controller
{
    public function getPagesData(Request $request)
{
    $query = Page::query();

    if ($request->search) {
        $query->where('title', 'like', "%{$request->search}%");
    }

    return response()->json($query->latest()->paginate($request->perPage ?? 10));
}

    public function index()
    {
        return Inertia::render('Admin/Pages/Index', [
            'pages' => Page::latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Pages/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required',
        ]);

        Page::create([
            'title' => $validated['title'],
            'slug' => Str::slug($request->title),
            'content' => $validated['content'],
            'status' => $request->status ?? 'active',
            'meta_title' => $request->meta_title,
            'meta_description' => $request->meta_description,
        ]);

        return redirect()->route('admin.pages.index')->with('success', 'Page created successfully!');
    }

    public function edit($id)
    {
        return Inertia::render('Admin/Pages/Edit', [
            'page' => Page::findOrFail($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $page = Page::findOrFail($id);
        
        $page->update([
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'content' => $request->content,
            'status' => $request->status,
            'meta_title' => $request->meta_title,
            'meta_description' => $request->meta_description,
        ]);

        return redirect()->route('admin.pages.index')->with('success', 'Page updated successfully!');
    }

    public function destroy($id)
    {
        Page::destroy($id);
        return redirect()->back()->with('success', 'Page deleted successfully!');
    }
}