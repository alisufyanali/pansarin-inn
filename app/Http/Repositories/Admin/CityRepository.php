<?php

namespace App\Http\Repositories\Admin;

use App\Models\City;
use App\Models\Country;
use App\Models\State;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CityRepository
{
    /** Province (form value) → state name used by StateSeeder */
    private const PROVINCE_STATES = [
        'sindh'        => 'Sindh',
        'punjab'       => 'Punjab',
        'kpk'          => 'Khyber Pakhtunkhwa',
        'balochistan'  => 'Balochistan',
        'gilgit'       => 'Gilgit-Baltistan',
        'azad_kashmir' => 'Azad Jammu and Kashmir',
    ];

    /**
     * cities.state_id is required, but the admin form only asks for the province —
     * fill it from the province so a new city (e.g. Mastung) can be saved.
     */
    private function withState(array $data): array
    {
        if (empty($data['province']) || ! isset(self::PROVINCE_STATES[$data['province']])) {
            return $data;
        }

        $countryId = Country::firstOrCreate(['name' => 'Pakistan'], ['code' => 'PK'])->id;
        $data['state_id'] = State::firstOrCreate(
            ['name' => self::PROVINCE_STATES[$data['province']]],
            ['country_id' => $countryId],
        )->id;

        return $data;
    }

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

            $perPage   = min((int) $request->get('perPage', $request->get('per_page', 10)), 100);
            $page      = (int) $request->get('page', 1);
            $paginated = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'data'         => $paginated->items(),
                'total'        => $paginated->total(),
                'per_page'     => $paginated->perPage(),
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
            ]);
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
            return City::forceCreate($this->withState(array_intersect_key($data, array_flip(['name', 'shipping_charges', 'province']))));
        } catch (\Exception $e) {
            Log::error('City creation error: '.$e->getMessage());
            throw $e;
        }
    }

    public function update($id, array $data)
    {
        try {
            $city = $this->find($id);
            $city->forceFill($this->withState(array_intersect_key($data, array_flip(['name', 'shipping_charges', 'province']))))->save();

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
