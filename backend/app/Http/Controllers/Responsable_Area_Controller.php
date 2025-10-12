<?php

namespace App\Http\Controllers;

use App\Models\Responsable_Area;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class Responsable_Area_Controller extends Controller
{
    public function index()
{
    $responsables = Responsable_Area::with(['usuario.rol', 'area'])->get();

    $data = $responsables->map(function ($responsable) {
        return [
            'id_usuario' => $responsable->usuario->id_usuario,
            'nombre' => $responsable->usuario->nombre,
            'apellidos' => $responsable->usuario->apellidos,
            'ci' => $responsable->usuario->ci,
            'email' => $responsable->usuario->email,
            'telefono' => $responsable->usuario->telefono,
            'area' => $responsable->area->nombre,
            'id_rol' => $responsable->usuario->id_rol,
        ];
    });

    return response()->json([
        'message' => 'Lista de responsables recuperada correctamente',
        'data' => $data
    ]);
}

   public function store(Request $request)
    {
        try {
            $data = $request->only([
                'nombre', 'apellidos', 'ci', 'email', 'telefono', 'area'
            ]);

            $validator = Validator::make($data, [
                'nombre' => 'required|string|max:50',
                'apellidos' => 'required|string|max:100',
                'ci' => 'required|string|max:15',
                'email' => 'required|email|max:50|unique:usuario,email',
                'telefono' => 'nullable|string|max:15',
                'area' => 'required|string|max:50',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Buscar el área por nombre (ignora mayúsculas/minúsculas)
            $area = \App\Models\Area::whereRaw('LOWER(nombre) = ?', [strtolower($data['area'])])->first();

            // Si no existe el área, crearla
            if (!$area) {
                $area = \App\Models\Area::create([
                    'nombre' => $data['area']
                ]);
            }

            // Crear el usuario
            $plainPassword = $this->generatePassword();
            $usuario = \App\Models\Usuario::create([
                'nombre' => $data['nombre'],
                'apellidos' => $data['apellidos'],
                'ci' => $data['ci'],
                'email' => $data['email'],
                'telefono' => $data['telefono'] ?? null,
                'id_rol' => 2,
                'password' => Hash::make($plainPassword),
            ]);

            // Crear la relación responsable - área
            $responsable = \App\Models\Responsable_Area::create([
                'id_usuario' => $usuario->id_usuario,
                'id_area' => $area->id_area
            ]);

            return response()->json([
                'message' => 'Responsable registrado correctamente',
                'usuario' => $usuario,
                'area' => $area,
                'responsable' => $responsable,
                'password_generada' => $plainPassword
            ]);
        } catch (\Throwable $e) {
            Log::error('Error registrando responsable: '.$e->getMessage());
            return response()->json([
                'message' => 'Error registrando responsable',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $responsable = Responsable_Area::with('usuario')->find($id);

            if (!$responsable || $responsable->usuario->id_rol != 2) {
                return response()->json(['message' => 'Solo se pueden actualizar responsables'], 403);
            }

            $data = $request->only(['nombre','apellidos','ci','email','telefono','id_area']);
            $validator = Validator::make($data, [
                'nombre' => 'nullable|string|max:50',
                'apellidos' => 'nullable|string|max:100',
                'ci' => 'nullable|string|max:15',
                'email' => 'nullable|email|max:50|unique:usuario,email,'.$responsable->usuario->id_usuario.',id_usuario',
                'telefono' => 'nullable|string|max:8',
                'id_area' => 'nullable|exists:area,id_area',
            ]);

            if ($validator->fails()) {
                return response()->json(['message'=>'Errores de validación','errors'=>$validator->errors()], 422);
            }

            $responsable->usuario->update($data);
            if (isset($data['id_area'])) {
                $responsable->update(['id_area'=>$data['id_area']]);
            }

            return response()->json([
                'message'=>'Responsable actualizado correctamente',
                'data'=>$responsable->load('usuario','area')
            ]);
        } catch (\Throwable $e) {
            Log::error('Error actualizando responsable: '.$e->getMessage());
            return response()->json(['message'=>'Error actualizando responsable','error'=>$e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $responsable = Responsable_Area::with('usuario')->find($id);

        if (!$responsable || $responsable->usuario->id_rol != 2) {
            return response()->json(['message'=>'Solo se pueden eliminar responsables'], 403);
        }

        $responsable->usuario->delete();
        $responsable->delete();

        return response()->json(['message'=>'Responsable eliminado correctamente']);
    }

    private function generatePassword($length = 8)
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@/#';
        $password = '';
        for ($i=0; $i<$length; $i++) $password .= $chars[rand(0, strlen($chars)-1)];
        return $password;
    }
}
