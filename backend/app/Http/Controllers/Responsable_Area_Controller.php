<?php

namespace App\Http\Controllers;

use App\Models\Responsable_Area;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class Responsable_Area_Controller extends Controller
{
    // Listar SOLO los usuarios con rol = 2 (Responsables)
    public function index()
    {
        $usuarios = Responsable_Area::with('rol')
            ->where('id_rol', 2)
            ->get();

        return response()->json([
            'message' => 'Lista de responsables recuperada correctamente',
            'data' => $usuarios
        ]);
    }

    // Registrar usuario con rol = 2 (Responsable)
    public function store(Request $request)
    {
        try {
            $data = $request->only([
                'nombre',
                'apellidos',
                'ci',
                'email',
                'telefono',
                'area'
            ]);

            // Validación
            $validator = Validator::make($data, [
                'nombre' => 'required|string|max:20',
                'apellidos' => 'required|string|max:500',
                'ci' => 'required|string|max:50',
                'email' => 'required|email|max:50|unique:usuario,email',
                'telefono' => 'nullable|string|max:20',
                'area' => 'required|string|max:20',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Asignar rol = 2 (Responsable)
            $data['id_rol'] = 2;

            // Generar contraseña aleatoria segura
            $plainPassword = $this->generatePassword();
            $data['password'] = Hash::make($plainPassword);

            $usuario = Responsable_Area::create($data);

            return response()->json([
                'message' => 'Responsable registrado correctamente',
                'usuario' => $usuario,
                'password_generada' => $plainPassword
            ]);
        } catch (\Throwable $e) {
            Log::error('Error registrando responsable: '.$e->getMessage(), ['exception' => $e]);
            return response()->json([
                'message' => 'Error registrando responsable',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Actualizar SOLO si es rol = 2
    public function update(Request $request, $id)
    {
        try {
            $usuario = Responsable_Area::find($id);

            if (!$usuario || $usuario->id_rol != 2) {
                return response()->json(['message' => 'Solo se pueden actualizar responsables (id_rol = 2)'], 403);
            }

            $data = $request->only([
                'nombre',
                'apellidos',
                'ci',
                'email',
                'telefono',
                'area'
            ]);

            $validator = Validator::make($data, [
                'nombre' => 'nullable|string|max:20',
                'apellidos' => 'nullable|string|max:500',
                'ci' => 'nullable|string|max:50',
                'email' => 'nullable|email|max:50|unique:usuario,email,'.$id.',id_usuario',
                'telefono' => 'nullable|string|max:20',
                'area' => 'nullable|string|max:20',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $usuario->fill($data);
            $usuario->save();

            return response()->json([
                'message' => 'Responsable actualizado correctamente',
                'data' => $usuario
            ]);
        } catch (\Throwable $e) {
            Log::error('Error actualizando responsable: '.$e->getMessage(), ['exception' => $e]);
            return response()->json([
                'message' => 'Error actualizando responsable',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Eliminar SOLO si es rol = 2
    public function destroy($id)
    {
        $usuario = Responsable_Area::find($id);

        if (!$usuario || $usuario->id_rol != 2) {
            return response()->json(['message' => 'Solo se pueden eliminar responsables (id_rol = 2)'], 403);
        }

        $usuario->delete();

        return response()->json([
            'message' => 'Responsable eliminado correctamente'
        ]);
    }

    // Generar contraseña segura (8 caracteres)
    private function generatePassword($length = 8)
    {
        $upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lower = 'abcdefghijklmnopqrstuvwxyz';
        $numbers = '0123456789';
        $special = '@/#';
        $all = $upper.$lower.$numbers.$special;

        $password = $upper[rand(0, strlen($upper)-1)] .
                    $lower[rand(0, strlen($lower)-1)] .
                    $numbers[rand(0, strlen($numbers)-1)] .
                    $special[rand(0, strlen($special)-1)];

        for ($i = strlen($password); $i < $length; $i++) {
            $password .= $all[rand(0, strlen($all)-1)];
        }

        return str_shuffle($password);
    }
}
