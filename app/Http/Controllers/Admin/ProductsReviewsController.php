<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ProductsReviewsController extends Controller
{
    // Main Index Page
    public function index()
    {
        $stats = [
            'total' => Review::count(),
            'verified' => Review::where('is_verified', true)->count(),
            'pending' => Review::where('status', false)->count(),
        ];

        return Inertia::render('Admin/ProductsReviews/Index', [
            'stats' => $stats,
        ]);
    }

    // DataTable API Endpoint
    public function getData(Request $request)
    {
        $query = Review::with(['product:id,name']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('comment', 'like', "%{$search}%")
                  ->orWhereHas('product', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filters
        if ($request->has('status') && $request->status !== null) {
            $query->where('status', $request->status);
        }

        if ($request->has('is_verified') && $request->is_verified !== null) {
            $query->where('is_verified', $request->is_verified);
        }

        if ($request->has('rating') && $request->rating) {
            $query->where('rating', $request->rating);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $reviews = $query->paginate($perPage);

        return response()->json($reviews);
    }

    // Create Page - FIXED
    public function create()
    {
        // First check total products
        $totalProducts = Product::count();
        \Log::info('Total Products in DB:', ['count' => $totalProducts]);
        
        // Try without filter first
        $allProducts = Product::orderBy('name')->get(['id', 'name', 'image']);
        \Log::info('All Products:', ['count' => $allProducts->count(), 'data' => $allProducts->toArray()]);
        
        // Now with filter
        $activeProducts = Product::where('is_active', 1)
            ->orWhere('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'image']);
        
        \Log::info('Active Products:', ['count' => $activeProducts->count()]);
        
        // Use active if available, otherwise all
        $products = $activeProducts->count() > 0 ? $activeProducts : $allProducts;
        
        // Format for frontend
        $formattedProducts = $products->map(function($product) {
            $imagePath = $product->image;
            
            // Handle different image path formats
            if ($imagePath) {
                if (str_starts_with($imagePath, 'http')) {
                    // Full URL
                    $imageUrl = $imagePath;
                } elseif (str_starts_with($imagePath, 'storage/')) {
                    // Already has storage prefix
                    $imageUrl = asset($imagePath);
                } else {
                    // No prefix
                    $imageUrl = asset('storage/' . $imagePath);
                }
            } else {
                $imageUrl = null;
            }
            
            return [
                'id' => $product->id,
                'name' => $product->name,
                'image' => $imageUrl,
            ];
        });

        \Log::info('Formatted Products for View:', ['count' => $formattedProducts->count()]);

        return Inertia::render('Admin/ProductsReviews/Create', [
            'products' => $formattedProducts->values(), // values() to reset array keys
        ]);
    }

    // Store Review
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'order_number' => 'nullable|string|max:100',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:10|max:1000',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();
        
        // Check if order number exists and belongs to this product
        $isVerified = false;
        if ($request->order_number) {
            $order = Order::where('order_number', $request->order_number)
                ->whereHas('items', function($q) use ($request) {
                    $q->where('product_id', $request->product_id);
                })
                ->first();
            
            $isVerified = $order ? true : false;
        }

        $data['is_verified'] = $isVerified;
        $data['status'] = false; // Pending approval by default
        $data['user_id'] = auth()->id(); // If logged in

        Review::create($data);

        return redirect()
            ->route('admin.reviews.index')
            ->with('success', 'Review created successfully!');
    }

    // Edit Page - FIXED
    public function edit(Review $review)
    {
        $review->load('product:id,name,image');
        
        // Fix review product image
        if ($review->product && $review->product->image) {
            $imagePath = $review->product->image;
            if (str_starts_with($imagePath, 'http')) {
                $review->product->image = $imagePath;
            } elseif (str_starts_with($imagePath, 'storage/')) {
                $review->product->image = asset($imagePath);
            } else {
                $review->product->image = asset('storage/' . $imagePath);
            }
        }
        
        // Get all active products
        $products = Product::where('is_active', 1)
            ->orWhere('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'image']);
        
        // If no active products, get all
        if ($products->count() === 0) {
            $products = Product::orderBy('name')->get(['id', 'name', 'image']);
        }
        
        $formattedProducts = $products->map(function($product) {
            $imagePath = $product->image;
            
            if ($imagePath) {
                if (str_starts_with($imagePath, 'http')) {
                    $imageUrl = $imagePath;
                } elseif (str_starts_with($imagePath, 'storage/')) {
                    $imageUrl = asset($imagePath);
                } else {
                    $imageUrl = asset('storage/' . $imagePath);
                }
            } else {
                $imageUrl = null;
            }
            
            return [
                'id' => $product->id,
                'name' => $product->name,
                'image' => $imageUrl,
            ];
        });

        return Inertia::render('Admin/ProductsReviews/Edit', [
            'review' => $review,
            'products' => $formattedProducts->values(),
        ]);
    }

    // Update Review
    public function update(Request $request, Review $review)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'order_number' => 'nullable|string|max:100',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:10|max:1000',
            'status' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();
        
        // Re-verify if order number changed
        if ($request->order_number && $request->order_number !== $review->order_number) {
            $order = Order::where('order_number', $request->order_number)
                ->whereHas('items', function($q) use ($request) {
                    $q->where('product_id', $request->product_id);
                })
                ->first();
            
            $data['is_verified'] = $order ? true : false;
        }

        $review->update($data);

        return redirect()
            ->route('admin.reviews.index')
            ->with('success', 'Review updated successfully!');
    }

    // Toggle Status
    public function updateStatus(Request $request, Review $review)
    {
        $review->update(['status' => $request->status]);
        
        return back()->with('success', 'Review status updated!');
    }

    // Delete Review
    public function destroy(Review $review)
    {
        $review->delete();
        
        return redirect()
            ->route('admin.reviews.index')
            ->with('success', 'Review deleted successfully!');
    }

    // Bulk Delete
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:reviews,id'
        ]);

        Review::whereIn('id', $request->ids)->delete();

        return back()->with('success', count($request->ids) . ' reviews deleted!');
    }
}