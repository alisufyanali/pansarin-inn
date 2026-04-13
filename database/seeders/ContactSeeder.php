<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Database\Seeder;

class ContactSeeder extends Seeder
{
    public function run(): void
    {
        $adminUser = User::where('email', 'admin@admin.com')->first();

        $statuses = ['new', 'read', 'replied', 'resolved', 'spam'];

        $contacts = [
            ['name' => 'Ali Hassan',      'email' => 'ali.hassan@gmail.com',    'phone' => '03001234567', 'subject' => 'Product Inquiry',         'message' => 'I would like to know more about your products. Can you provide a detailed catalog?'],
            ['name' => 'Sara Ahmed',      'email' => 'sara.ahmed@yahoo.com',    'phone' => '03111234567', 'subject' => 'Order Issue',              'message' => 'I placed an order last week but have not received it yet. Can you help me track it?'],
            ['name' => 'Usman Khan',      'email' => 'usman.khan@hotmail.com',  'phone' => '03211234567', 'subject' => 'Shipping Question',        'message' => 'What are your shipping charges to Lahore? How long does delivery usually take?'],
            ['name' => 'Fatima Malik',    'email' => 'fatima.malik@gmail.com',  'phone' => '03321234567', 'subject' => 'Payment Problem',          'message' => 'I made a payment but did not receive a confirmation email. Please check my order.'],
            ['name' => 'Bilal Raza',      'email' => 'bilal.raza@gmail.com',    'phone' => '03451234567', 'subject' => 'Bulk Order Request',       'message' => 'Do you offer wholesale prices for bulk orders? I need around 50 units.'],
            ['name' => 'Ayesha Siddiqui', 'email' => 'ayesha.s@gmail.com',      'phone' => '03001112233', 'subject' => 'Technical Support',        'message' => 'Your website is not loading properly on my mobile phone. Please fix this issue.'],
            ['name' => 'Hamza Tariq',     'email' => 'hamza.tariq@yahoo.com',   'phone' => '03111112233', 'subject' => 'Complaint',                'message' => 'I received a defective product. How can I return it and get a refund?'],
            ['name' => 'Zainab Noor',     'email' => 'zainab.noor@gmail.com',   'phone' => '03211112233', 'subject' => 'Feedback',                 'message' => 'Great products and excellent service! Keep up the good work.'],
            ['name' => 'Kamran Sheikh',   'email' => 'kamran.sheikh@gmail.com', 'phone' => '03321112233', 'subject' => 'Partnership Opportunity',  'message' => 'I am interested in becoming a distributor in my area. Please contact me.'],
            ['name' => 'Nadia Iqbal',     'email' => 'nadia.iqbal@hotmail.com', 'phone' => '03451112233', 'subject' => 'General Question',         'message' => 'Can you provide customization options for your products?'],
            ['name' => 'Tariq Mehmood',   'email' => 'tariq.m@gmail.com',       'phone' => '03001234000', 'subject' => 'Product Inquiry',         'message' => 'I have some questions about product specifications. Please reply soon.'],
            ['name' => 'Sana Butt',       'email' => 'sana.butt@gmail.com',     'phone' => '03111234000', 'subject' => 'Complaint',                'message' => 'Your customer service is terrible. I have been waiting for a response for days!'],
            ['name' => 'Imran Javed',     'email' => 'imran.javed@yahoo.com',   'phone' => '03211234000', 'subject' => 'General Question',         'message' => 'Do you have this product available in different colors?'],
            ['name' => 'Rabia Farooq',    'email' => 'rabia.farooq@gmail.com',  'phone' => '03321234000', 'subject' => 'Order Issue',              'message' => 'I want to cancel my order. How can I do that?'],
            ['name' => 'Asad Nawaz',      'email' => 'asad.nawaz@gmail.com',    'phone' => '03451234000', 'subject' => 'Shipping Question',        'message' => 'Can you ship to Quetta? What will be the delivery time?'],
            ['name' => 'Hina Qureshi',    'email' => 'hina.q@gmail.com',        'phone' => '03009876543', 'subject' => 'Product Inquiry',         'message' => 'Are your products available in Karachi stores or only online?'],
            ['name' => 'Faisal Chaudhry', 'email' => 'faisal.c@yahoo.com',      'phone' => '03119876543', 'subject' => 'Payment Problem',          'message' => 'My payment was deducted twice. Please refund the extra amount.'],
            ['name' => 'Madiha Zahid',    'email' => 'madiha.z@gmail.com',      'phone' => '03219876543', 'subject' => 'Feedback',                 'message' => 'Very fast delivery and good packaging. Highly recommended!'],
            ['name' => 'Shahid Latif',    'email' => 'shahid.l@hotmail.com',    'phone' => '03329876543', 'subject' => 'Bulk Order Request',       'message' => 'We need 200 units for our company. Can you give us a corporate discount?'],
            ['name' => 'Amna Riaz',       'email' => 'amna.riaz@gmail.com',     'phone' => '03459876543', 'subject' => 'Technical Support',        'message' => 'I cannot log into my account. Please reset my password.'],
        ];

        foreach ($contacts as $index => $data) {
            $status = $statuses[$index % count($statuses)];
            $isReplied = in_array($status, ['replied', 'resolved']);
            $createdAt = now()->subDays(rand(1, 30));

            Contact::create([
                'name'        => $data['name'],
                'email'       => $data['email'],
                'phone'       => $data['phone'],
                'subject'     => $data['subject'],
                'message'     => $data['message'],
                'status'      => $status,
                'admin_reply' => $isReplied ? 'Thank you for contacting us. We have reviewed your query and will get back to you shortly.' : null,
                'replied_at'  => $isReplied ? $createdAt->copy()->addHours(rand(1, 24)) : null,
                'replied_by'  => $isReplied && $adminUser ? $adminUser->id : null,
                'ip_address'  => '192.168.1.'.rand(1, 255),
                'user_agent'  => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'referrer'    => rand(0, 1) ? 'https://google.com' : null,
                'created_at'  => $createdAt,
                'updated_at'  => $createdAt,
            ]);

            $this->command->info("Created contact from: {$data['name']} - Status: {$status}");
        }

        $this->command->info('Contact messages seeded successfully!');
    }
}
