<?php

namespace App\Http\Controllers\Admin\Frontend;

use App\Http\Controllers\Controller;
use App\Models\UiSetting;
use Illuminate\Http\Request;

class UiSettingController extends Controller
{

    public function index()
    {
        return response()->json(UiSetting::all()->pluck('value', 'type'));
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        foreach ($request->all() as $type => $value) {
            UiSetting::updateOrCreate(
                ['type' => $type],
                ['value' => $value]
            );
        }
        return response()->json(['success' => true, 'message' => 'UI Settings updated!']);
    }
    
    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        //
    }

    public function update(Request $request, string $id)
    {
        //
    }

    public function destroy(string $id)
    {
        //
    }
}
