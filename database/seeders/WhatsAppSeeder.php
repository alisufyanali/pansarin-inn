<?php

// database/seeders/WhatsAppSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WhatsappMessage;
use App\Models\WhatsappMessageLog;
use Carbon\Carbon;

class WhatsAppSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        WhatsappMessage::truncate();
        WhatsappMessageLog::truncate();

        // Customer 1: Active conversation (recent)
        $this->createConversation1();

        // Customer 2: Order inquiry
        $this->createConversation2();

        // Customer 3: Old conversation with media
        $this->createConversation3();

        // Customer 4: Multiple orders
        $this->createConversation4();

        // Customer 5: Unread messages
        $this->createConversation5();

        $this->command->info('WhatsApp dummy data seeded successfully!');
    }

    /**
     * Conversation 1: Recent active chat with Ahmad
     */
    private function createConversation1()
    {
        $phone = '923001234567';
        $customerName = 'Ahmad Khan';
        
        // Day 1 - Order placed
        $time1 = Carbon::now()->subDays(2)->setTime(10, 30);
        
        // Sent: Order confirmation
        WhatsappMessageLog::create([
            'phone' => $phone,
            'customer_name' => $customerName,
            'order_id' => 'ORD-2024-001',
            'order_total' => 2500.00,
            'delivery_address' => 'House 123, Street 5, Gulshan-e-Iqbal, Karachi',
            'messages' => "Dear Ahmad Khan,\n\nYour order ORD-2024-001 has been confirmed!\n\nTotal: Rs. 2,500.00\nDelivery Address: House 123, Street 5, Gulshan-e-Iqbal, Karachi\n\nThank you for shopping with us!",
            'api_response' => json_encode(['success' => true]),
            'created_at' => $time1,
        ]);

        // Received: Customer question (30 min later)
        WhatsappMessage::create([
            'from_number' => $phone,
            'message' => 'Assalam o Alaikum, order kitne din mein deliver hoga?',
            'media_url' => null,
            'is_read' => true,
            'received_at' => $time1->copy()->addMinutes(30),
        ]);

        // Sent: Reply (5 min later)
        WhatsappMessageLog::create([
            'phone' => $phone,
            'customer_name' => 'Manual',
            'order_id' => 'Manual-5678',
            'order_total' => 0,
            'delivery_address' => '',
            'messages' => 'Walaikum Assalam! Apka order 2-3 working days mein deliver ho jayega. Track karne ke liye website check kar sakte hain.',
            'api_response' => json_encode(['success' => true]),
            'created_at' => $time1->copy()->addMinutes(35),
        ]);

        // Received: Thanks (10 min later)
        WhatsappMessage::create([
            'from_number' => $phone,
            'message' => 'JazakAllah! Bohat shukriya 😊',
            'media_url' => null,
            'is_read' => true,
            'received_at' => $time1->copy()->addMinutes(45),
        ]);

        // Day 2 - Follow up
        $time2 = Carbon::now()->subDay()->setTime(14, 0);
        
        // Received: Payment confirmation
        WhatsappMessage::create([
            'from_number' => $phone,
            'message' => 'Payment kr di hai. Attachment dekh lein',
            'media_url' => null,
            'is_read' => true,
            'received_at' => $time2,
        ]);

        // Received: Image
        WhatsappMessage::create([
            'from_number' => $phone,
            'message' => 'IMAGE RECEIVED',
            'media_url' => 'media_1704723456.jpg', // Dummy image
            'is_read' => true,
            'received_at' => $time2->copy()->addSeconds(5),
        ]);

        // Sent: Confirmation
        WhatsappMessageLog::create([
            'phone' => $phone,
            'customer_name' => 'Manual',
            'order_id' => 'Manual-5679',
            'order_total' => 0,
            'delivery_address' => '',
            'messages' => 'Payment confirm ho gayi hai! Order tomorrow dispatch hoga. Thank you! 👍',
            'api_response' => json_encode(['success' => true]),
            'created_at' => $time2->copy()->addMinutes(10),
        ]);

        // Today - Delivery update
        $time3 = Carbon::now()->subHours(2);
        
        // Sent: Delivery notification
        WhatsappMessageLog::create([
            'phone' => $phone,
            'customer_name' => 'Manual',
            'order_id' => 'Manual-5680',
            'order_total' => 0,
            'delivery_address' => '',
            'messages' => "🚚 Your order is out for delivery!\n\nRider: Muhammad Ali\nContact: 0300-9876543\n\nExpected delivery: Today by 6 PM",
            'api_response' => json_encode(['success' => true]),
            'created_at' => $time3,
        ]);

        // Received: Recent message (1 hour ago)
        WhatsappMessage::create([
            'from_number' => $phone,
            'message' => 'Order mil gaya! Bohat acha packing tha. Thank you so much! 🎉',
            'media_url' => null,
            'is_read' => true,
            'received_at' => Carbon::now()->subHour(),
        ]);
    }

    /**
     * Conversation 2: New order inquiry from Fatima
     */
    private function createConversation2()
    {
        $phone = '923112345678';
        $customerName = 'Fatima Ahmed';
        
        $time1 = Carbon::now()->subHours(5);

        // Received: Product inquiry
        WhatsappMessage::create([
            'from_number' => $phone,
            'message' => 'Salam, mujhe apki Rice ki details chahiye. Kya prices hain?',
            'media_url' => null,
            'is_read' => false, // Unread
            'received_at' => $time1,
        ]);

        // Received: Follow up
        WhatsappMessage::create([
            'from_number' => $phone,
            'message' => '10kg ka bag available hai?',
            'media_url' => null,
            'is_read' => false, // Unread
            'received_at' => $time1->copy()->addMinutes(15),
        ]);
    }

    /**
     * Conversation 3: Old customer with media - Bilal
     */
    private function createConversation3()
    {
        $phone = '923331234567';
        $customerName = 'Bilal Hassan';
        
        // 5 days ago
        $time1 = Carbon::now()->subDays(5)->setTime(11, 0);

        // Sent: Order confirmation
        WhatsappMessageLog::create([
            'phone' => $phone,
            'customer_name' => $customerName,
            'order_id' => 'ORD-2024-002',
            'order_total' => 3200.00,
            'delivery_address' => 'Flat 5B, Ocean Tower, Clifton, Karachi',
            'messages' => "Dear Bilal Hassan,\n\nYour order ORD-2024-002 has been confirmed!\n\nTotal: Rs. 3,200.00\nDelivery Address: Flat 5B, Ocean Tower, Clifton, Karachi\n\nThank you!",
            'api_response' => json_encode(['success' => true]),
            'created_at' => $time1,
        ]);

        // Received: Question about product
        WhatsappMessage::create([
            'from_number' => $phone,
            'message' => 'Yeh jo spices order ki hain, unki expiry date kya hai?',
            'media_url' => null,
            'is_read' => true,
            'received_at' => $time1->copy()->addHours(2),
        ]);

        // Sent: Reply
        WhatsappMessageLog::create([
            'phone' => $phone,
            'customer_name' => 'Manual',
            'order_id' => 'Manual-1234',
            'order_total' => 0,
            'delivery_address' => '',
            'messages' => 'Tamam products fresh hain. Expiry date 12 months hai. Invoice pe bhi mentioned hogi.',
            'api_response' => json_encode(['success' => true]),
            'created_at' => $time1->copy()->addHours(2)->addMinutes(10),
        ]);

        // 4 days ago - Received audio message
        WhatsappMessage::create([
            'from_number' => $phone,
            'message' => 'AUDIO RECEIVED',
            'media_url' => 'media_1704723457.ogg',
            'is_read' => true,
            'received_at' => Carbon::now()->subDays(4)->setTime(15, 30),
        ]);

        // Sent: Reply to audio
        WhatsappMessageLog::create([
            'phone' => $phone,
            'customer_name' => 'Manual',
            'order_id' => 'Manual-1235',
            'order_total' => 0,
            'delivery_address' => '',
            'messages' => 'Ji bilkul! Aap jo bhi additional items chahiye wo add kar dein. Main order update kar deta hoon.',
            'api_response' => json_encode(['success' => true]),
            'created_at' => Carbon::now()->subDays(4)->setTime(15, 45),
        ]);
    }

    /**
     * Conversation 4: Regular customer - Sara (Multiple orders)
     */
    private function createConversation4()
    {
        $phone = '923451234567';
        $customerName = 'Sara Malik';
        
        // Order 1 - 10 days ago
        $time1 = Carbon::now()->subDays(10)->setTime(9, 0);
        
        WhatsappMessageLog::create([
            'phone' => $phone,
            'customer_name' => $customerName,
            'order_id' => 'ORD-2024-003',
            'order_total' => 1800.00,
            'delivery_address' => 'House 789, Block C, DHA Phase 5, Karachi',
            'messages' => "Dear Sara Malik,\n\nYour order ORD-2024-003 has been confirmed!\n\nTotal: Rs. 1,800.00\n\nThank you for being a valued customer!",
            'api_response' => json_encode(['success' => true]),
            'created_at' => $time1,
        ]);

        WhatsappMessage::create([
            'from_number' => $phone,
            'message' => 'Thank you! ❤️',
            'media_url' => null,
            'is_read' => true,
            'received_at' => $time1->copy()->addMinutes(20),
        ]);

        // Order 2 - 3 days ago
        $time2 = Carbon::now()->subDays(3)->setTime(14, 30);
        
        WhatsappMessageLog::create([
            'phone' => $phone,
            'customer_name' => $customerName,
            'order_id' => 'ORD-2024-004',
            'order_total' => 4500.00,
            'delivery_address' => 'House 789, Block C, DHA Phase 5, Karachi',
            'messages' => "Dear Sara Malik,\n\nYour order ORD-2024-004 has been confirmed!\n\nTotal: Rs. 4,500.00\n\nWe appreciate your continued support!",
            'api_response' => json_encode(['success' => true]),
            'created_at' => $time2,
        ]);

        WhatsappMessage::create([
            'from_number' => $phone,
            'message' => 'Is baar biryani masala ki quantity zyada bhejna please 😊',
            'media_url' => null,
            'is_read' => true,
            'received_at' => $time2->copy()->addMinutes(10),
        ]);

        WhatsappMessageLog::create([
            'phone' => $phone,
            'customer_name' => 'Manual',
            'order_id' => 'Manual-3456',
            'order_total' => 0,
            'delivery_address' => '',
            'messages' => 'Sure Sara! Extra pack add kar di hai complimentary. Enjoy! 🎁',
            'api_response' => json_encode(['success' => true]),
            'created_at' => $time2->copy()->addMinutes(15),
        ]);

        // Recent message - Yesterday
        WhatsappMessage::create([
            'from_number' => $phone,
            'message' => 'Masala bohat acha tha! Next month phir order karungi InshaAllah',
            'media_url' => null,
            'is_read' => true,
            'received_at' => Carbon::yesterday()->setTime(18, 0),
        ]);
    }

    /**
     * Conversation 5: Pending/Unread messages - Usman
     */
    private function createConversation5()
    {
        $phone = '923219876543';
        $customerName = 'Usman Ali';
        
        // Yesterday - Order sent
        $time1 = Carbon::yesterday()->setTime(16, 0);
        
        WhatsappMessageLog::create([
            'phone' => $phone,
            'customer_name' => $customerName,
            'order_id' => 'ORD-2024-005',
            'order_total' => 2100.00,
            'delivery_address' => 'Shop 23, Tariq Road, Karachi',
            'messages' => "Dear Usman Ali,\n\nYour order ORD-2024-005 has been confirmed!\n\nTotal: Rs. 2,100.00\nDelivery Address: Shop 23, Tariq Road, Karachi",
            'api_response' => json_encode(['success' => true]),
            'created_at' => $time1,
        ]);

        // Today - Unread messages
        $time2 = Carbon::now()->subHours(3);
        
        WhatsappMessage::create([
            'from_number' => $phone,
            'message' => 'Bhai order kab tak aayega? Urgent chahiye tha',
            'media_url' => null,
            'is_read' => false, // UNREAD
            'received_at' => $time2,
        ]);

        WhatsappMessage::create([
            'from_number' => $phone,
            'message' => 'Please reply karo',
            'media_url' => null,
            'is_read' => false, // UNREAD
            'received_at' => $time2->copy()->addMinutes(30),
        ]);

        WhatsappMessage::create([
            'from_number' => $phone,
            'message' => 'Contact number do rider ka?',
            'media_url' => null,
            'is_read' => false, // UNREAD
            'received_at' => $time2->copy()->addHour(),
        ]);
    }
}

 