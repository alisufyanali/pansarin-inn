<?php

namespace App\Http\Controllers\Admin\Frontend;

use App\Http\Controllers\Controller;
use App\Models\BusinessSetting;
use Illuminate\Http\Request;

class BusinessSettingController extends Controller
{
    public function index()
    {
        // Status aur Value dono return karenge kyunki business settings mein 'status' column bhi hai
        return response()->json(BusinessSetting::all());
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        foreach ($request->settings as $setting) {
            BusinessSetting::updateOrCreate(
                ['type' => $setting['type']],
                ['value' => $setting['value'], 'status' => $setting['status'] ?? 'ok']
            );
        }
        return response()->json(['success' => true, 'message' => 'Business Settings updated!']);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
