<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    // Listar todos los usuarios
    public function index()
    {
        $usuarios = Usuario::with(['rol','area'])->get();

        return response()->json([
            'message' => 'Lista de usuarios recuperada correctamente',
            'data' => $usuarios
        ]);
    }

    // Registrar usuario con contraseña autogenerada
    public function store(Request $request)
    {
        try {
            $data = $request->only([
                'nombre', 'correo', 'telefono', 'id_rol', 'id_area'
            ]);

            // Validación
            $validator = Validator::make($data, [
                'nombre' => 'required|string|max:100',
                'correo' => 'required|string|email|max:100|unique:usuario,correo',
                'telefono' => 'nullable|string|max:20',
                'id_rol' => 'required|integer|exists:rol,id_rol',
                'id_area' => 'required|integer|exists:area,id_area',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Generar contraseña aleatoria
            $passwordPlain = $this->generatePassword();
            $data['password'] = Hash::make($passwordPlain); // guardamos el hash

            $usuario = Usuario::create($data);

            return response()->json([
                'message' => 'Usuario registrado correctamente',
                'usuario' => $usuario,
                'password_generada' => $passwordPlain // ⚠️ la devuelvo aquí SOLO para que el admin la vea
            ]);
        } catch (\Throwable $e) {
            Log::error('Store Usuario error: '.$e->getMessage(), ['exception' => $e]);
            return response()->json([
                'message' => 'Error registrando usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Actualizar usuario
    public function update(Request $request, $id)
    {
        try {
            $usuario = Usuario::find($id);

            if (!$usuario) {
                return response()->json(['message' => 'Usuario no encontrado'], 404);
            }

            $data = $request->only([
                'nombre', 'correo', 'telefono', 'id_rol', 'id_area'
            ]);

            $validator = Validator::make($data, [
                'nombre' => 'nullable|string|max:100',
                'correo' => 'nullable|string|email|max:100|unique:usuario,correo,'.$id.',id_usuario',
                'telefono' => 'nullable|string|max:20',
                'id_rol' => 'nullable|integer|exists:rol,id_rol',
                'id_area' => 'nullable|integer|exists:area,id_area',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $usuario->fill($data);
            $usuario->save();

            return response()->json([
                'message' => 'Usuario actualizado correctamente',
                'data' => $usuario
            ]);
        } catch (\Throwable $e) {
            Log::error('Update Usuario error: '.$e->getMessage(), ['exception' => $e]);
            return response()->json([
                'message' => 'Error actualizando usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Eliminar usuario
    public function destroy($id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $usuario->delete();

        return response()->json([
            'message' => 'Usuario eliminado correctamente'
        ]);
    }

    // Función privada para generar contraseñas seguras
    private function generatePassword($length = 8)
    {
        $upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lower = 'abcdefghijklmnopqrstuvwxyz';
        $numbers = '0123456789';
        $special = '@/#';

        $all = $upper.$lower.$numbers.$special;

        // Aseguramos que contenga al menos 1 de cada tipo
        $password = $upper[rand(0, strlen($upper)-1)] .
                    $lower[rand(0, strlen($lower)-1)] .
                    $numbers[rand(0, strlen($numbers)-1)] .
                    $special[rand(0, strlen($special)-1)];

        // Rellenar el resto
        for ($i = strlen($password); $i < $length; $i++) {
            $password .= $all[rand(0, strlen($all)-1)];
        }

        // Mezclar para no dejar en orden
        return str_shuffle($password);
    }
}
