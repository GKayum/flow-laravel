<?php

namespace App\Helpers;

class Search
{
    public static function normalize(string $text) {
        // Замена всех символов в $text, которые не являются буквами, цифрами или @ . на пробелы
        $text = preg_replace('/[^\p{L}\p{N}@.]/u', ' ', $text);
        $text = mb_strtolower($text);
        // Замена последовательностей пробелов на одинарный пробел
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);

        return $text;
    }
}