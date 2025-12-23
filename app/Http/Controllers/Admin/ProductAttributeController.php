<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductAttributeController extends Controller
{
    public function __construct()
    {
        // Manual permission checks instead of authorizeResource
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $attributes = Attribute::with('values')->get();
        
        return Inertia::render('Admin/Attributes/Index', [
            'attributes' => $attributes,
        ]);
        
    }

    
    /**
     * Get paginated data for DataTable (AJAX endpoint)
     */
    public function getData(Request $request)
    {
        $query = Attribute::with('values');
        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhereHas('values', function($q) use ($search) {
                      $q->where('value', 'like', "%{$search}%");
                  });
            });
        

        }
        
        // Sorting
        $sortBy = $request->get('sortBy', 'id');
        $sortOrder = $request->get('sortOrder', 'desc');
        
        if ($sortBy === 'values_count') {
            $query->withCount('values')
                  ->orderBy('values_count', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }
        
        // Pagination
        $perPage = $request->get('perPage', 10);
        $attributes = $query->paginate($perPage);
        
        return response()->json([
            'data' => $attributes->items(),
            'total' => $attributes->total(),
            'per_page' => $attributes->perPage(),
            'current_page' => $attributes->currentPage(),
            'last_page' => $attributes->lastPage(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Attributes/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:attributes,name',
            'values' => 'required|array|min:1',
            'values.*' => 'required|string|max:255',
        ]);

        $attribute = Attribute::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        // Create attribute values - har value ke liye new entry banao
        foreach ($validated['values'] as $value) {
            AttributeValue::create([
                'attribute_id' => $attribute->id,
                'value' => $value,
                'slug' => Str::slug($value),
            ]);
        }

        return redirect()->route('attributes.index')
            ->with('message', 'Attribute created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Attribute $attribute)
    {
        return redirect()->route('attributes.edit', $attribute);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Attribute $attribute)
    {
        return Inertia::render('Admin/Attributes/Edit', [
            'attribute' => $attribute->load('values'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Attribute $attribute)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:attributes,name,' . $attribute->id,
            'values' => 'required|array|min:1',
            'values.*' => 'required|string|max:255',
        ]);

        $attribute->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        // Delete existing values اور نئے values create کرو
        $attribute->values()->delete();

        foreach ($validated['values'] as $value) {
            AttributeValue::create([
                'attribute_id' => $attribute->id,
                'value' => $value,
                'slug' => Str::slug($value),
            ]);
        }

        return redirect()->route('attributes.index')
            ->with('message', 'Attribute updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Attribute $attribute)
    {
        $attribute->values()->delete();
        $attribute->delete();

        return redirect()->route('attributes.index')
            ->with('message', 'Attribute deleted successfully');
    }
}