<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sale Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
        }
        .details {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f5f5f5;
            font-weight: bold;
        }
        .total-row {
            font-weight: bold;
            font-size: 1.2em;
            background: #f0f0f0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Purchase Confirmation</h1>
        <p>Thank you for your purchase!</p>
    </div>

    <div class="content">
        <p>Dear {{ $sale->customer->first_name }} {{ $sale->customer->last_name }},</p>
        
        <p>We're excited to confirm your purchase. Here are the details:</p>

        <div class="details">
            <p><strong>Sale Code:</strong> {{ $sale->sale_code }}</p>
            <p><strong>Date:</strong> {{ $sale->created_at->format('d M, Y h:i A') }}</p>
            <p><strong>Payment Status:</strong> {{ ucfirst(str_replace('_', ' ', $sale->payment_status)) }}</p>
            <p><strong>Delivery Status:</strong> {{ ucfirst($sale->delivery_status) }}</p>
        </div>

        <h3>Items Purchased:</h3>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($sale->items as $item)
                <tr>
                    <td>
                        {{ $item->meta['product_name'] ?? ($item->product?->name ?? '—') }}
                        @if(isset($item->meta['variant_name']))
                            <br><small>({{ $item->meta['variant_name'] }})</small>
                        @endif
                    </td>
                    <td>{{ $item->quantity }}</td>
                    <td>PKR {{ number_format($item->price, 2) }}</td>
                    <td>PKR {{ number_format($item->subtotal, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <table>
            <tr>
                <td style="text-align: right;"><strong>Subtotal:</strong></td>
                <td style="text-align: right;">PKR {{ number_format($sale->subtotal, 2) }}</td>
            </tr>
            @if($sale->product_discount > 0)
            <tr>
                <td style="text-align: right;"><strong>Product Discount:</strong></td>
                <td style="text-align: right; color: red;">- PKR {{ number_format($sale->product_discount, 2) }}</td>
            </tr>
            @endif
            @if($sale->invoice_discount > 0)
            <tr>
                <td style="text-align: right;"><strong>Invoice Discount:</strong></td>
                <td style="text-align: right; color: red;">- PKR {{ number_format($sale->invoice_discount, 2) }}</td>
            </tr>
            @endif
            @if($sale->shipping_charges > 0)
            <tr>
                <td style="text-align: right;"><strong>Shipping Charges:</strong></td>
                <td style="text-align: right;">+ PKR {{ number_format($sale->shipping_charges, 2) }}</td>
            </tr>
            @endif
            @if($sale->vat > 0)
            <tr>
                <td style="text-align: right;"><strong>VAT:</strong></td>
                <td style="text-align: right;">+ PKR {{ number_format($sale->vat, 2) }}</td>
            </tr>
            @endif
            <tr class="total-row">
                <td style="text-align: right;"><strong>Grand Total:</strong></td>
                <td style="text-align: right;">PKR {{ number_format($sale->grand_total, 2) }}</td>
            </tr>
        </table>

        @if($sale->shipping_address)
        <div class="details">
            <h4>Shipping Address:</h4>
            <p>{{ $sale->shipping_address }}</p>
        </div>
        @endif

        <p>If you have any questions, please feel free to reach out to us.</p>
    </div>

    <div class="footer">
        <p>Thank you for shopping with Pansari Inn!</p>
        <p>&copy; {{ date('Y') }} Pansari Inn. All rights reserved.</p>
    </div>
</body>
</html>
