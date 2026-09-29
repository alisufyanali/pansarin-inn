<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

/**
 * Image validation that does NOT depend on the php `fileinfo` extension.
 *
 * Laravel's built-in `image` / `mimes` rules call Symfony MimeTypes, which
 * throws a LogicException when fileinfo is missing (Hostinger shared hosting).
 * This rule instead checks:
 *   1. extension whitelist (client extension, lower-cased)
 *   2. real content: getimagesize() for raster images (core PHP, no fileinfo)
 *   3. SVG (only if whitelisted): must look like SVG and contain no script/handlers
 */
class SafeImage implements ValidationRule
{
    private const DEFAULT = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    /** @param string[] $extensions */
    public function __construct(private array $extensions = self::DEFAULT)
    {
        $this->extensions = array_map('strtolower', $extensions);
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile || ! $value->isValid()) {
            $fail('The :attribute must be a valid uploaded image.');
            return;
        }

        $ext = strtolower($value->getClientOriginalExtension());
        if ($ext === '' || ! in_array($ext, $this->extensions, true)) {
            $fail('The :attribute must be a file of type: ' . implode(', ', $this->extensions) . '.');
            return;
        }

        $path = $value->getRealPath();

        if ($ext === 'svg') {
            if ($path === false || ! self::isSafeSvg((string) @file_get_contents($path))) {
                $fail('The :attribute must be a safe SVG image.');
            }
            return;
        }

        if ($path === false || @getimagesize($path) === false) {
            $fail('The :attribute must be an image.');
        }
    }

    /** Elements that can execute script or embed foreign documents. */
    private const SVG_BANNED_ELEMENTS = [
        'script', 'foreignobject', 'iframe', 'embed', 'object', 'handler',
        'listener', 'audio', 'video', 'meta', 'link', 'base',
    ];

    /**
     * Structural SVG check (DOM, not regex). Requires ext-dom (bundled with PHP),
     * not fileinfo. Rejects rather than sanitizes — a rejected icon is re-exported,
     * a mis-sanitized one is stored XSS on our own origin.
     */
    public static function isSafeSvg(string $content): bool
    {
        if ($content === '' || strlen($content) > 2 * 1024 * 1024) {
            return false;
        }
        // DTD/entities → XXE and billion-laughs. Icons never need them.
        if (preg_match('/<!DOCTYPE|<!ENTITY/i', $content)) {
            return false;
        }

        $prev = libxml_use_internal_errors(true);
        $dom  = new \DOMDocument();
        $ok   = $dom->loadXML($content, LIBXML_NONET | LIBXML_COMPACT);
        libxml_clear_errors();
        libxml_use_internal_errors($prev);

        if (! $ok || ! $dom->documentElement || strtolower($dom->documentElement->localName) !== 'svg') {
            return false;
        }

        $xpath = new \DOMXPath($dom);

        // xml-stylesheet and any other processing instruction
        if ($xpath->query('//processing-instruction()')->length > 0) {
            return false;
        }

        foreach ($xpath->query('//*') as $el) {
            /** @var \DOMElement $el */
            $name = strtolower($el->localName);

            if (in_array($name, self::SVG_BANNED_ELEMENTS, true)) {
                return false;
            }
            if ($name === 'style' && ! self::isSafeCss($el->textContent)) {
                return false;
            }
            // <set>/<animate> can rewrite href to javascript: at runtime
            if (in_array($name, ['set', 'animate', 'animatetransform', 'animatemotion'], true)) {
                $target = strtolower((string) $el->getAttribute('attributeName'));
                if (str_contains($target, 'href') || str_starts_with($target, 'on')) {
                    return false;
                }
            }

            foreach ($el->attributes as $attr) {
                $attrName = strtolower($attr->localName);
                $value    = trim(preg_replace('/[\x00-\x20]+/', '', $attr->value)); // strip whitespace/control obfuscation
                $lower    = strtolower($value);

                if (str_starts_with($attrName, 'on')) {
                    return false;
                }
                if ($attrName === 'href' || $attrName === 'src') {
                    // only same-document fragments or inline raster images
                    $isFragment = str_starts_with($value, '#');
                    $isRaster   = (bool) preg_match('#^data:image/(png|jpe?g|gif|webp);base64,#', $lower);
                    if (! $isFragment && ! $isRaster) {
                        return false;
                    }
                }
                if ($attrName === 'style' && ! self::isSafeCss($attr->value)) {
                    return false;
                }
                if (str_contains($lower, 'javascript:') || str_contains($lower, 'vbscript:')
                    || str_contains($lower, 'data:text/html')) {
                    return false;
                }
            }
        }

        return true;
    }

    private static function isSafeCss(string $css): bool
    {
        $css = strtolower(preg_replace('/\s+|\/\*.*?\*\//s', '', $css));
        if (str_contains($css, '@import') || str_contains($css, 'expression(')
            || str_contains($css, 'javascript:') || str_contains($css, 'behavior:')) {
            return false;
        }
        // url(...) only to local fragments, e.g. fill:url(#gradient)
        if (preg_match_all('/url\(([^)]*)\)/', $css, $m)) {
            foreach ($m[1] as $u) {
                if (! str_starts_with(trim($u, "'\""), '#')) {
                    return false;
                }
            }
        }

        return true;
    }
}
