<?php
/**
 * POST /directseo/nextjs/returns/upload.php   (Next.js, X-Api-Token)
 * multipart/form-data: file (jpeg/png/webp)
 *
 * Zdjęcie do zgłoszenia trafia najpierw do katalogu tymczasowego (poza publicznym). Plik jest dekodowany
 * i zapisywany od nowa jako JPEG (to usuwa EXIF i wszystko, co nie jest obrazem). Odpowiedź: token pliku,
 * który create.php przenosi do katalogu zgłoszenia. Pliki starsze niż 24 h są usuwane.
 */

require_once __DIR__ . '/_lib.php';

const UPLOAD_MAX_BYTES = 6291456;   // 6 MB (przeglądarka i tak zmniejsza zdjęcia do ok. 0,5 MB)
const UPLOAD_MAX_SIDE = 1800;       // dłuższy bok po zapisaniu
const UPLOAD_MAX_PIXELS = 25000000; // ochrona pamięci przy dekodowaniu
const UPLOAD_MAX_STAGED = 800;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    returnsFail(405, 'Dozwolona tylko metoda POST');
}

if (!is_dir(RETURNS_STAGING_DIR)) {
    @mkdir(RETURNS_STAGING_DIR, 0750, true);
}

// sprzątanie: pliki tymczasowe starsze niż doba
$staged = glob(RETURNS_STAGING_DIR . '/*.jpg') ?: array();
foreach ($staged as $path) {
    if (@filemtime($path) < time() - 86400) {
        @unlink($path);
    }
}
if (count($staged) >= UPLOAD_MAX_STAGED) {
    returnsFail(503, 'Chwilowo nie można przyjąć zdjęć. Spróbuj ponownie później.');
}

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($_FILES['file']['tmp_name'])) {
    returnsFail(400, 'Nie udało się odebrać pliku');
}

$tmp = $_FILES['file']['tmp_name'];
if ($_FILES['file']['size'] > UPLOAD_MAX_BYTES) {
    returnsFail(413, 'Zdjęcie jest za duże (maksymalnie 6 MB)');
}

$info = @getimagesize($tmp);
$allowed = array(IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP);
if (!$info || !in_array($info[2], $allowed, true)) {
    returnsFail(415, 'Dozwolone są zdjęcia JPG, PNG lub WebP');
}
if ($info[0] * $info[1] > UPLOAD_MAX_PIXELS) {
    returnsFail(413, 'Zdjęcie ma za dużą rozdzielczość');
}

$image = @imagecreatefromstring(file_get_contents($tmp));
if (!$image) {
    returnsFail(415, 'Nie udało się odczytać zdjęcia');
}

$width = imagesx($image);
$height = imagesy($image);
$longest = max($width, $height);
if ($longest > UPLOAD_MAX_SIDE) {
    $scale = UPLOAD_MAX_SIDE / $longest;
    $scaled = imagescale($image, max(1, (int) round($width * $scale)), max(1, (int) round($height * $scale)));
    if ($scaled) {
        imagedestroy($image);
        $image = $scaled;
    }
}

// przezroczystość PNG -> białe tło (JPEG jej nie ma)
$canvas = imagecreatetruecolor(imagesx($image), imagesy($image));
imagefill($canvas, 0, 0, imagecolorallocate($canvas, 255, 255, 255));
imagecopy($canvas, $image, 0, 0, 0, 0, imagesx($image), imagesy($image));

$token = bin2hex(random_bytes(16));
$ok = imagejpeg($canvas, RETURNS_STAGING_DIR . '/' . $token . '.jpg', 85);
imagedestroy($image);
imagedestroy($canvas);

if (!$ok) {
    returnsFail(500, 'Nie udało się zapisać zdjęcia');
}

returnsRespond(200, array('success' => true, 'data' => array('token' => $token)));
