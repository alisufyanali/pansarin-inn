<?php

namespace App\Http\Repositories\Admin;

use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Yajra\DataTables\Facades\DataTables;

class CityRepository
{
    public function getAll()
    {
        return City::latest()->get();
    }

    public function getAllForDataTable(Request $request)
    {
        try {
            $query = City::latest();

            if ($request->has('search') && $request->search !== '') {
                $search = is_array($request->search)
                    ? ($request->search['value'] ?? '')
                    : $request->search;

                if (! empty($search)) {
                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('province', 'like', "%{$search}%");
                    });
                }
            }

            if ($request->filled('province')) {
                $query->where('province', $request->province);
            }

            return DataTables::of($query)->make(true);
        } catch (\Exception $e) {
            Log::error('City DataTable error: '.$e->getMessage());
            throw $e;
        }
    }

    public function find($id)
    {
        return City::findOrFail($id);
    }

    public function store(array $data)
    {
        try {
            return City::create($data);
        } catch (\Exception $e) {
            Log::error('City creation error: '.$e->getMessage());
            throw $e;
        }
    }

    public function update($id, array $data)
    {
        try {
            $city = $this->find($id);
            $city->update($data);

            return $city;
        } catch (\Exception $e) {
            Log::error('City update error: '.$e->getMessage());
            throw $e;
        }
    }

    public function delete($id)
    {
        try {
            $city = $this->find($id);

            return $city->delete();
        } catch (\Exception $e) {
            Log::error('City deletion error: '.$e->getMessage());
            throw $e;
        }
    }

    public function getStats()
    {
        return [
            'total'        => City::count(),
            'sindh'        => City::where('province', 'sindh')->count(),
            'punjab'       => City::where('province', 'punjab')->count(),
            'balochistan'  => City::where('province', 'balochistan')->count(),
            'kpk'          => City::where('province', 'kpk')->count(),
            'gilgit'       => City::where('province', 'gilgit')->count(),
            'azad_kashmir' => City::where('province', 'azad_kashmir')->count(),
        ];
    }

    public function bulkDelete(array $ids)
    {
        try {
            return City::whereIn('id', $ids)->delete();
        } catch (\Exception $e) {
            Log::error('City bulk delete error: '.$e->getMessage());
            throw $e;
        }
    }
}
