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
