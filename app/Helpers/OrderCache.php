<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Cache;

class OrderCache
{
    private const VERSION_KEY = 'orders.cache.version';

    /**
     * Hash da chave de cache
     * @return string
     */
    public static function key(string $scope, array $payload = []): string
    {
        ksort($payload);

        $hash = md5(http_build_query($payload));

        return "orders:v".self::version().":{$scope}:{$hash}";
    }

    /**
     * Adiciona versão de cache
     * @return void
     */
    public static function bump(): void
    {
        $version = self::version() + 1;

        Cache::forever(self::VERSION_KEY, $version);
    }

    /**
     * Tras a versão atual do cache de pedidos
     * @return int
     */
    private static function version(): int
    {
        return (int) Cache::get(self::VERSION_KEY, 1);
    }
}
