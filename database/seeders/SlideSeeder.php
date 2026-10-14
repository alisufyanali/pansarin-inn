<?php

namespace Database\Seeders;

use App\Models\Slide;
use Illuminate\Database\Seeder;

class SlideSeeder extends Seeder
{
    public function run(): void
    {
        $slides = [
            // Desktop slides
            ['type' => 'desktop', 
            'title' => 'Pure Herbal Products',       
            'subtitle' => 'Discover the power of nature with our premium herbal collection',  
            'image' => 'slides/Pansari Inn Web Bannner 1.png', 
            'btn_text' => 'Shop Now',     
            'btn_url' => '/shop',          
            'sort_order' => 1, 
            'is_active' => true],
            ['type' => 'desktop', 
            'title' => 'Kalonji — Black Seed Oil',   
            'subtitle' => 'The miracle herb used for centuries in traditional medicine',       
            'image' => 'slides/Pansari Inn Web Bannner 2.png', 
            'btn_text' => 'Learn More',   
            'btn_url' => '/products/kalonji', 
            'sort_order' => 2, 
            'is_active' => true],
            ['type' => 'desktop', 
            'title' => 'Summer Sale — Up to 25% Off',
            'subtitle' => 'Limited time offer on selected herbal products',                    
            'image' => 'slides/Pansari Inn Web Bannner 3.png', 
            'btn_text' => 'View Deals',   
            'btn_url' => '/offers',         
            'sort_order' => 3, 
            'is_active' => true],
            ['type' => 'desktop', 
            'title' => 'Summer Sale — Up to 25% Off',
            'subtitle' => 'Limited time offer on selected herbal products',                    
            'image' => 'slides/Pansari Inn Web Bannner 4.png', 
            'btn_text' => 'View Deals',   
            'btn_url' => '/offers',         
            'sort_order' => 3, 
            'is_active' => true],
            ['type' => 'desktop', 
            'title' => 'Summer Sale — Up to 25% Off',
            'subtitle' => 'Limited time offer on selected herbal products',                    
            'image' => 'slides/Pansari Inn Web Bannner 5.png', 
            'btn_text' => 'View Deals',   
            'btn_url' => '/offers',         
            'sort_order' => 3, 
            'is_active' => true],

            // Mobile slides
            ['type' => 'mobile',  
            'title' => 'Pure Herbal Products',       
            'subtitle' => 'Premium quality herbs delivered to your door',                      
            'image' => 'slides/Pansari Inn Web Bannner 1 mobile.png', 
            'btn_text' => 'Shop Now',     
            'btn_url' => '/shop',          
            'sort_order' => 1, 
            'is_active' => true],
            ['type' => 'mobile',  
            'title' => 'Kalonji Oil',                
            'subtitle' => 'The miracle herb for health & wellness',                            
            'image' => 'slides/Pansari Inn Web Bannner 2 mobile.png', 
            'btn_text' => 'Buy Now',      
            'btn_url' => '/shop', 
            'sort_order' => 2, 
            'is_active' => true],
            ['type' => 'mobile',  
            'title' => 'Summer Sale 25% Off',        
            'subtitle' => 'Limited time offer on herbal products',                             
            'image' => 'slides/Pansari Inn Web Bannner 3 mobile.png', 
            'btn_text' => 'View Deals',   
            'btn_url' => '/shop',         
            'sort_order' => 3, 
            'is_active' => true],
            ['type' => 'mobile',  
            'title' => 'Summer Sale 25% Off',        
            'subtitle' => 'Limited time offer on herbal products',                             
            'image' => 'slides/Pansari Inn Web Bannner 4 mobile.png', 
            'btn_text' => 'View Deals',   
            'btn_url' => '/shop',         
            'sort_order' => 3, 
            'is_active' => true],
            ['type' => 'mobile',  
            'title' => 'Summer Sale 25% Off',        
            'subtitle' => 'Limited time offer on herbal products',                             
            'image' => 'slides/Pansari Inn Web Bannner 5 mobile.png', 
            'btn_text' => 'View Deals',   
            'btn_url' => '/shop',         
            'sort_order' => 3, 
            'is_active' => true],
        ];

        // Fresh start: remove every old slide, then add these (titles repeat, so no firstOrCreate)
        Slide::query()->delete();

        $order = ['desktop' => 0, 'mobile' => 0];
        foreach ($slides as $slide) {
            $slide['sort_order'] = ++$order[$slide['type']];   // 1, 2, 3… per type, in the order listed
            Slide::create($slide);
        }

        $this->command->info('Slides seeded successfully!');
    }
}
