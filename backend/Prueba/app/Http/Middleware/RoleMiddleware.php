<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string[]  ...$roles  Roles permitidos
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Verifica si el usuario está autenticado
        if (!Auth::check()) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        // Verifica si el usuario tiene uno de los roles permitidos
        if (!in_array(Auth::user()->rol->nombre_rol, $roles)) {
            return response()->json(['message' => 'Acceso no autorizado.'], 403);
        }

        // Si cumple, deja pasar la petición
        return $next($request);
    }
}