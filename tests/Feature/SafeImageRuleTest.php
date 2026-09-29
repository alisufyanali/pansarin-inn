<?php

use App\Rules\SafeImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

// 1x1 transparent PNG — real image bytes, no GD/fileinfo needed
function tinyPng(string $name = 'a.png'): UploadedFile
{
    $tmp = tempnam(sys_get_temp_dir(), 'img');
    file_put_contents($tmp, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));
    return new UploadedFile($tmp, $name, null, null, true);
}

function fakeFile(string $name, string $content): UploadedFile
{
    $tmp = tempnam(sys_get_temp_dir(), 'up');
    file_put_contents($tmp, $content);
    return new UploadedFile($tmp, $name, null, null, true);
}

$passes = fn ($file, $rule = null) => Validator::make(['f' => $file], ['f' => ['file', $rule ?? new SafeImage()]])->passes();

it('accepts a real png', fn () => expect($passes(tinyPng()))->toBeTrue());

it('rejects a php file renamed to .png', fn () =>
    expect($passes(fakeFile('shell.png', '<?php echo 1;')))->toBeFalse());

it('rejects disallowed extension even with image bytes', fn () =>
    expect($passes(tinyPng('shell.php')))->toBeFalse());

it('respects a custom extension whitelist', fn () =>
    expect($passes(tinyPng('a.png'), new SafeImage(['jpg'])))->toBeFalse());

it('accepts clean svg only when whitelisted', function () use ($passes) {
    $svg = fakeFile('i.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    expect($passes($svg))->toBeFalse();
    expect($passes($svg, new SafeImage(['svg'])))->toBeTrue();
});

it('rejects svg with script', fn () =>
    expect($passes(fakeFile('x.svg', '<svg><script>alert(1)</script></svg>'), new SafeImage(['svg'])))->toBeFalse());

// ── SVG hardening: each payload must be rejected ─────────────────────
dataset('malicious svgs', [
    'script tag'           => ['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'],
    'uppercase SCRIPT'     => ['<svg xmlns="http://www.w3.org/2000/svg"><SCRIPT>alert(1)</SCRIPT></svg>'],
    'onload handler'       => ['<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>'],
    'foreignObject html'   => ['<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><iframe xmlns="http://www.w3.org/1999/xhtml" src="https://evil"/></foreignObject></svg>'],
    'xlink javascript'     => ['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href="javascript:alert(1)"><rect width="9" height="9"/></a></svg>'],
    'obfuscated js href'   => ['<svg xmlns="http://www.w3.org/2000/svg"><a href="java&#x09;script:alert(1)"><rect/></a></svg>'],
    'external use'         => ['<svg xmlns="http://www.w3.org/2000/svg"><use href="https://evil.example/x.svg#a"/></svg>'],
    'set href animation'   => ['<svg xmlns="http://www.w3.org/2000/svg"><a><set attributeName="href" to="javascript:alert(1)"/><rect/></a></svg>'],
    'xxe entity'           => ['<?xml version="1.0"?><!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg xmlns="http://www.w3.org/2000/svg"><text>&x;</text></svg>'],
    'xml-stylesheet PI'    => ['<?xml-stylesheet href="https://evil/x.xsl"?><svg xmlns="http://www.w3.org/2000/svg"/>'],
    'style import'         => ['<svg xmlns="http://www.w3.org/2000/svg"><style>@import url(https://evil/x.css);</style></svg>'],
    'css external url'     => ['<svg xmlns="http://www.w3.org/2000/svg"><rect style="fill:url(https://evil/track)"/></svg>'],
    'html not svg'         => ['<html><body><svg></svg><script>alert(1)</script></body></html>'],
    'script after padding' => ['<svg xmlns="http://www.w3.org/2000/svg"><desc>' . str_repeat('a', 600 * 1024) . '</desc><script>alert(1)</script></svg>'],
]);

it('rejects malicious svg', function (string $svg) {
    expect(SafeImage::isSafeSvg($svg))->toBeFalse();
})->with('malicious svgs');

it('accepts a realistic icon svg with gradient + internal refs', function () {
    $svg = <<<'SVG'
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">
  <defs><linearGradient id="g"><stop offset="0" stop-color="#2e7d32"/></linearGradient>
  <path id="leaf" d="M12 2C7 7 5 12 12 22"/></defs>
  <style>.a{fill:url(#g)}</style>
  <use xlink:href="#leaf" class="a"/>
  <circle cx="12" cy="12" r="3" style="fill:url('#g')"/>
</svg>
SVG;
    expect(SafeImage::isSafeSvg($svg))->toBeTrue();
});
