<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\User;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class ContactSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        $statuses = ['new', 'read', 'replied', 'resolved', 'spam'];
        $subjects = [
            'Product Inquiry',
            'Order Issue',
            'Shipping Question',
            'Payment Problem',
            'General Question',
            'Technical Support',
            'Complaint',
            'Feedback',
            'Partnership Opportunity',
            'Bulk Order Request',
        ];

        $messages = [
            'I would like to know more about your products. Can you provide me with a detailed catalog?',
            'I placed an order last week but haven\'t received it yet. Can you help me track it?',
            'What are your shipping charges to Lahore? How long does delivery usually take?',
            'I made a payment but didn\'t receive a confirmation email. Please check my order status.',
            'Do you offer wholesale prices for bulk orders? I need around 50 units.',
            'Your website is not loading properly on my mobile phone. Please fix this issue.',
            'I received a defective product. How can I return it and get a refund?',
            'Great products and excellent service! Keep up the good work.',
            'I am interested in becoming a distributor in my area. Please contact me.',
            'Can you provide customization options for your products?',
            'I have some questions about product specifications. Please reply soon.',
            'Your customer service is terrible. I have been waiting for a response for days!',
            'Do you have this product available in different colors?',
            'I want to cancel my order. How can I do that?',
            'Can you ship to Quetta? What will be the delivery time?',
        ];

        // Get admin user for replied messages
        $adminUser = User::where('email', 'admin@admin.com')->first();

        for ($i = 0; $i < 20; $i++) {
            $status = $faker->randomElement($statuses);
            $createdAt = $faker->dateTimeBetween('-30 days', 'now');

            $contact = Contact::create([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'phone' => '03'.$faker->numerify('#########'),
                'subject' => $faker->randomElement($subjects),
                'message' => $faker->randomElement($messages),
                'status' => $status,
                'admin_reply' => ($status === 'replied' || $status === 'resolved')
                    ? 'Thank you for contacting us. '.$faker->sentence(15)
                    : null,
                'replied_at' => ($status === 'replied' || $status === 'resolved')
                    ? $faker->dateTimeBetween($createdAt, 'now')
                    : null,
                'replied_by' => ($status === 'replied' || $status === 'resolved') && $adminUser
                    ? $adminUser->id
                    : null,
                'ip_address' => $faker->ipv4,
                'user_agent' => $faker->userAgent,
                'referrer' => $faker->boolean(30) ? $faker->url : null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            $this->command->info("Created contact from: {$contact->name} - Status: {$status}");
        }

        $this->command->info('Contact messages seeded successfully!');
    }
}
