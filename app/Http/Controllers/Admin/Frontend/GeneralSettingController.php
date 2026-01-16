<?php

namespace App\Http\Controllers\Admin\Frontend;

use App\Http\Controllers\Controller;
use App\Models\GeneralSetting;
use Illuminate\Http\Request;

class GeneralSettingController extends Controller
{
    
    public function index()
    {
        return response()->json(GeneralSetting::all()->pluck('value', 'type'));
    }

    public function create()
    {
        //
    }

    public function store(Request $request) 
    {
        foreach ($request->all() as $type => $value) {
            GeneralSetting::updateOrCreate(
                ['type' => $type],
                ['value' => $value]
            );
        }
        return response()->json(['success' => true, 'message' => 'General Settings updated!']);
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
