<?php

namespace App\Http;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request; // Importa la clase Request

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * Este es el método que hemos modificado.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Si la petición viene de nuestra API (y espera una respuesta JSON),
        // no intentes redirigir. En su lugar, Laravel devolverá automáticamente
        // un error 401 Unauthorized en formato JSON.
        return $request->expectsJson() ? null : route('login');
    }
}