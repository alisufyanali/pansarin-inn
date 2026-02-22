<?php

// database/seeders/WhatsAppMediaSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class WhatsAppMediaSeeder extends Seeder
{
    /**
     * Create dummy media files for testing WhatsApp chat
     */
    public function run(): void
    {
        // Create whatsapp directory if not exists
        if (! Storage::disk('public')->exists('whatsapp')) {
            Storage::disk('public')->makeDirectory('whatsapp');
        }

        $whatsappPath = storage_path('app/public/whatsapp');

        // 1. Create dummy payment screenshot (image)
        $this->createDummyImage($whatsappPath.'/media_1704723456.jpg');

        // 2. Create dummy audio file (voice message)
        $this->createDummyAudio($whatsappPath.'/media_1704723457.ogg');

        // 3. Create dummy document
        $this->createDummyDocument($whatsappPath.'/media_1704723458.pdf');

        $this->command->info('Dummy media files created successfully!');
        $this->command->info('Location: storage/app/public/whatsapp/');
    }

    /**
     * Create a dummy image file (payment screenshot)
     */
    private function createDummyImage($path)
    {
        // Create a simple colored rectangle as dummy image
        $width = 400;
        $height = 600;
        $image = imagecreatetruecolor($width, $height);

        // Background color (light gray)
        $bgColor = imagecolorallocate($image, 240, 240, 240);
        imagefill($image, 0, 0, $bgColor);

        // Header color (green for payment)
        $headerColor = imagecolorallocate($image, 37, 211, 102);
        imagefilledrectangle($image, 0, 0, $width, 80, $headerColor);

        // White text color
        $white = imagecolorallocate($image, 255, 255, 255);
        $black = imagecolorallocate($image, 0, 0, 0);

        // Add text
        imagestring($image, 5, 120, 30, 'PAYMENT RECEIPT', $white);
        imagestring($image, 3, 50, 120, 'Transaction ID: TXN-123456789', $black);
        imagestring($image, 3, 50, 160, 'Amount: Rs. 2,500.00', $black);
        imagestring($image, 3, 50, 200, 'Date: '.date('Y-m-d H:i:s'), $black);
        imagestring($image, 3, 50, 240, 'Status: SUCCESS', $black);
        imagestring($image, 3, 50, 300, 'Payment Method: JazzCash', $black);
        imagestring($image, 3, 50, 340, 'Reference: REF-987654', $black);

        // Add green checkmark (success indicator)
        $green = imagecolorallocate($image, 37, 211, 102);
        imagefilledellipse($image, 200, 450, 100, 100, $green);

        // Save image
        imagejpeg($image, $path, 90);
        imagedestroy($image);

        $this->command->info('✓ Created: media_1704723456.jpg (Payment Screenshot)');
    }

    /**
     * Create a dummy audio file
     */
    private function createDummyAudio($path)
    {
        // Create a minimal valid OGG audio file header
        // This is a silent audio file
        $oggHeader = pack('C*',
            0x4F, 0x67, 0x67, 0x53, 0x00, 0x02, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00
        );

        file_put_contents($path, $oggHeader);

        $this->command->info('✓ Created: media_1704723457.ogg (Voice Message)');
    }

    /**
     * Create a dummy PDF document
     */
    private function createDummyDocument($path)
    {
        // Minimal valid PDF content
        $pdfContent = "%PDF-1.4\n";
        $pdfContent .= "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
        $pdfContent .= "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
        $pdfContent .= "3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n";
        $pdfContent .= "4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Order Details) Tj\nET\nendstream\nendobj\n";
        $pdfContent .= "xref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000314 00000 n\n";
        $pdfContent .= "trailer\n<< /Size 5 /Root 1 0 R >>\n";
        $pdfContent .= "startxref\n408\n%%EOF";

        file_put_contents($path, $pdfContent);

        $this->command->info('✓ Created: media_1704723458.pdf (Order Document)');
    }
}
