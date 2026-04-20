<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Repositories\Admin\ProductReviewRepository;
use App\Http\Requests\Admin\ProductReviewRequest;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductsReviewsController extends Controller
{
    protected $reviewRepository;

    public function __construct(ProductReviewRepository $reviewRepository)
    {
        $this->reviewRepository = $reviewRepository;
    }

    public function index()
    {
        $stats = $this->reviewRepository->getStats();

        return Inertia::render('Admin/ProductsReviews/Index', [
            'stats' => $stats,
        ]);
    }

    public function getData(Request $request)
    {
        try {
            return $this->reviewRepository->getAllForDataTable($request);
        } catch (\Exception $e) {
            Log::error('Reviews getData error: '.$e->getMessage());

            return response()->json([
                'error' => 'Failed to load data',
                'message' => $e->getMessage(),
                'data' => [],
                'total' => 0,
            ], 500);
        }
    }

    public function create()
    {
        $products = $this->getFormattedProducts();
        $users    = User::orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('Admin/ProductsReviews/Create', [
            'products' => $products,
            'users'    => $users,
        ]);
    }

    public function store(ProductReviewRequest $request)
    {
        try {
            $validated = $request->validated();

            $this->reviewRepository->store($validated);

            return redirect()
                ->route('admin.reviews.index')
                ->with('success', 'Review created successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Review creation error: '.$e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Failed to create review.');
        }
    }

    public function edit(Review $review)
    {
        $review->load('product:id,name,thumbnail', 'user:id,name,email');

        $products = $this->getFormattedProducts();
        $users    = User::orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('Admin/ProductsReviews/Edit', [
            'review'   => $review,
            'products' => $products,
            'users'    => $users,
        ]);
    }

    public function update(ProductReviewRequest $request, Review $review)
    {
        try {
            $validated = $request->validated();

            $this->reviewRepository->update($review->id, $validated);

            return redirect()
                ->route('admin.reviews.index')
                ->with('success', 'Review updated successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Review update error: '.$e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Failed to update review.');
        }
    }

    public function updateStatus(Request $request, Review $review)
    {
        try {
            $this->reviewRepository->updateStatus($review->id, $request->status);

            return back()->with('success', 'Review status updated!');
        } catch (\Exception $e) {
            Log::error('Review status update error: '.$e->getMessage());

            return back()->with('error', 'Failed to update review status.');
        }
    }

    public function destroy(Review $review)
    {
        try {
            $this->reviewRepository->delete($review->id);

            return redirect()
                ->route('admin.reviews.index')
                ->with('success', 'Review deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Review deletion error: '.$e->getMessage());

            return back()->with('error', 'Failed to delete review.');
        }
    }

    public function bulkDelete(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'exists:reviews,id',
            ]);

            $count = $this->reviewRepository->bulkDelete($request->ids);

            return back()->with('success', $count.' reviews deleted!');
        } catch (\Exception $e) {
            Log::error('Bulk delete error: '.$e->getMessage());

            return back()->with('error', 'Failed to delete reviews.');
        }
    }

    private function getFormattedProducts()
    {
        $products = Product::where('status', true)->orderBy('name')->get(['id', 'name', 'thumbnail']);
        if ($products->isEmpty()) {
            $products = Product::orderBy('name')->get(['id', 'name', 'thumbnail']);
        }

        return $products->map(function ($product) {
            $imagePath = $product->thumbnail ? public_path('storage/'.$product->thumbnail) : null;
            return [
                'id'    => $product->id,
                'name'  => $product->name,
                'image' => ($imagePath && file_exists($imagePath)) ? asset('storage/'.$product->thumbnail) : null,
            ];
        })->values();
    }
}
