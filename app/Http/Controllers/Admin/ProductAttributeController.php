<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\ProductAttributeRepository;
use App\Http\Requests\Admin\ProductAttributeRequest;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductAttributeController extends Controller
{
    protected $attributeRepository;

    public function __construct(ProductAttributeRepository $attributeRepository)
    {
        $this->attributeRepository = $attributeRepository;
        // Permission middleware for each method
        $this->middleware('permission:view.attributes')->only(['index', 'getData', 'show']);
        $this->middleware('permission:create.attributes')->only(['create', 'store']);
        $this->middleware('permission:edit.attributes')->only(['edit', 'update']);
        $this->middleware('permission:delete.attributes')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $attributes = $this->attributeRepository->getAll();
        
        return Inertia::render('Admin/Attributes/Index', [
            'attributes' => $attributes,
        ]);
    }

    /**
     * Get paginated data for DataTable (AJAX endpoint)
     */
    public function getData(Request $request)
    {
        return $this->attributeRepository->getAllForDataTable($request);
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
    public function store(ProductAttributeRequest $request)
    {
        $validated = $request->validated();

        try {
            $attribute = $this->attributeRepository->store($validated);

            // Create attribute values
            foreach ($validated['values'] as $value) {
                AttributeValue::create([
                    'attribute_id' => $attribute->id,
                    'value' => $value,
                    'slug' => Str::slug($value),
                ]);
            }

            return redirect()->route('admin.attributes.index')
                ->with('success', 'Attribute created successfully');
        } catch (\Exception $e) {
            Log::error('Attribute creation failed: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create attribute. Please try again.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Attribute $attribute)
    {
        $attribute = $this->attributeRepository->find($attribute->id);
        $attribute->load('values');
        
        return Inertia::render('Admin/Attributes/Show', [
            'attribute' => $attribute,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Attribute $attribute)
    {
        $attribute = $this->attributeRepository->find($attribute->id);
        
        return Inertia::render('Admin/Attributes/Edit', [
            'attribute' => $attribute->load('values'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductAttributeRequest $request, Attribute $attribute)
    {
        $validated = $request->validated();

        try {
            $this->attributeRepository->update($attribute->id, $validated);

            // Delete existing values and create new ones
            $attribute->values()->delete();

            foreach ($validated['values'] as $value) {
                AttributeValue::create([
                    'attribute_id' => $attribute->id,
                    'value' => $value,
                    'slug' => Str::slug($value),
                ]);
            }

            return redirect()->route('admin.attributes.index')
                ->with('success', 'Attribute updated successfully');
        } catch (\Exception $e) {
            Log::error('Attribute update failed: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update attribute. Please try again.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Attribute $attribute)
    {
        try {
            $attribute->values()->delete();
            $this->attributeRepository->delete($attribute->id);

            return redirect()->route('admin.attributes.index')
                ->with('success', 'Attribute deleted successfully');
        } catch (\Exception $e) {
            Log::error('Attribute deletion failed: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to delete attribute. Please try again.');
        }
    }
}