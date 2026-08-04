<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        // --- Fetch state IDs ---
        $sindhId       = DB::table('states')->where('name', 'Sindh')->value('id');
        $punjabId      = DB::table('states')->where('name', 'Punjab')->value('id');
        $kpkId         = DB::table('states')->where('name', 'Khyber Pakhtunkhwa')->value('id');
        $balochistanId = DB::table('states')->where('name', 'Balochistan')->value('id');
        $gilgitId      = DB::table('states')->where('name', 'Gilgit-Baltistan')->value('id');
        $kashmirId     = DB::table('states')->where('name', 'Azad Jammu and Kashmir')->value('id');

        // Validate all states exist
        if (!$sindhId || !$punjabId || !$kpkId || !$balochistanId || !$gilgitId || !$kashmirId) {
            throw new \Exception('One or more states not found. Ensure StateSeeder runs before CitySeeder.');
        }

        // --- Define all cities with their province ---
        // Cities explicitly mapped to a province; all others will default to Punjab.
        $cityMapping = [
            // Sindh
            'Sindh' => [
                'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah',
                'Jamshoro', 'Badin', 'Dadu', 'Ghotki', 'Hala', 'Kandiaro',
                'Khairpur', 'Kotri', 'Matiari', 'Moro', 'Naushahro Feroze',
                'Qazi Ahmed', 'Rohri', 'Sakrand', 'Sanghar', 'Shahdadpur',
                'Shahpur Chakar', 'Tando Adam', 'Tando Bago', 'Tharparkar',
                'Thatta', 'Shikarpur', 'Pir Jo Goth', 'Old Hala', 'Mithi',
                'Kamber Ali Khan', 'Shahdadkot', 'Rato Dearo', 'Makli',
                'Samaro', 'Kashmore', 'Guddu Barrage', 'Meher', 'Qamber',
                'Bharkan', 'Johi', 'Golarchi', 'Ghari Khairo', 'Mehrabpur',
                'Umerkot', 'Saeedabad', 'Tando Jam', 'Tando Ala Yar',
                'Tando Jan Mohd.', 'Tando Mohd. Khan', 'Sajawal', 'Sehwan',
                'Sehwan Sharif', 'Sobho Dero', 'Talhar', 'Dokri', 'Nawab Shah',
                'Tando Allahyar', 'Sinjhoro', 'Jhudo', 'Tharu Shah', 'Digri',
                'Nooriabad', 'Islamkot', 'Nowshero Feroz', 'Umer Kot', 'Dharki',
                'Kandhkot', 'Kacha Khoo'
            ],
            // Khyber Pakhtunkhwa
            'Khyber Pakhtunkhwa' => [
                'Peshawar', 'Mardan', 'Abbottabad', 'Swat', 'Nowshera',
                'Charsadda', 'Dera Ismail Khan', 'Kohat', 'Mansehra', 'Mingora',
                'Bannu', 'Batkhela', 'Buner', 'Hangu', 'Haripur', 'Karak',
                'Malakand', 'Swabi', 'Chitral', 'Dargai', 'Lakki Marwat',
                'Takht-e-Bhai', 'Tangi', 'Shabqadar', 'Katlang', 'Khar (Bajore Agency)',
                'Topi', 'Matta', 'Shangla', 'Risalpur', 'Oughi', 'Balambat',
                'Thall', 'Kot Chutta', 'Kabal', 'Timargara'
            ],
            // Balochistan
            'Balochistan' => [
                'Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Loralai', 'Sibbi',
                'Nasirabad', 'Awaran', 'Chaghi', 'Killa Saifullah', 'Muslim Bagh',
                'Qalat', 'Zhob', 'Sui', 'Bela', 'Uthal', 'Winder'
            ],
            // Gilgit-Baltistan
            'Gilgit-Baltistan' => [
                'Gilgit', 'Skardu', 'Astore', 'Hunza', 'Kaghan', 'Naran',
                'Khaplu', 'Gamba Skardu'
            ],
            // Azad Jammu and Kashmir
            'Azad Jammu and Kashmir' => [
                'Muzaffarabad', 'Mirpur', 'Bhimber', 'Neelum', 'Sudhnoti',
                'Hattian Bala', 'Kotli', 'Bagh', 'Rawalakot', 'Dadyal',
                'Barnala', 'Hajira', 'Chakswari', 'Abbaspur', 'Islam Garh',
                'Mangla Hamlet', 'Khuiratta', 'Mangla Cantt', 'Mandi Shah Juin',
                'Sohawa (only main GT Road)', 'Pindi Bhatian', 'Dinga'
            ],
        ];

        // Build final array for insertion
        $citiesToInsert = [];

        foreach ($cityMapping as $province => $cityNames) {
            // Determine state_id based on province name
            $stateId = match ($province) {
                'Sindh'                  => $sindhId,
                'Khyber Pakhtunkhwa'     => $kpkId,
                'Balochistan'            => $balochistanId,
                'Gilgit-Baltistan'       => $gilgitId,
                'Azad Jammu and Kashmir' => $kashmirId,
                default                  => $punjabId, // fallback (should not happen)
            };

            foreach ($cityNames as $cityName) {
                $citiesToInsert[] = [
                    'state_id'         => $stateId,
                    'name'             => $cityName,
                    'shipping_charges' => 250, // as per old table data
                    'province'         => strtolower($province),
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ];
            }
        }

        // --- Add all Punjab cities (remaining from the old dump) ---
        // These are all cities that are not explicitly listed above.
        // (Most of the 400+ cities are Punjab)
        $punjabCities = [
            'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala',
            'Sialkot', 'Bahawalpur', 'Sargodha', 'Islamabad', 'Attock',
            'Arifwala', 'Galyat', 'Chakwal', 'Kasur', 'Kharian', 'Lodhran',
            'Burewala', 'Kamalia', 'Jhelum', 'Hub (Hub Chowki)', 'Gharo',
            'Gojra', 'Gujar Khan', 'Jhang', 'Daska', 'Chiniot', 'Gujrat',
            'Harappa', 'Dera Ghazi Khan', 'Dina', 'Khanewal', 'Khanpur',
            'Fateh Jang', 'Mandi Bahauddin', 'Okara', 'Bahawalnagar',
            'Ahmedpur East', 'Bhakkar', 'Kamoki', 'Kahror Pakka', 'Jauharabad',
            'Jampur', 'Hazro', 'Jahanian', 'Ghakhar', 'Chichawatni',
            'Jalalpur Jattan', 'Choa Saidan Shah', 'Chunian', 'Balakot',
            'Daur', 'Jatoi', 'Haroonabad', 'Hassan Abdal', 'Hafizabad',
            'Depalpur', 'Fort Abbas', 'Duniya Pur', 'Dijkot', 'Dobian',
            'FATA', 'Khushab', 'Kot Addu', 'Lalamusa', 'Mangla', 'Layyah',
            'Mian Channu', 'Mailsi', 'Mianwali', 'Nankana Sahib', 'Murree',
            'Rahim Yar Khan', 'Sheikhupura', 'Wazirabad', 'Muridke', 'Narowal',
            'Muzaffargarh', 'Pakpattan', 'Rajanpur', 'Sadiqabad', 'Sahiwal',
            'Pir Mahal', 'Sarai Alamgir', 'Shahkot', 'Shakargarh', 'Taxila',
            'Toba Tek Singh', 'Vehari', 'Mitha Tiwana', 'Pind Dadan Khan',
            'Rajana', 'Talagang', 'Sher Garh', 'Yazman', 'Wah Cantt',
            'Jaranwala', 'Kot Radha Kishen', 'Pindi Gheb', 'Radhan',
            'Havelian', 'Malakwal', 'Chistian Sharif', 'Chawinda', 'Zafarwal',
            'Fateh Pur', 'Shewa Adda', 'Chenab Nagar', 'Sarai Naurang',
            'Renala Khurd', 'Khuratta', 'Nowshera Kalan', 'Daulat Pur',
            'Pasrur', 'Shujaabad', 'Lalian', 'Kallar Kalan', 'Badiana',
            'Bhopalwala', 'Raiwind', 'Khan Ghar', 'Pattoki', 'Karor Lal Easan',
            'Minchinabad', 'Qaidabad', 'Ranipur', 'Barikot', 'Kamoke',
            'Sharaqpur Sharif', 'Hattar', 'Taunsa Sharif', 'Phalia',
            'Jhawarian', 'Bunner', 'Haveli Lakha', 'Chashma', 'RUBWA',
            'Tandlianwala', 'Lala Musa', 'Tibba Sultanpura', 'Bhara Kahu',
            'Taxla', 'Pano Aqil', 'Hujra Shah Mukeem', 'Peer Mahal',
            'Dharanwala', 'Jalalpurpirwala', 'Bhera', 'Abdul Hakeem',
            'Zahir Pir', 'Gambat', 'Joharabad', 'Alipur', 'Kot Abdul Malik',
            'Risal Pur', 'Kand Kot', 'Narang Mandi', 'Kot Momin', 'Uch Sharif',
            'Kallar Kahar', 'Talagung', 'Dera Ala Yar', 'Pabi', 'Easakhel',
            'Jand', 'Hasil Pur', 'Rani Pur', 'Bhalwaal', 'Ahmedpur Sial',
            'Samandari', 'Liaqat Pur', 'Patoki', 'Hub Chowki', 'Sari Alamgir',
            'Ghazi', 'Tibba Sultanpura', 'Yazman Mandi', 'Kabirwala',
            'Kallar Saydian', 'Mandian', 'Tanda', 'Sohawa', 'Qila Deedar Sing',
            'Khan Ghar', 'Piplan', 'Kot Samabah', 'Khaur', 'Rawat',
            'Sharaqpur Shari', 'Ghakkar Mandi', 'Kamra', 'Deharki', 'Kala Bagh',
            'Abdul Hakim', 'Chowk Sarwar Shaheed', 'Saidu Sharif', 'Nowshera Virkan',
            'Sambrial', 'Chak Jhumra', 'Kundian', 'Basirpur', 'Bhowana',
            'Shorkot Cantonment', 'Chakswari', 'Ladhana', 'Kallar Syeddan',
            'Shahpur Saddar', 'Chowk Azam', 'Khurrianwala', 'Kahuta',
            'Alipur Chatha', 'Samundari', 'Karianwala', 'Korangi Karachi',
            'Phool Nagar', 'Jahania', 'Jalalpur Bhattian', 'New Jatoi',
            'Daudkhel', 'Minchin Abad', 'Shorkot Cantt.', 'Kunjah', 'Noorpur',
            'Multan Khurd', 'Tank', 'Saraye Norang', 'Bewal', 'Safdarabad',
            'Behal', 'Sangla Hill', 'Mandra', 'Hajiwala', 'Noorpur Thal',
            'Khairpur Tamewali', 'Khanpur Meher', 'Khangarh'
        ];

        foreach ($punjabCities as $cityName) {
            $citiesToInsert[] = [
                'state_id'         => $punjabId,
                'name'             => $cityName,
                'shipping_charges' => 250,
                'province'         => 'punjab',
                'created_at'       => now(),
                'updated_at'       => now(),
            ];
        }

        // Insert using insertOrIgnore to avoid duplicates
        DB::table('cities')->insertOrIgnore($citiesToInsert);

        $this->command->info('Cities seeded successfully! (Total: ' . count($citiesToInsert) . ' cities)');
    }
}