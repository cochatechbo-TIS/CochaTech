<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class IsAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Revisa si el usuario está autenticado y si el nombre de su rol es 'administrador'
        if (Auth::check() && Auth::user()->rol->nombre_rol === 'administrador') {
            // Si cumple, permite que la petición continúe hacia el controlador
            return $next($request);
        }

        // Si no cumple, rechaza la petición con un error 403 (Prohibido)
        return response()->json(['message' => 'Acceso no autorizado. Se requiere rol de administrador.'], 403);
    }
}