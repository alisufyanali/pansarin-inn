@props(['label' => null])
{{--
    Size / variant of an invoice line as a clear green pill, e.g. "50 gm · Powder".
    Variant labels come as "50 gm / Powder" (ProductVariant::labelFor) — shown with " · ".
--}}
@php
    $parts = collect(explode('/', (string) $label))->map(fn ($p) => trim($p))->filter()->values();
@endphp
@if($parts->isNotEmpty())
<span style="display:inline-block;margin-top:5px;padding:3px 9px;border-radius:12px;
             background-color:#e8f5e9;border:1px solid #a5d6a7;color:#1b5e20;
             font-size:12px;font-weight:700;line-height:1.4;white-space:nowrap;">
    {{ $parts->join(' · ') }}
</span>
@endif
